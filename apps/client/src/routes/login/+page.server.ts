import { ADMIN_EMAIL, JWT_SIGNATURE } from '$env/static/private'
import { CreateSession, CreateUser, FindFootprintByTokenOrThrow, GetUser } from '$lib/trpc'
import { redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { PageServerLoad } from './$types'

export const load = (async ({ url, cookies }) => {
    const authToken = url.searchParams.get('token')

    if (!authToken) {
        redirect(307, '/')
    }

    try {
        await FindFootprintByTokenOrThrow.query(authToken)

        const parsed = jwt.verify(authToken, JWT_SIGNATURE) as {
            email: string
            name?: string
            register?: boolean
        }

        let user

        if (parsed.register && parsed.name) {
            user = await CreateUser.query({
                name: parsed.name,
                email: parsed.email,
                isAdmin: parsed.email === ADMIN_EMAIL,
            })

            if (!user) {
                throw new Error('Creating user failed.')
            }
        } else {
            user = await GetUser.query({
                email: parsed.email,
            })

            if (!user) {
                throw new Error('User not found.')
            }
        }

        const session = await CreateSession.query({
            userUuid: user.uuid,
        })

        if (!session) {
            throw new Error('Creating session failed.')
        }

        cookies.set('session', session.token, { path: '/' })
    } catch (err) {
        console.error(err)
    }

    redirect(307, '/setup')
}) satisfies PageServerLoad
