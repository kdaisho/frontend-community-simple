import { ADMIN_EMAIL } from '$env/static/private'
import { RecordBotAttempt, Register } from '$lib/trpc'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import { TRPCClientError } from '@trpc/client'
import { z } from 'zod'
import { validateHumanInteraction } from '../modules'
import type { PageServerLoad } from './$types'

export const load = (({ locals }) => {
    if (locals?.user) {
        redirect(307, '/dashboard')
    }
}) satisfies PageServerLoad

export const actions = {
    register: async ({ request }) => {
        const formData = await request.formData()
        const name = (formData.get('name') as string).trim()
        const email = (formData.get('email') as string).trim()
        const grecaptchaToken = formData.get('grecaptchaToken') as string
        const recaptchaResult = await validateHumanInteraction(grecaptchaToken)

        if (!recaptchaResult.success) {
            // recaptcha is too aggressive and blocks real users. let's see how many we get (nov, 19 2023)
            console.error('register: request from a bot')
            await RecordBotAttempt.query(email)
        }

        if (!name.length) {
            return fail(400, {
                type: 'name',
                value: name,
                error: ['Name cannot be empty.'],
            })
        }

        if (!z.string().email().safeParse(email).success) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['Email address is invalid.'],
            })
        }

        if (email !== ADMIN_EMAIL && !/(\d|\w)\+\d+@/.test(email)) {
            return fail(400, {
                type: 'email',
                value: email,
                error: ['We do not accept that email.'],
            })
        }

        try {
            await Register.query({ name, email })
            return { success: true }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                return {
                    success: false,
                    status: 409,
                    message: err.message,
                }
            }
        }
    },
} satisfies Actions
