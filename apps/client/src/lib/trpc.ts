import { createTRPCProxyClient } from '@trpc/client'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import type { AppRouter } from 'server/routers'

export const client = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: 'http://localhost:3001/trpc' })],
})

console.log('client ==>', client)

// export const useTodos = (filter: Ref<boolean | undefined>) => {
//     const { data, refetch } = useQuery(['todos', filter], async () =>
//         client.getTodos.query({ filter: filter.value })
//     )
//     return { data, refetch }
// }
// export const useCreateTodo = () => {
//     const queryClient = useQueryClient()
//     return useMutation({
//         mutationFn: (todo: string) =>
//             client.createTodo.query({
//                 title: todo,
//                 completed: false,
//             }),
//         onSuccess: () => {
//             // Invalidate and refetch
//             queryClient.invalidateQueries({ queryKey: ['todos'] })
//         },
//     })
// }

// export const useDeleteTodo = () => {
//     const queryClient = useQueryClient()
//     return useMutation({
//         mutationFn: (id: number) => client.deleteTodo.query(id),
//         onSuccess: () => {
//             // Invalidate and refetch
//             queryClient.invalidateQueries({ queryKey: ['todos'] })
//         },
//     })
// }
