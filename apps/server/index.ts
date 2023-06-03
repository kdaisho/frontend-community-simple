import { createExpressMiddleware } from '@trpc/server/adapters/express'
import express from 'express'
import cors from 'cors'
import { appRouter } from './routers'

async function server() {
    const app = express()
    app.use(cors())
    app.use((req, _res, next) => {
        next()
    })

    app.use('/trpc', createExpressMiddleware({ router: appRouter }))

    app.listen(3001, () => {
        console.log('listening on port 3001')
    })
}

server()
