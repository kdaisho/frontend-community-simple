import { mergeRouters } from '../../trpc'
import { authRouter } from './auth'
import { fileRouter } from './file'
import { todoRouter } from './todo'

export const appRouter = mergeRouters(authRouter, fileRouter, todoRouter)

export type AppRouter = typeof appRouter
