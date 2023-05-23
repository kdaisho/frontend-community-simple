import { initTRPC } from '@trpc/server'
import z from 'zod'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import express from 'express'
import cors from 'cors'
import { getTodos, createTodo, deleteTodo } from './services/todo'

const t = initTRPC.create()

console.log('==>', 'WOW')

const createTodoPayload = z.object({
    task: z.string(),
    completed: z.boolean(),
})

// const getTodoPayload = z.object({
//     filter: z.boolean().optional(),
// })

const appRouter = t.router({
    createTodo: t.procedure.input(createTodoPayload).query(({ input }) => {
        createTodo(input)
    }),
    deleteTodo: t.procedure.input(z.number()).query(({ input }) => {
        deleteTodo(input)
    }),
    getTodos: t.procedure.query(() => {
        const todos = getTodos()
        console.log('wai wai 3223 ==>', todos)
        return todos
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
