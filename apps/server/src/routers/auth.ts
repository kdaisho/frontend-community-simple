import {
    type VerifiedRegistrationResponse,
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server'
import {
    consumeFootprint,
    findCurrentChallenge,
    findLoginOptions,
    findPristineFootprint,
    findRegisteredDevices,
    findUserByEmail,
    findUserBySessionToken,
    findUserWithWebAuthnByEmail,
    handleRegister,
    handleSignIn,
    saveNewDevices,
    saveSession,
    saveUser,
    sendLoginEmail,
    updateUserWithCurrentChallenge,
    updateUserWithWebauthn,
    // updateWebauthnWithCurrentChallenge,
} from '../services/auth'
import { publicProcedure, router } from '../../trpc'
import { TRPCError } from '@trpc/server'
import base64url from 'base64url'
import { getUint8ArrayFromArrayLikeObject } from '../utils'
import { z } from 'zod'

console.log('==> base64', base64url)
console.log('==> base64', typeof base64url)

// rp: relying party
const rpId = 'localhost'
const protocol = 'http'
const port = 5173
const expectedOrigin = `${protocol}://${rpId}:${port}`
let dynamicChallenge: string

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
    register: publicProcedure.input(registerPayload).query(async ({ input }) => {
        await handleRegister({
            name: input.name,
            email: input.email,
        })
    }),
    signIn: publicProcedure.input(signInPayload).query(async ({ input }) => {
        console.log('==> KOOOO', input)
        return await handleSignIn({ email: input.email })
    }),
    sendLoginEmail: publicProcedure.input(z.string()).query(async ({ input }) => {
        await sendLoginEmail(input)
    }),
    createUser: publicProcedure
        .input(z.object({ name: z.string(), email: z.string().email() }))
        .query(async ({ input }) => {
            console.log('==> SAVING THIS', input)
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
                durationHours: 3,
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
    // 1st
    getWebAuthnRegistrationOptions: publicProcedure.input(z.string()).query(async ({ input }) => {
        console.log('==> ROUTER P1', input)
        const user = await findUserWithWebAuthnByEmail(input)

        if (!user) return null // throw tPRC error here

        console.log('==> U', user)

        // const deviceList = user.devices ? JSON.parse(user.devices) : null

        // const webauthn = await findRegisteredDevices(user.id)

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
                          credentialID: { [s: string]: number } | ArrayLike<number>
                          transports: any
                      }) => ({
                          id: Uint8Array.from(Object.values(device?.credentialID)),
                          type: 'public-key',
                          transports: device?.transports,
                      })
                  )
                : [],
        })

        // console.log('==> IS THIS SAVING DEVICES TO DB?', user.id) // not yet, we jus provide the options for registration

        await updateUserWithCurrentChallenge({
            userId: user.id,
            currentChallenge: registrationOptions.challenge,
        })

        // await updateWebauthnWithCurrentChallenge({
        //     userId: user.id,
        //     currentChallenge: registrationOptions.challenge,
        // })

        return registrationOptions
    }),
    // 2nd
    verifyWebAuthnRegistrationResponse: publicProcedure
        .input(registrationVerificationPayload)
        .query(async ({ input }) => {
            console.log('==> verifyWebAuthnRegistrationResponse 1', input)
            const { email, data: stringData } = input
            const data = JSON.parse(stringData)

            const user = await findUserWithWebAuthnByEmail(email)

            if (!user) return null // throw tPRC error here

            const expectedChallenge = user?.current_challenge as string // at this point, the value should be here

            console.log('==> verifyWebAuthnRegistrationResponse 2', expectedChallenge)

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

            console.log('==> ohhhhhh PARSING 1', typeof user.devices)
            console.log('==> ohhhhhh PARSING 2', user.devices)

            // at this point, user.devices can be, highly likely, null so JSON.parse runs without any problem (null is part of JSON), no error thrown.
            // this conversion may not necessary then?

            // const deviceList = user.devices ? JSON.parse(user.devices) : null

            if (verified && registrationInfo) {
                const { credentialPublicKey, credentialID, counter } = registrationInfo
                // convert stringified Uint8Array into real Uint8Array
                const uint8ArrayDevices = user.devices
                    ? user.devices.reduce(
                          (
                              acc: any,
                              cur: {
                                  credentialPublicKey: ArrayLike<number> | { [s: string]: number }
                                  credentialID: ArrayLike<number> | { [s: string]: number }
                                  counter: number | undefined
                              }
                          ) => {
                              const obj: Partial<typeof registrationInfo> = {
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
                          },
                          []
                      )
                    : []
                const existingDevice = user.devices
                    ? user.devices.find((device: Record<string, Uint8Array>) => {
                          return device.credentialID === credentialID
                      })
                    : false

                console.log('==> SAVING NEW DEVICES 0', existingDevice)

                if (!existingDevice) {
                    const newDevice = {
                        credentialPublicKey,
                        credentialID,
                        counter,
                        transports: data.transports,
                    }
                    uint8ArrayDevices.push(newDevice)

                    console.log('==> SAVING NEW DEVICES 1', uint8ArrayDevices)

                    await updateUserWithWebauthn(user.id)
                    await saveNewDevices({
                        userId: user.id,
                        devices: JSON.stringify(uint8ArrayDevices),
                    })
                }
                console.log('==>', 'DONE')
                return { ok: true }
            }
        }),
    // 3rd
    getWebAuthnLoginOptions: publicProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ input }) => {
            const user = await findUserWithWebAuthnByEmail(input.email)

            if (!user) return null // throw tPRC error here

            const response = generateAuthenticationOptions({
                allowCredentials: user.devices
                    ? user.devices.map(
                          (authenticator: {
                              credentialID: ArrayLike<number> | { [s: string]: number }
                              transports: unknown
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
                rpID: rpId,
            })

            console.log('==> response:', response)

            dynamicChallenge = response.challenge

            console.log('==> response: dynamic challenge', dynamicChallenge)

            return response
        }),
    // 4th
    verifyWebAuthnLogin: publicProcedure
        .input(z.object({ email: z.string().email(), registrationDataParsed: z.any() }))
        .query(async ({ input }) => {
            console.log('==>', input)
            console.log('==> verifyWebAuthnLogin 1', input.registrationDataParsed)
            const user = await findUserWithWebAuthnByEmail(input.email)
            console.log('==> USER', user)
            if (!user) return null // throw tPRC error here
            // user would look like this;
            // {
            //     id: 'ad59b5da-cda8-484f-9d5a-02ad5f032350',
            //     name: 'aa',
            //     email: 'aa@aa.aa',
            //     current_challenge: '0shB7pcflFMDBSU73X7nV-ne26OlGQ94xhImYDRrGQ4',
            //     devices: [
            //         {
            //             credentialPublicKey: [Object],
            //             credentialID: [Object],
            //             counter: 0,
            //         },
            //     ],
            //     webauthn: true,
            // }
            const expectedChallenge = user.current_challenge
            let dbAuthenticator
            console.log('==>', 'try 1')
            const bodyCredIDBuffer = base64url.toBuffer(input.registrationDataParsed.rawId)
            console.log('==>', 'try 2', bodyCredIDBuffer)
            for (const device of user.devices) {
                const currentCredential = Buffer.from(
                    getUint8ArrayFromArrayLikeObject(device.credentialID)
                )
                console.log('==>', 'try 3', currentCredential)
                if (bodyCredIDBuffer.equals(currentCredential)) {
                    dbAuthenticator = device
                    break
                }
            }
            if (!dbAuthenticator) {
                console.error('NO dbAuthenticator found')
            }
            console.log('==> I am going to use this challenge!', dynamicChallenge)
            console.log('==> bodyCredIDBuffer', bodyCredIDBuffer) // we finally reached here
            const verification = await verifyAuthenticationResponse({
                response: input.registrationDataParsed,
                // expectedChallenge: user.current_challenge as string,
                expectedChallenge: dynamicChallenge,
                expectedOrigin,
                expectedRPID: rpId,
                authenticator: {
                    ...dbAuthenticator,
                    credentialPublicKey: Buffer.from(
                        getUint8ArrayFromArrayLikeObject(dbAuthenticator.credentialPublicKey)
                    ),
                },
            })
            console.log('==> LAST', verification) // yatta!!
        }),
})
