import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
    type VerifiedRegistrationResponse,
} from '@simplewebauthn/server'
import type {
    AuthenticationResponseJSON,
    AuthenticatorTransportFuture,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../../../trpc'
import {
    consumeFootprint,
    deleteCurrentChallenge,
    findPristineFootprint,
    findUserByEmail,
    findUserBySessionToken,
    getCurrentChallenge,
    getFootprints,
    getSessions,
    getUserPasskeyByCredentialId,
    getUserPasskeys,
    getUsersWithDevices,
    handleRegister,
    handleSignIn,
    saveBotAttempt,
    saveNewPasskey,
    saveSession,
    saveUpdatedCounter,
    saveUser,
    sendLoginEmail,
    setCurrentAuthenticationOptions,
    setCurrentRegistrationOptions,
} from './dao'

const { BASE_URL, RP_ID } = process.env

// rp: relying party
const rpId = RP_ID || ''
const origin = BASE_URL || ''

const registerPayload = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Email is not valid' }),
})

const registrationVerificationPayload = z.object({
    email: z.string().email({ message: 'Email is not valid' }),
    registrationResponse: z.string(),
})

function isAuthenticatorTransportFuture(arg: unknown): arg is AuthenticatorTransportFuture[] {
    return Array.isArray(arg)
}

