import client from '$lib/trpc'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { validateHumanInteraction } from '../modules'
import type { Actions, PageServerLoad } from './$types'

export const load = (({ locals }) => {
    if (locals?.user) {
        throw redirect(307, '/dashboard')
    }
}) satisfies PageServerLoad

export const actions = {
    signIn: async ({ request }) => {
        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()
        const grecaptchaToken = formData.get('grecaptchaToken') as string
        const recaptchaResult = await validateHumanInteraction(grecaptchaToken)

        if (!recaptchaResult.success) {
            // recaptcha is too aggressive and blocks real users. let's see how many we get (nov, 19 2023)
            console.error('sign in: request from a bot')
            await client.recordBotAttempt.query(email)
        }

        if (!z.string().email().safeParse(email).success) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Email address is invalid.'],
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
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Failed. You should know why.'],
            })
        }
    },
    webauthnGetLoginOptions: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Failed. You should know why.'],
            })
        }

        return { email, loginOptions: await client.webAuthnGetLoginOptions.query({ email }) }
    },
    signInWithEmail: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        try {
            await client.sendLoginEmail.query(email)
        } catch (err) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Email send failed.'],
            })
        }
    },
} satisfies Actions
