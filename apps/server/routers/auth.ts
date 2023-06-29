import { findUser, handleRegister, handleSignIn, saveSession, saveUser } from '../services/auth'
import { publicProcedure, router } from '../trpc'
import { z } from 'zod'

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
            return await findUser(input.email)
        }),
    createSession: publicProcedure
        .input(z.object({ userId: z.number() }))
        .query(async ({ input }) => {
            return await saveSession({
                userId: input.userId,
                durationHours: 3,
            })
        }),
})
