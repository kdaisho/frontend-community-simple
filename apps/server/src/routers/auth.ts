import {
    type VerifiedRegistrationResponse,
    generateAuthenticationOptions,
    generateRegistrationOptions,
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
    updateUserWithCurrentChallenge,
    updateUserWithWebauthn,
    // updateWebauthnWithCurrentChallenge,
} from '../services/auth'
import { publicProcedure, router } from '../../trpc'
import { TRPCError } from '@trpc/server'
import { getCredentialIdFromStringifiedDevices } from '../utils'
import { z } from 'zod'

// rp: relying party
const rpId = 'localhost'
const protocol = 'http'
const port = 5173
const expectedOrigin = `${protocol}://${rpId}:${port}`

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
        return await handleSignIn({ email: input.email })
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

        const deviceList = user.devices ? JSON.parse(user.devices) : null

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
            excludeCredentials: deviceList
                ? deviceList.map(
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

            const deviceList = user.devices ? JSON.parse(user.devices) : null

            if (verified && registrationInfo) {
                const { credentialPublicKey, credentialID, counter } = registrationInfo
                // convert stringified Uint8Array into real Uint8Array
                const uint8ArrayDevices = deviceList
                    ? deviceList.reduce(
                          (
                              acc: Partial<typeof registrationInfo>[],
                              cur: typeof registrationInfo
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
                const existingDevice = deviceList
                    ? deviceList.find((device: Record<string, Uint8Array>) => {
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
    getWebAuthnLoginOptions: publicProcedure.input(z.string()).query(async ({ input }) => {
        const devices = await findLoginOptions(input)
        console.log('==> Extracted devices', devices)
        console.log('==> Extracted devices type', Array.isArray(devices)) // somehow it's already array of objects
        // Require users to use a previously-registered loginOptions

        const options = generateAuthenticationOptions({
            // allowCredentials: devices.map(
            //     (authenticator: { credentialID: any; transports?: any }) => {
            //         console.log('==> Extracted MAP', authenticator.credentialID)

            //         const yey = getCredentialIdFromStringifiedDevices(authenticator.credentialID)

            //         console.log('==> Extracted MAP', yey)

            //         const myObj = {
            //             // id: authenticator.credentialID,
            //             id: yey,
            //             type: 'public-key',
            //             // Optional
            //             transports: authenticator?.transports,
            //         }
            //         console.log('==> Extracted RESULT', myObj)
            //         return myObj
            //     }
            // ),
            allowCredentials: [], //temporary
            userVerification: 'preferred',
            // rpID: rpId,
        })

        // console.log('==> OPTIONS', options)
        return options
    }),
})
