import { JWT_SIGNATURE } from '$env/static/private'
import client from '$lib/trpc'
import { redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load = (async ({ url, cookies }) => {
    const authToken = url.searchParams.get('token')

    if (!authToken) {
        redirect(307, '/')
    }

    try {
        await client.findFootprintByTokenOrThrow.query(authToken)

        const parsed = jwt.verify(authToken, JWT_SIGNATURE) as {
            email: string
            name?: string
            register?: boolean
        }

        let user

        if (parsed.register && parsed.name) {
            user = await client.createUser.query({
                name: parsed.name,
                email: parsed.email,
            })

            if (!user) {
                throw new Error('Creating user failed.')
            }
        } else {
            user = await client.getUser.query({
                email: parsed.email,
            })

            if (!user) {
                throw new Error('Something went wrong.')
            }
        }

        const session = await client.createSession.query({
            userId: user.id,
        })

        if (!session) {
            throw new Error('Creating session failed.')
        }

        cookies.set('session', session.token, { path: '/' })
    } catch (err) {
        console.error(err)
    }

    redirect(307, '/dashboard?shouldOfferWebauthn=true')
}) satisfies PageServerLoad
