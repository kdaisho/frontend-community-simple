import type { Actions } from '@sveltejs/kit'
import { client } from '$lib/trpc'
import type { PageServerLoad } from './$types'

export const load = (async () => {
    const todos = await client.getTodos.query()
    return { todos }
}) satisfies PageServerLoad

export const actions = {
    createTodo: async event => {
        const formData = await event.request.formData()
        const task = formData.get('task') as string

        client.createTodo.query({ task })
    },
} satisfies Actions
