import type { Actions, PageServerLoad } from './$types'
import { TRPCClientError } from '@trpc/client'
import client from '$lib/trpc'
import { fail } from '@sveltejs/kit'

export const load = (async ({ locals }) => {
    console.log('LOAD SignIn ==>', locals)
}) satisfies PageServerLoad

export const actions = {
    signIn: async ({ request }) => {
        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()

        if (!email.length) {
            return fail(422, {
                email,
                error: ['Email cannot be empty'],
            })
        }

        try {
            const response = await client.signIn.query({ email })
            return {
                success: true,
                userId: response.userId,
                webauthn: response.webauthn,
            }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                const errors = JSON.parse(err.message)
                return fail(422, {
                    email,
                    error: errors.map((e: { message: string }) => e.message),
                })
            }
            return { success: false, message: 'Failed to sign in' }
        }
    },
    signInWebAuthn: async ({ request }) => {
        const formData = await request.formData()
        const userId = formData.get('userId') as string

        console.log('==> GOT USER ID', userId)

        /* TODO run two methods from SimpleWebAuthn
            1. generateAuthenticationOptions (server)
            2. startAuthentication (client)
        */

        if (!userId) {
            return fail(422, {
                error: ['User not found'],
            })
        }

        return { loginOptions: await client.getWebAuthnLoginOptions.query(userId) }
    },
} satisfies Actions
