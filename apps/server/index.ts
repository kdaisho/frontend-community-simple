import dotenv from 'dotenv'
dotenv.config()
// eslint-disable-next-line sort-imports
import { TRPCError } from '@trpc/server'
import { appRouter } from './src/routers'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import express from 'express'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'

async function server() {
    const app = express()
    app.use(cors())
    app.use(
        '/trpc',
        createExpressMiddleware({
            router: appRouter,
            onError: opts => {
                let log: {
                    statusCode: number
                    data: typeof opts.error | Partial<typeof opts.error>
                }

                if (opts.error instanceof TRPCError) {
                    log = {
                        statusCode: getHTTPStatusCodeFromError(opts.error),
                        data: opts.error,
                    }
                } else {
                    log = {
                        statusCode: 500,
                        data: { message: 'Unknown error occurred' },
                    }
                }
            },
        })
    )

    app.listen(3001, () => {
        console.log('Server: listening on port 3001')
    })
}

server()
