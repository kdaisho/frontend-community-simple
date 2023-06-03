import { createTodo, deleteTodo, getTodos, updateTodo } from './services/todo'
import { initTRPC } from '@trpc/server'
import z from 'zod'

const t = initTRPC.create()

const createTodoPayload = z.object({
    task: z.string(),
})

const updateTodoPayload = z.object({
    id: z.number(),
    task: z.string().optional(),
    completed: z.boolean().optional(),
})

export const appRouter = t.router({
    createTodo: t.procedure.input(createTodoPayload).query(({ input }) => {
        createTodo(input)
    }),
    updateTodo: t.procedure
        .input(updateTodoPayload)
        .query(async ({ input }) => await updateTodo(input)),
    deleteTodo: t.procedure.input(z.number()).query(({ input }) => {
        deleteTodo(input)
    }),
    getTodos: t.procedure.query(async () => {
        const todos = await getTodos()
        return todos
    }),
})

export type AppRouter = typeof appRouter
