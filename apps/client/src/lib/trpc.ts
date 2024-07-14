import { createTRPCProxyClient } from '@trpc/client'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import type { AppRouter } from '../../../server/src/routers'

export const {
    CreateSession,
    CreateUser,
    FindFootprintByTokenOrThrow,
    GetLoginOptions,
    GetRegistrationOptions,
    GetUser,
    GetUserBySessionToken,
    RecordBotAttempt,
    SendLoginEmail,
    SignIn,
    VerifyLogin,
    VerifyRegistrationResponse,
} = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: 'http://localhost:3001/trpc' })],
})