export const authRouter = router({
    RecordBotAttempt: publicProcedure.input(z.string()).query(async ({ input }) => {
        await saveBotAttempt(input)
    }),

    Register: publicProcedure.input(registerPayload).query(async ({ input }) => {
        try {
            await handleRegister({
                name: input.name,
                email: input.email,
            })
        } catch (err) {
            if (err instanceof TRPCError) {
                throw err // Directly re-throw the TRPCError
            }
            // Optionally, handle other types of errors or throw a generic error
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
            })
        }
    }),

    SignIn: publicProcedure.input(z.string()).query(async ({ input }) => {
        return await handleSignIn({ email: input })
    }),

    SendLoginEmail: publicProcedure.input(z.string()).query(async ({ input }) => {
        await sendLoginEmail(input)
    }),

    CreateUser: publicProcedure
        .input(z.object({ name: z.string(), email: z.string().email(), isAdmin: z.boolean() }))
        .query(async ({ input }) => {
            return await saveUser({
                name: input.name,
                email: input.email,
                isAdmin: input.isAdmin,
            })
        }),

    GetUser: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .query(async ({ input }) => {
            return await findUserByEmail(input.email)
        }),

    CreateSession: publicProcedure
        .input(z.object({ userUuid: z.string() }))
        .query(async ({ input }) => {
            return await saveSession({
                userUuid: input.userUuid,
                durationHours: 24,
            })
        }),

    GetUserBySessionToken: publicProcedure
        .input(z.object({ sessionToken: z.string().uuid() }))
        .query(async ({ input }) => {
            return await findUserBySessionToken(input.sessionToken)
        }),

    FindFootprintByTokenOrThrow: publicProcedure.input(z.string()).query(async ({ input }) => {
        const pristineFootprintId = await findPristineFootprint(input)
        if (!pristineFootprintId) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Pristine footprint not found' })
        }

        const consumedFootprintId = await consumeFootprint(pristineFootprintId)
        if (!consumedFootprintId) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to consume footprint',
            })
        }
    }),

    // webauthn registration step 1 (1 of 4 total)
    AuthGetRegistrationOptions: publicProcedure.input(z.string()).query(async ({ input }) => {
        const user = await findUserByEmail(input)

        if (!user) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
        }

        const userPasskeys = await getUserPasskeys(user)

        const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
            rpName: 'frontend-community',
            rpID: rpId,
            userName: user.name,
            attestationType: 'none',
            excludeCredentials: userPasskeys.map(passkey => {
                return {
                    id: passkey.id,
                    ...(isAuthenticatorTransportFuture(passkey.transports) && {
                        transports: passkey.transports,
                    }),
                }
            }),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                // optional
                authenticatorAttachment: 'platform',
            },
        })

        // remember the challenge for this user
        await setCurrentRegistrationOptions(options, user)

        return options
    }),

    // webauthn registration step 2 (2 of 4 total)
    AuthVerifyRegistrationResponse: publicProcedure
        .input(registrationVerificationPayload)
        .query(async ({ input }) => {
            const { email, registrationResponse } = input
            const data = JSON.parse(registrationResponse)
            const user = await findUserByEmail(email)

            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
            }

            const options = await getCurrentChallenge(user)
            const userPasskeys = await getUserPasskeys(user)

            if (!options) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Current challenge not found' })
            }

            let verification: VerifiedRegistrationResponse

            try {
                verification = await verifyRegistrationResponse({
                    response: data,
                    expectedChallenge: options.challenge,
                    expectedOrigin: origin,
                    expectedRPID: rpId,
                })
            } catch (_) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Verification registration failed',
                })
            }
            const { verified, registrationInfo } = verification

            if (verified && registrationInfo) {
                const {
                    credentialID,
                    credentialPublicKey,
                    counter,
                    credentialDeviceType,
                    credentialBackedUp,
                } = registrationInfo

                const existingDevice = userPasskeys.find(passkey => passkey.id === credentialID)

                if (!options.registrationOptionsUserId) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Registration options user id not found',
                    })
                }

                if (!existingDevice) {
                    const newPasskey = {
                        // `user` here is from Step 2
                        user,
                        // Created by `generateRegistrationOptions()` in Step 1
                        // webAuthnUserID: userPasskeys[0].current_challenge_id,
                        webAuthnUserID: options.registrationOptionsUserId,
                        // A unique identifier for the credential
                        id: credentialID,
                        // The public key bytes, used for subsequent authentication signature verification
                        publicKey: credentialPublicKey,
                        // The number of times the authenticator has been used on this site so far
                        counter,
                        // Whether the passkey is single-device or multi-device
                        deviceType: credentialDeviceType,
                        // Whether the passkey has been backed up in some way
                        backedUp: credentialBackedUp,
                        // `body` here is from Step 2
                        transports: data.response.transports,
                    }

                    /**
                     * Save the authenticator info so that we can
                     * get it by user ID later
                     */
                    await saveNewPasskey(newPasskey)
                }

                /**
                 * Once registration is complete, no need to keep the challenge around
                 */
                await deleteCurrentChallenge(options, user)

                return { ok: true }
            }
        }),

    // webauthn login step 1 (3 of 4 total)
    AuthGetLoginOptions: publicProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ input }) => {
            const user = await findUserByEmail(input.email)

            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
            }

            const userPasskeys = await getUserPasskeys(user)

            if (!userPasskeys) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
            }

            const options: PublicKeyCredentialRequestOptionsJSON =
                await generateAuthenticationOptions({
                    rpID: rpId,
                    allowCredentials: userPasskeys.map(passkey => {
                        return {
                            id: passkey.id,
                            ...(passkey.transports && {
                                transports: JSON.parse(passkey.transports),
                            }),
                        }
                    }),
                })

            // remember this challenge for this user
            await setCurrentAuthenticationOptions(options, user)

            return options
        }),

    // webauthn login step 2 (4 of 4 total)
    AuthVerifyLogin: publicProcedure
        .input(z.object({ email: z.string().email(), registrationDataString: z.string() }))
        .query(async ({ input }) => {
            const user = await findUserByEmail(input.email)

            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
            }

            const registrationResponseJSON: AuthenticationResponseJSON = JSON.parse(
                input.registrationDataString
            )

            if (!registrationResponseJSON.response.userHandle) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Registration options user id not found',
                })
            }

            const options = await getCurrentChallenge(user)

            if (!options) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Current challenge not found' })
            }

            const userPasskey = await getUserPasskeyByCredentialId(
                user,
                registrationResponseJSON.id
            )

            if (!userPasskey) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Passkeys not found' })
            }

            let verification
            try {
                verification = await verifyAuthenticationResponse({
                    response: registrationResponseJSON,
                    expectedChallenge: options.challenge,
                    expectedOrigin: origin,
                    expectedRPID: rpId,
                    authenticator: {
                        credentialID: userPasskey.id,
                        credentialPublicKey: new Uint8Array(userPasskey.public_key),
                        counter: userPasskey.counter,
                        ...(userPasskey.transports && {
                            transports: JSON.parse(userPasskey.transports),
                        }),
                    },
                })
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Verification failed'
                throw new TRPCError({ code: 'NOT_FOUND', message })
            }

            const { authenticationInfo, verified } = verification

            await saveUpdatedCounter(userPasskey.id, authenticationInfo.newCounter)

            /**
             * Once authentication is complete, no need to keep the challenge around
             */
            await deleteCurrentChallenge(options, user)

            return { verified, userUuid: user.uuid }
        }),

    // admin routes
    GetUsersWithDevices: publicProcedure.query(async () => {
        return await getUsersWithDevices()
    }),

    GetFootprints: publicProcedure.query(async () => {
        return await getFootprints()
    }),

    GetSessions: publicProcedure.query(async () => {
        return await getSessions()
    }),
})
