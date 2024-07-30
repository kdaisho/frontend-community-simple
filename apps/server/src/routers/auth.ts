import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    VerifiedRegistrationResponse,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server'
import type {
    AuthenticationResponseJSON,
    AuthenticatorTransportFuture,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { Passkey, User } from '../../database/types'
import { publicProcedure, router } from '../../trpc'
import {
    consumeFootprint,
    findPristineFootprint,
    findUserByEmail,
    findUserBySessionToken,
    getFootprints,
    getSessions,
    getSpecificUserPasskeys,
    getUserPasskeys,
    getUsersWithDevices,
    handleRegister,
    handleSignIn,
    saveBotAttempt,
    saveNewPasskeyInDB,
    saveSession,
    saveUser,
    sendLoginEmail,
    setCurrentAuthenticationOptions,
    setCurrentRegistrationOptions,
} from '../services/auth'

const { BASE_URL, RP_ID } = process.env

// rp: relying party
const rpId = RP_ID || 'localhost'
const expectedOrigin = BASE_URL || ''
const origin = `http://${rpId}:5173` // TODO: enable https for local development so that i can use this in production

let challenge: string

const registerPayload = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Email is not valid' }),
})

const signInPayload = z.object({
    email: z.string().email({ message: 'Email is not valid' }),
})

const registrationVerificationPayload = z.object({
    email: z.string().email({ message: 'Email is not valid' }),
    registrationResponse: z.string(),
})

