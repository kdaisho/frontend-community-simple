import client from '$lib/trpc'
import { redirect, type Handle } from '@sveltejs/kit'

export const handle = (async ({ event, resolve }) => {
    const sessionToken = event.cookies.get('session')

    let user

    if (sessionToken) {
        user = await client.getUserBySessionToken.query({ sessionToken })

        if (user) {
            event.locals.user = {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        }
    }

    if (event.route.id?.includes('(authed)') && !user) {
        throw redirect(307, '/signin')
    }

    return resolve(event)
}) satisfies Handle
