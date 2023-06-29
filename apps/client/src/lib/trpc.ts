import type { AppRouter } from '../../../server/routers'
import { createTRPCProxyClient } from '@trpc/client'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'

const client = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: 'http://localhost:3001/trpc' })],
})

export default client
