import { createTodo, deleteTodo, getTodos, updateTodo } from '../services/todo'
import { publicProcedure, router } from '../trpc'
import { z } from 'zod'

const createTodoPayload = z.object({
    task: z.string(),
})

const updateTodoPayload = z.object({
    id: z.number(),
    task: z.string().optional(),
    completed: z.boolean().optional(),
})

export const todoRouter = router({
    createTodo: publicProcedure.input(createTodoPayload).query(({ input }) => {
        createTodo(input)
    }),
    updateTodo: publicProcedure
        .input(updateTodoPayload)
        .query(async ({ input }) => await updateTodo(input)),
    deleteTodo: publicProcedure.input(z.number()).query(({ input }) => {
        deleteTodo(input)
    }),
    getTodos: publicProcedure.query(async () => {
        const todos = await getTodos()
        return todos
    }),
})