function isAuthenticatorTransportFuture(arg: unknown): arg is AuthenticatorTransportFuture[] {
    console.log('==> TRANSPORTS', arg)
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
    // .input(z.object({ email: z.string() }))
    // SignIn: publicProcedure.input(signInPayload).query(async ({ input }) => {
    //     console.log('==>', '======================== boom', input)
    //     return await handleSignIn({ email: input.email })
    // }),
    SignIn: publicProcedure.input(z.string()).query(async ({ input }) => {
        console.log('==>', '======================== boom', input)
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
        // const user = await findUserWithWebAuthnByEmail(input)
        const user = await findUserByEmail(input)

        if (!user) return null // throw tPRC error here

        // @ts-expect-error // TODO: fix this
        const userPasskeys: Passkey[] = await getUserPasskeys(user as unknown as User)

        console.log('==> step1', { userPasskeys })

        const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
            rpName: 'frontend-community',
            rpID: rpId,
            userName: user.name,
            attestationType: 'none',
            excludeCredentials: userPasskeys.map(passkey => {
                return {
                    id: passkey.current_challenge_id,
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

        console.log('==> YES1', { options })
        console.log('==> YES2', options.pubKeyCredParams)

        // remember these options for the user
        await setCurrentRegistrationOptions(user as unknown as User, options)

        // await createPasskey({
        //     currentChallengeId: options.challenge,
        //     webauthnUserId: options.user.id,
        //     userUuid: user.uuid,
        //     pubKeyCredParams: options.pubKeyCredParams,
        // })

        return options
    }),
    // webauthn registration step 2 (2 of 4 total)
    AuthVerifyRegistrationResponse: publicProcedure
        .input(registrationVerificationPayload)
        .query(async ({ input }) => {
            const { email, registrationResponse } = input
            const data = JSON.parse(registrationResponse)

            console.log('==> step2', { data })

            // const user = await findUserWithWebAuthnByEmail(email)
            const user = await findUserByEmail(email)

            console.log('==>', { user }) // user & passkey info both included

            if (!user) return // TODO: throw PRC error here

            // @ts-expect-error // TODO: fix the created_at type
            const userPasskeys: Passkey[] = await getUserPasskeys(user as unknown as User)

            console.log('==> step2', { userPasskeys }) // user & passkey info both included

            let verification: VerifiedRegistrationResponse

            try {
                verification = await verifyRegistrationResponse({
                    response: data,
                    expectedChallenge: userPasskeys[0].current_challenge_id,
                    expectedOrigin,
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
                console.log('==>', { verified })
                console.log('==>', { registrationInfo })

                const {
                    credentialID,
                    credentialPublicKey,
                    counter,
                    credentialDeviceType,
                    credentialBackedUp,
                } = registrationInfo

                const newPasskey = {
                    // `user` here is from Step 2
                    user,
                    // Created by `generateRegistrationOptions()` in Step 1
                    // webAuthnUserID: userPasskeys[0].current_challenge_id,
                    webAuthnUserID: userPasskeys[0].webauthn_user_id, // ywbj0zm...
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

                // Save the authenticator info so that we can
                // get it by user ID later
                await saveNewPasskeyInDB(newPasskey)

                //   await saveNewDevices({
                //       userUuid: user.uuid,
                //       devices: JSON.stringify(uint8ArrayDevices),
                //   })

                return { ok: true }
            }
        }),
    // // webauthn login step 1 (3 of 4 total)
    AuthGetLoginOptions: publicProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ input }) => {
            const user = await findUserByEmail(input.email)
            // const userPasskeys = await findUserWithWebAuthnByEmail(input.email)

            if (!user) return // throw tPRC error here

            // @ts-expect-error // TODO: fix this
            const userPasskeys: Passkey[] = await getUserPasskeys(user as unknown as User)

            console.log('==> step3', { userPasskeys })

            if (!userPasskeys) return null // throw tPRC error here

            const options: PublicKeyCredentialRequestOptionsJSON =
                await generateAuthenticationOptions({
                    rpID: rpId,

                    // Require users to use a previously-registered authenticator (what do you mean by "previously-registered"?)
                    allowCredentials: userPasskeys.map(passkey => {
                        console.log('==> EACH', passkey)
                        return {
                            // id: passkey.current_challenge_id,
                            id: passkey.id,
                            // id: passkey.webauthn_user_id,
                            // type: 'public-key',
                            // transports:
                            //     passkey.transports as unknown as AuthenticatorTransportFuture[],
                            transports: ['internal'],
                        }
                    }),
                    // allowCredentials: user.devices
                    //     ? user.devices.map(
                    //           (authenticator: {
                    //               credentialID: AuthenticatorDevice['credentialID']
                    //               transports?: AuthenticatorDevice['transports']
                    //           }) => {
                    //               return {
                    //                   id: getUint8ArrayFromArrayLikeObject(authenticator.credentialID),
                    //                   type: 'public-key',
                    //                   transports: authenticator?.transports, // Optional
                    //               }
                    //           }
                    //       )
                    //     : [],
                    // userVerification: 'preferred',
                })

            console.log('==> PASS THE OPTIONS', { options })
            console.log('==> PASS THE ALLOW CREDENTIALS', options.allowCredentials)

            // remember this challenge for this user
            await setCurrentAuthenticationOptions(options, user.uuid)

            // challenge = (await response).challenge

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

            console.log('can i read?', input.registrationDataString) // string, need to parse

            const registrationResponseJSON: AuthenticationResponseJSON = JSON.parse(
                input.registrationDataString
            )

            // @ts-expect-error // TODO: fix this
            const userPasskey: Passkey = await getSpecificUserPasskeys(
                user as unknown as User,
                registrationResponseJSON.id
            )

            console.log('==> step4', { userPasskey })

            if (!userPasskey) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Passkeys not found' })
            }

            let verification
            try {
                verification = await verifyAuthenticationResponse({
                    response: registrationResponseJSON,
                    expectedChallenge: userPasskey.current_challenge_id,
                    expectedOrigin: origin,
                    expectedRPID: rpId,
                    authenticator: {
                        credentialID: userPasskey.current_challenge_id,
                        credentialPublicKey: new Uint8Array(userPasskey.public_key),
                        counter: userPasskey.counter,
                        transports: ['internal'],
                    },
                })
            } catch (err) {
                console.error('==> BOOM', err)
            }

            console.log('==> DONE', { verification })

            // const registrationData = JSON.parse(input.registrationDataString)

            // let dbAuthenticator
            // const bodyCredIDBuffer = base64url.toBuffer(registrationData.rawId)

            // for (const device of user.devices) {
            //     const currentCredential = Buffer.from(
            //         getUint8ArrayFromArrayLikeObject(device.credentialID)
            //     )
            //     if (bodyCredIDBuffer.equals(currentCredential)) {
            //         dbAuthenticator = device
            //         break
            //     }
            // }

            // if (dbAuthenticator) {
            //     const verification = await verifyAuthenticationResponse({
            //         response: registrationData,
            //         expectedChallenge: challenge,
            //         expectedOrigin,
            //         expectedRPID: rpId,
            //         authenticator: {
            //             ...dbAuthenticator,
            //             credentialPublicKey: Buffer.from(
            //                 getUint8ArrayFromArrayLikeObject(dbAuthenticator.credentialPublicKey)
            //             ),
            //         },
            //     })

            //     return { userUuid: user.uuid, verified: verification.verified }
            // } else {
            //     console.error('NO dbAuthenticator found')
            // }
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
