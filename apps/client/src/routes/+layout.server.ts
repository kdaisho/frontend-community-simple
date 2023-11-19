import type { LayoutServerLoad } from './$types'

export const load = (async ({ locals }) => {
    return {
        userName: locals.user?.name || '',
        userEmail: locals.user?.email || '',
        webauthn: locals.user?.webauthn || false,
    }
}) satisfies LayoutServerLoad
