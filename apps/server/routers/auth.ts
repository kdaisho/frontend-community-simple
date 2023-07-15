import {
    consumeFootprint,
    findPristineFootprint,
    findUserByEmail,
    findUserBySessionToken,
    // findUserDevices,
    handleRegister,
    handleSignIn,
    saveSession,
    saveUser,
    updateWebauthnWithCurrentChallenge,
} from '../services/auth'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
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

        if (!user) {
            return
        }

        // const webauthn = await findUserDevices(user.id)
        // const devices = JSON.parse(webauthn.devices) as Record<string, unknown>[]

        const registrationOptions = generateRegistrationOptions({
            rpName: 'frontend-community',
            rpID: rpId,
            userID: user.email,
            userName: user.name,
            attestationType: 'none',
        })
        await updateWebauthnWithCurrentChallenge({
            userId: user.id,
            currentChallenge: registrationOptions.challenge,
        })

        return registrationOptions
    }),
})
