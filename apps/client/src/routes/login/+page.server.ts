import { JWT_SIGNATURE } from '$env/static/private'
import type { PageServerLoad } from './$types'
import client from '$lib/trpc'
import jwt from 'jsonwebtoken'

export const load = (async ({ url }) => {
    const authToken = url.searchParams.get('token')

    if (!authToken) return null

    try {
        const parsed = jwt.verify(authToken, JWT_SIGNATURE) as {
            email: string
            name?: string
            register?: boolean
        }

        if (parsed.register && parsed.name) {
            const newUser = await client.createUser.query({
                name: parsed.name,
                email: parsed.email,
            })
            console.log('==> newUser', newUser)

            if (newUser) {
                const session = await client.createSession.query({
                    userId: newUser.id,
                })
                console.log('==> session', session)

                return { session }
            }
        } else {
            // handle login
            console.log('==>', 'handling logging in')
        }
    } catch (err) {
        console.error('==> invalid token', err)
    }
}) satisfies PageServerLoad
