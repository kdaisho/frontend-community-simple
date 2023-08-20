import type { Actions } from './$types'
import { TRPCClientError } from '@trpc/client'
import client from '$lib/trpc'
import { fail } from '@sveltejs/kit'

export const actions = {
    'signIn': async ({ request }) => {
        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()

        if (!email.length) {
            return fail(422, {
                email,
                error: ['Email cannot be empty'],
            })
        }

        try {
            const res = await client.signIn.query({ email })
            return {
                success: res.success,
                userId: res.userId,
                email: res.email,
                webauthn: res.webauthn,
            }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                console.error('==>', err)
            }
            return { success: false, message: 'Failed to sign in' }
        }
    },
    // 3rd
    'webauthn-login-options': async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            return fail(422, {
                error: ['User not found'],
            })
        }

        return { success: true, data: await client.getWebAuthnLoginOptions.query({ email }) }
    },
    'signInWithEmail': async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        try {
            await client.sendLoginEmail.query(email)
        } catch (err) {
            console.error('Sending login email failed.', err)
        }
    },
} satisfies Actions
