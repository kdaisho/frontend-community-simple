import { createTRPCProxyClient } from '@trpc/client'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import type { AppRouter } from '../../../server/src/routers'

export const {
    AuthGetLoginOptions,
    AuthGetRegistrationOptions,
    AuthVerifyLogin,
    AuthVerifyRegistrationResponse,
    CreateSession,
    CreateUser,
    CreateTodo,
    GetTodos,
    DeleteTodo,
    Download,
    FindFootprintByTokenOrThrow,
    GetUser,
    GetUsersWithDevices,
    GetFootprints,
    GetSessions,
    GetUserBySessionToken,
    RecordBotAttempt,
    Register,
    SendLoginEmail,
    SignIn,
    UpdateTodo,
    Upload,
} = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: 'http://localhost:3001/trpc' })],
})
