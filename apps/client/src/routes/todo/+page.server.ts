import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { client } from '$lib/trpc'

export const load = (async () => {
    const todos = await client.getTodos.query()
    return { todos }
}) satisfies PageServerLoad

export const actions = {
    createTodo: async event => {
        const formData = await event.request.formData()
        const task = formData.get('task') as string

        client.createTodo.query({ task })

        return { success: true }
    },
} satisfies Actions
