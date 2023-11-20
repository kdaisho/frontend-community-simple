import { z } from 'zod'
import { publicProcedure, router } from '../../trpc'
import { createTodo, deleteTodo, getTodos, updateTodo } from '../services/todo'

const createTodoPayload = z.object({
    userId: z.string(),
    task: z.string(),
})

const updateTodoPayload = z.object({
    id: z.string(),
    task: z.string().optional(),
    completed: z.boolean().optional(),
})

export const todoRouter = router({
    createTodo: publicProcedure.input(createTodoPayload).query(async ({ input }) => {
        await createTodo(input)
    }),
    updateTodo: publicProcedure
        .input(updateTodoPayload)
        .query(async ({ input }) => await updateTodo(input)),
    deleteTodo: publicProcedure.input(z.string()).query(async ({ input }) => {
        await deleteTodo(input)
    }),
    getTodos: publicProcedure.input(z.string()).query(async ({ input }) => {
        return await getTodos(input)
    }),
})
