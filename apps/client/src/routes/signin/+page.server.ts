import client from '$lib/trpc'
import { fail } from '@sveltejs/kit'
import { TRPCClientError } from '@trpc/client'
import { validateHumanInteraction } from '../modules'
import type { Actions } from './$types'

export const actions = {
    signIn: async ({ request }) => {
        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()
        const grecaptchaToken = formData.get('grecaptchaToken') as string
        const recaptchaResult = await validateHumanInteraction(grecaptchaToken)

        if (!recaptchaResult.success) {
            console.error('sign in: request from bot')
            return fail(400, { success: false, msg: 'Bot found at sign in' })
        }

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
    webauthnGetLoginOptions: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            return fail(422, {
                error: ['User not found'],
            })
        }

        return { email, loginOptions: await client.WebAuthnGetLoginOptions.query({ email }) }
    },
    signInWithEmail: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        try {
            await client.sendLoginEmail.query(email)
        } catch (err) {
            console.error('Sending login email failed.', err)
        }
    },
} satisfies Actions
