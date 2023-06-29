import type { RequestHandler } from './$types'
import client from '$lib/trpc'
import { json } from '@sveltejs/kit'

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
        id: Number(data.id),
        ...(task && { task }),
        ...(completed !== undefined && { completed }),
    }

    const response = await client.updateTodo.query(query)

    return json({ todoId: response })
}) satisfies RequestHandler
