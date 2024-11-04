import { createTRPCProxyClient } from '@trpc/client'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import type { AppRouter } from '../../../server/src/services'

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
    GetUsersWithPasskeys,
    GetFootprints,
    GetSessions,
    GetUserBySessionToken,
    RecordBotAttempt,
    Register,
    SendLoginEmail,
    SignIn,
    SignInWithOAuth,
    UpdateTodo,
    Upload,
} = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: 'http://localhost:3001/trpc' })],
})
