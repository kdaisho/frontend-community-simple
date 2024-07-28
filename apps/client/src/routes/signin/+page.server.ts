import {
    AuthGetLoginOptions,
    AuthVerifyLogin,
    CreateSession,
    RecordBotAttempt,
    SendLoginEmail,
    SignIn,
} from '$lib/trpc'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import { validateHumanInteraction } from '../modules'
import type { Actions, PageServerLoad } from './$types'

export const load = (({ locals }) => {
    if (locals?.user) {
        redirect(307, '/dashboard')
    }
}) satisfies PageServerLoad

export const actions = {
    signIn: async ({ request }) => {
        const form = await superValidate(
            request,
            zod(
                z.object({
                    email: z.string().trim().email(),
                    grecaptchaToken: z.string(),
                })
            )
        )

        if (!form.valid) {
            return fail(400, { form })
        }

        const email = form.data.email
        const grecaptchaToken = form.data.grecaptchaToken
        const recaptchaResult = await validateHumanInteraction(grecaptchaToken)

        if (!recaptchaResult.success) {
            // recaptcha is too aggressive and blocks real users. let's see how many we get (nov, 19 2023)
            console.error('sign in: request from a bot')
            await RecordBotAttempt.query(email)
        }

        if (!z.string().email().safeParse(email).success) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Email address is invalid.'],
            })
        }

        try {
            const res = await SignIn.query({ email })
            return {
                form,
                userUuid: res.userUuid,
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

    signinWithPasskey: async ({ request }) => {
        const form = await superValidate(
            request,
            zod(z.object({ email: z.string().trim().email() }))
        )

        if (!form.valid) {
            return fail(400, { form })
        }

        return {
            form,
            email: form.data.email,
            loginOptions: await AuthGetLoginOptions.query({ email: form.data.email }),
        }
    },

    signinWithEmail: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        try {
            await SendLoginEmail.query(email)
        } catch (err) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Email send failed.'],
            })
        }
    },

    verifyLogin: async ({ request, cookies }) => {
        const form = await superValidate(
            request,
            zod(z.object({ email: z.string().trim().email(), authenticationResponse: z.string() }))
        )

        if (!form.valid) {
            return fail(400, { form })
        }

        try {
            const response = await AuthVerifyLogin.query({
                email: form.data.email,
                registrationDataString: form.data.authenticationResponse,
            })

            if (!response?.userUuid || !response?.verified) {
                return fail(404, { message: 'Failed to verify auth' })
            }

            const session = await CreateSession.query({
                userUuid: response.userUuid,
            })

            if (!session) {
                return fail(404, { message: 'Failed to create session' })
            }

            cookies.set('session', session.token, { path: '/' })

            return {
                form,
                redirectTo: '/dashboard',
            }
        } catch (err) {
            throw new Error('Webauthn verification failed.')
        }
    },
} satisfies Actions
