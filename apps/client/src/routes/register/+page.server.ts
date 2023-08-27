import client from '$lib/trpc'
import { validateHumanInteraction } from '$lib/utils'
import { fail } from '@sveltejs/kit'
import { TRPCClientError } from '@trpc/client'
import type { Actions } from './$types'

export const actions = {
    register: async ({ request }) => {
        const formData = await request.formData()

        const name = (formData.get('name') as string).trim()
        const email = (formData.get('email') as string).trim()
        const grecaptchaToken = formData.get('grecaptchaToken') as string
        const recaptchaResult = await validateHumanInteraction(grecaptchaToken)

        if (!recaptchaResult.success) {
            console.error('register: request from bot')
            return fail(400, { success: false, msg: 'Bot found at register' })
        }

        if (!name.length) {
            return fail(422, {
                name,
                error: ['Name cannot be empty'],
            })
        }

        if (!email.length) {
            return fail(422, {
                email,
                error: ['Email cannot be empty'],
            })
        }

        try {
            await client.register.query({ name, email })
            return { success: true }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                const errors = JSON.parse(err.message)
                return fail(422, {
                    name,
                    email,
                    error: errors.map((e: { message: string }) => e.message),
                })
            }
        }
    },
} satisfies Actions
