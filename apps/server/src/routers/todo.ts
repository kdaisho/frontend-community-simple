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
    CreateTodo: publicProcedure.input(createTodoPayload).query(async ({ input }) => {
        await createTodo(input)
    }),
    UpdateTodo: publicProcedure
        .input(updateTodoPayload)
        .query(async ({ input }) => await updateTodo(input)),
    DeleteTodo: publicProcedure.input(z.string()).query(async ({ input }) => {
        await deleteTodo(input)
    }),
    GetTodos: publicProcedure.input(z.string()).query(async ({ input }) => {
        return await getTodos(input)
    }),
})
