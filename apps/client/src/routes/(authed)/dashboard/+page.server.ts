import type { PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
    return {
        userName: locals.user?.name,
    }
}) satisfies PageServerLoad
