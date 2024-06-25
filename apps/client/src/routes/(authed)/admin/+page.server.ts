import client from '$lib/trpc'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
    if (!locals.user.isAdmin) {
        redirect(307, '/dashboard')
    }

    const users = await client.getUsers.query()
    const footprints = await client.getFootprints.query()
    const sessions = await client.getSessions.query()

    return {
        users,
        footprints,
        sessions,
    }
}) satisfies PageServerLoad
