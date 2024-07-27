import { UpdateTodo } from '$lib/trpc'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST = (async ({ request }) => {
    const data = await request.json()
    let task
    let completed

    if (typeof data.value === 'string') {
        task = data.value
    } else {
        completed = data.value
    }

    const query = {
        id: data.id,
        ...(task && { task }),
        ...(completed !== undefined && { completed }),
    }

    const response = await UpdateTodo.query(query)

    return json({ todoId: response })
}) satisfies RequestHandler
