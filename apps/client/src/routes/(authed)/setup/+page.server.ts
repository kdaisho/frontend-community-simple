import { AuthGetRegistrationOptions, AuthVerifyRegistrationResponse } from '$lib/trpc'
import { error, fail, type Actions } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import type { PageServerLoad } from './$types'

export const load = (({ locals }) => {
    return {
        userName: locals.user?.name,
        email: locals.user?.email,
        isAdmin: locals.user?.isAdmin,
    }
}) satisfies PageServerLoad

export const actions = {
    registerPasskey: async ({ request }) => {
        const form = await superValidate(
            request,
            zod(z.object({ email: z.string().trim().email() }))
        )

        if (!form.valid) {
            return fail(400, { form })
        }

        const email = form.data.email

        try {
            return {
                form,
                registrationOptions: await AuthGetRegistrationOptions.query(email),
                email,
            }
        } catch (err) {
            error(500, { message: 'Failed to get registration options' })
        }
    },

    verifyRegistration: async ({ request }) => {
        const form = await superValidate(
            request,
            zod(z.object({ email: z.string().trim().email(), registrationResponse: z.string() }))
        )

        if (!form.valid) {
            return fail(400, { form })
        }

        try {
            await AuthVerifyRegistrationResponse.query({
                email: form.data.email,
                registrationResponse: form.data.registrationResponse,
            })

            return {
                form,
                message: 'Verification success',
                redirectTo: '/dashboard',
            }
        } catch (err) {
            console.error('Webauthn verification failed', err)
        }
    },
} satisfies Actions
