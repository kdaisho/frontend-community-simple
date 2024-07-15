import { GetRegistrationOptions, VerifyRegistrationResponse } from '$lib/trpc'
import { type Actions, error, fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import type { PageServerLoad } from './$types'

export const load = (({ locals, url }) => {
    return {
        userName: locals.user?.name,
        email: locals.user?.email,
        webauthn: locals.user?.webauthn,
        shouldOfferWebauthn: Boolean(url.searchParams.get('shouldOfferWebauthn')),
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
                registrationOptions: await GetRegistrationOptions.query(email),
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
            await VerifyRegistrationResponse.query({
                email: form.data.email,
                registrationResponse: form.data.registrationResponse,
            })

            return {
                form,
                message: 'Verification success',
            }
        } catch (err) {
            console.error('Webauthn verification failed', err)
        }
    },
} satisfies Actions
