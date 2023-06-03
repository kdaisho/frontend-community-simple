import { appRouter } from './routers'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import express from 'express'

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
