import {
    type VerifiedRegistrationResponse,
    generateRegistrationOptions,
    verifyRegistrationResponse,
} from '@simplewebauthn/server'
import {
    consumeFootprint,
    findCurrentChallenge,
    findPristineFootprint,
    findRegisteredDevices,
    findUserByEmail,
    findUserBySessionToken,
    handleRegister,
    handleSignIn,
    saveNewDevices,
    saveSession,
    saveUser,
    updateUserWithWebauthn,
    updateWebauthnWithCurrentChallenge,
} from '../services/auth'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
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
    userId: z.string(),
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
    getRegistrationOptions: publicProcedure.input(z.string()).query(async ({ input }) => {
        const user = await findUserByEmail(input)

        if (!user) return null // throw tPRC error here

        const webauthn = await findRegisteredDevices(user.id)

        const registrationOptions = generateRegistrationOptions({
            rpName: 'frontend-community',
            rpID: rpId,
            userID: user.email,
            userName: user.name,
            attestationType: 'none',
            excludeCredentials: webauthn?.devices
                ? webauthn.devices.map(
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

        await updateWebauthnWithCurrentChallenge({
            userId: user.id,
            currentChallenge: registrationOptions.challenge,
        })

        return registrationOptions
    }),
    verifyWebauthnRegistrationResponse: publicProcedure
        .input(registrationVerificationPayload)
        .query(async ({ input }) => {
            const { userId } = input
            const { current_challenge: currentChallenge, devices } = await findCurrentChallenge(
                userId
            )
            const data = JSON.parse(input.data)
            let verification: VerifiedRegistrationResponse

            try {
                verification = await verifyRegistrationResponse({
                    response: data,
                    expectedChallenge: currentChallenge,
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

                // convert stringified Uint8Array into real Uint8Array
                const uint8ArrayDevices = devices
                    ? devices.reduce(
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

                const existingDevice = devices
                    ? devices.find((device: Record<string, Uint8Array>) => {
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

                    await updateUserWithWebauthn(userId)
                    await saveNewDevices({ userId, devices: JSON.stringify(uint8ArrayDevices) })
                }

                console.log('==>', 'DONE')

                return { ok: true }
            }
        }),
})
