import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
    type VerifiedRegistrationResponse,
} from '@simplewebauthn/server'
import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types'
import { TRPCError } from '@trpc/server'
import base64url from 'base64url'
import { z } from 'zod'
import { publicProcedure, router } from '../../trpc'
import {
    consumeFootprint,
    findPristineFootprint,
    findUserByEmail,
    findUserBySessionToken,
    findUserWithWebAuthnByEmail,
    getFootprints,
    getSessions,
    getUsers,
    handleRegister,
    handleSignIn,
    saveBotAttempt,
    saveNewDevices,
    saveSession,
    saveUser,
    sendLoginEmail,
    updateUserWithCurrentChallenge,
    updateUserWithWebauthn,
} from '../services/auth'
import { getUint8ArrayFromArrayLikeObject } from '../utils'

const { BASE_URL, RP_ID } = process.env

// rp: relying party
const rpId = RP_ID || 'localhost'
const expectedOrigin = BASE_URL || ''
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
    data: z.any(),
})

export const authRouter = router({
    recordBotAttempt: publicProcedure.input(z.string()).query(async ({ input }) => {
        await saveBotAttempt(input)
    }),
    register: publicProcedure.input(registerPayload).query(async ({ input }) => {
        await handleRegister({
            name: input.name,
            email: input.email,
        })
    }),
    signIn: publicProcedure.input(signInPayload).query(async ({ input }) => {
        return await handleSignIn({ email: input.email })
    }),
    sendLoginEmail: publicProcedure.input(z.string()).query(async ({ input }) => {
        await sendLoginEmail(input)
    }),
    createUser: publicProcedure
        .input(z.object({ name: z.string(), email: z.string().email() }))
        .query(async ({ input }) => {
            return await saveUser({
                name: input.name,
                email: input.email,
            })
        }),
    getUser: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .query(async ({ input }) => {
            return await findUserByEmail(input.email)
        }),
    createSession: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await saveSession({
                userId: input.userId,
                durationHours: 24,
            })
        }),
    getUserBySessionToken: publicProcedure
        .input(z.object({ sessionToken: z.string().uuid() }))
        .query(async ({ input }) => {
            return await findUserBySessionToken(input.sessionToken)
        }),
    findFootprintByTokenOrThrow: publicProcedure.input(z.string()).query(async ({ input }) => {
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
    getWebAuthnRegistrationOptions: publicProcedure.input(z.string()).query(async ({ input }) => {
        const user = await findUserWithWebAuthnByEmail(input)

        if (!user) return null // throw tPRC error here

        const registrationOptions = generateRegistrationOptions({
            rpName: 'frontend-community',
            rpID: rpId,
            userID: user.email,
            userName: user.name,
            attestationType: 'none',
            /**
             * Passing in a user's list of already-registered authenticator IDs here prevents users from
             * registering the same device multiple times. The authenticator will simply throw an error in
             * the browser if it's asked to perform registration when one of these ID's already resides
             * on it.
             */
            excludeCredentials: user.devices
                ? user.devices.map(
                      (device: {
                          credentialID: AuthenticatorDevice['credentialID']
                          transports?: AuthenticatorDevice['transports']
                      }) => ({
                          id: Uint8Array.from(Object.values(device?.credentialID)),
                          type: 'public-key',
                          transports: device?.transports,
                      })
                  )
                : [],
        })

        await updateUserWithCurrentChallenge({
            userId: user.id,
            currentChallenge: (await registrationOptions).challenge,
        })

        return registrationOptions
    }),
    // webauthn registration step 2 (2 of 4 total)
    verifyWebAuthnRegistrationResponse: publicProcedure
        .input(registrationVerificationPayload)
        .query(async ({ input }) => {
            const { email, data: stringData } = input
            const data = JSON.parse(stringData)

            const user = await findUserWithWebAuthnByEmail(email)

            if (!user) return null // throw tPRC error here

            const expectedChallenge = user?.current_challenge as string // at this point, the value should be here

            let verification: VerifiedRegistrationResponse

            try {
                verification = await verifyRegistrationResponse({
                    response: data,
                    expectedChallenge,
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
                const { credentialPublicKey, credentialID, counter } = registrationInfo
                const uint8ArrayDevices = user.devices
                    ? user.devices.reduce((acc, cur) => {
                          const obj: AuthenticatorDevice = {
                              credentialPublicKey,
                              credentialID,
                              counter,
                          }
                          obj.credentialPublicKey = Uint8Array.from(
                              Object.values(cur.credentialPublicKey)
                          )
                          obj.credentialID = Uint8Array.from(Object.values(cur.credentialID))
                          obj.counter = cur.counter
                          acc.push(obj)
                          return acc
                      }, [] as AuthenticatorDevice[])
                    : []
                const existingDevice = user.devices
                    ? user.devices.find((device: AuthenticatorDevice) => {
                          return device.credentialID === credentialID
                      })
                    : false

                if (!existingDevice) {
                    const newDevice = {
                        credentialPublicKey,
                        credentialID,
                        counter,
                        transports: data.transports,
                    }
                    uint8ArrayDevices.push(newDevice)

                    await updateUserWithWebauthn(user.id)
                    await saveNewDevices({
                        userId: user.id,
                        devices: JSON.stringify(uint8ArrayDevices),
                    })
                }

                return { ok: true }
            }
        }),
    // webauthn login step 1 (3 of 4 total)
    webAuthnGetLoginOptions: publicProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ input }) => {
            const user = await findUserWithWebAuthnByEmail(input.email)

            if (!user) return null // throw tPRC error here

            const response = generateAuthenticationOptions({
                allowCredentials: user.devices
                    ? user.devices.map(
                          (authenticator: {
                              credentialID: AuthenticatorDevice['credentialID']
                              transports?: AuthenticatorDevice['transports']
                          }) => {
                              return {
                                  id: getUint8ArrayFromArrayLikeObject(authenticator.credentialID),
                                  type: 'public-key',
                                  transports: authenticator?.transports, // Optional
                              }
                          }
                      )
                    : [],
                userVerification: 'preferred',
            })

            challenge = (await response).challenge

            return response
        }),
    // webauthn login step 2 (4 of 4 total)
    webAuthnVerifyLogin: publicProcedure
        .input(z.object({ email: z.string().email(), registrationDataParsed: z.any() }))
        .query(async ({ input }) => {
            const user = await findUserWithWebAuthnByEmail(input.email)

            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
            }

            if (!user.devices) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'User device not found' })
            }

            let dbAuthenticator
            const bodyCredIDBuffer = base64url.toBuffer(input.registrationDataParsed.rawId)

            for (const device of user.devices) {
                const currentCredential = Buffer.from(
                    getUint8ArrayFromArrayLikeObject(device.credentialID)
                )
                if (bodyCredIDBuffer.equals(currentCredential)) {
                    dbAuthenticator = device
                    break
                }
            }

            if (dbAuthenticator) {
                const verification = await verifyAuthenticationResponse({
                    response: input.registrationDataParsed,
                    expectedChallenge: challenge,
                    expectedOrigin,
                    expectedRPID: rpId,
                    authenticator: {
                        ...dbAuthenticator,
                        credentialPublicKey: Buffer.from(
                            getUint8ArrayFromArrayLikeObject(dbAuthenticator.credentialPublicKey)
                        ),
                    },
                })

                return { userId: user.id, verified: verification.verified }
            } else {
                console.error('NO dbAuthenticator found')
            }
        }),
    // admin routes
    getUsers: publicProcedure.query(async () => {
        return await getUsers()
    }),
    getFootprints: publicProcedure.query(async () => {
        return await getFootprints()
    }),
    getSessions: publicProcedure.query(async () => {
        return await getSessions()
    }),
})
