import { GetFootprints, GetSessions, GetUsersWithPasskeys } from '$lib/trpc'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
    if (!locals.user.isAdmin) {
        redirect(307, '/dashboard')
    }

    const users = await GetUsersWithPasskeys.query()
    const footprints = await GetFootprints.query()
    const sessions = await GetSessions.query()

    return {
        users,
        footprints,
        sessions,
    }
}) satisfies PageServerLoad
