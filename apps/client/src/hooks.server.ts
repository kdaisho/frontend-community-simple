import { type Handle, redirect } from '@sveltejs/kit'
import client from '$lib/trpc'

export const handle = (async ({ event, resolve }) => {
    if (event.route.id?.includes('(authed)')) {
        const sessionToken = event.cookies.get('session')

        if (!sessionToken) {
            throw redirect(307, '/signin')
        }

        const user = await client.getUserBySessionToken.query({ sessionToken })

        if (!user) {
            console.error('user not found')
            return new Response(null, {
                status: 302,
                headers: {
                    location: '/signin',
                },
            })
        }

        event.locals.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    }

    return resolve(event)
}) satisfies Handle
