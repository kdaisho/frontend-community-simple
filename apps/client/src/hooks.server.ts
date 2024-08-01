import { GetUserBySessionToken } from '$lib/trpc'
import { redirect, type Handle } from '@sveltejs/kit'

export const handle = (async ({ event, resolve }) => {
    const sessionToken = event.cookies.get('session')
    let user

    if (sessionToken) {
        user = await GetUserBySessionToken.query({ sessionToken })

        if (user) {
            event.locals.user = {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin ?? false,
            }
        }
    }

    if (event.route.id?.includes('(authed)') && !user) {
        redirect(307, '/signin')
    }

    return resolve(event)
}) satisfies Handle
