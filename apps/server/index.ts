import dotenv from 'dotenv'
dotenv.config()
// eslint-disable-next-line sort-imports
import { TRPCError } from '@trpc/server'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import cors from 'cors'
import express from 'express'
import { appRouter } from './src/services'

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
                console.error(log)
            },
        })
    )

    app.listen(3001, () => {
        console.info('Server: listening on port 3001')
    })
}

server()
