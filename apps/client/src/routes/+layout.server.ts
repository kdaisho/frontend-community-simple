import type { LayoutServerLoad } from './$types'
import { client } from '../lib/trpc'

export const load = (async () => {
    const todos = await client.getTodos.query()
    return { todos }
}) satisfies LayoutServerLoad
