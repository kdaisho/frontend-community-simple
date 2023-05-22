import { initTRPC } from '@trpc/server'
import z from 'zod'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import express from 'express'
import cors from 'cors'
import { createTodo, getTodos, deleteTodo } from './todo'

const t = initTRPC.create()

console.log('==>', 'WOW')

const createTodoPayload = z.object({
    title: z.string(),
    completed: z.boolean(),
})

const getTodoPayload = z.object({
    filter: z.boolean().optional(),
})

const appRouter = t.router({
    createTodo: t.procedure.input(createTodoPayload).query(({ input }) => {
        createTodo(input)
    }),
    deleteTodo: t.procedure.input(z.number()).query(({ input }) => {
        deleteTodo(input)
    }),
    getTodos: t.procedure.input(getTodoPayload).query(({ input }) => {
        return getTodos(input)
    }),
})

export type AppRouter = typeof appRouter

async function server() {
    const app = express()
    app.use(cors())
    app.use((req, _res, next) => {
        console.log('==>', req.method, req.url)
        next()
    })

    app.use('/trpc', createExpressMiddleware({ router: appRouter }))

    app.get('/', (_req, res) => res.send('help!'))
    app.listen(3001, () => {
        console.log('listening on port 3001')
    })
}

server()
