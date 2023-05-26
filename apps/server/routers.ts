import { initTRPC } from '@trpc/server'
import z from 'zod'
import { getTodos, createTodo, deleteTodo } from './services/todo'

const t = initTRPC.create()

const createTodoPayload = z.object({
    task: z.string(),
    completed: z.boolean(),
})

export const appRouter = t.router({
    createTodo: t.procedure.input(createTodoPayload).query(({ input }) => {
        createTodo(input)
    }),
    deleteTodo: t.procedure.input(z.number()).query(({ input }) => {
        deleteTodo(input)
    }),
    getTodos: t.procedure.query(async () => {
        const todos = await getTodos()
        return todos
    }),
})

export type AppRouter = typeof appRouter
