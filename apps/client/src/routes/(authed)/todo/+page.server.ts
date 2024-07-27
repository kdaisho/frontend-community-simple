import { CreateTodo, GetTodos } from '$lib/trpc'
import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
    const todos = await GetTodos.query(locals?.user.id)
    return { todos }
}) satisfies PageServerLoad

export const actions = {
    createTodo: async ({ request, locals }) => {
        const formData = await request.formData()
        const task = (formData.get('task') as string).trim()

        if (!task.length) {
            return { success: false, message: 'Task cannot be empty' }
        }

        if (!locals?.user.id) {
            return { success: false, message: 'User ID cannot be empty' }
        }

        CreateTodo.query({ userId: locals.user.id, task })

        return { success: true }
    },
} satisfies Actions
