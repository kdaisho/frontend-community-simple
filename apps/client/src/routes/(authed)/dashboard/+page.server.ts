import type { PageServerLoad } from './$types'

export const load = (({ locals }) => {
    return {
        userName: locals.user?.name,
        email: locals.user?.email,
        isAdmin: locals.user?.isAdmin,
    }
}) satisfies PageServerLoad
