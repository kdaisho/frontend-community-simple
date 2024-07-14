import { GetRegistrationOptions, VerifyRegistrationResponse } from '$lib/trpc'
import { type Actions, error } from '@sveltejs/kit'
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
    getRegistrationOptions: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            error(400, { message: 'Email not submitted' })
        }

        try {
            return {
                success: true,
                registrationOptions: await GetRegistrationOptions.query(email),
                email,
            }
        } catch (err) {
            error(500, { message: 'Failed to get registration options' })
        }
    },

    verifyRegistration: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string
        const registrationResponse = formData.get('registrationResponse') as string

        if (!email || !registrationResponse) {
            error(400, { message: 'Invalid inputs' })
        }

        try {
            // TODO return response
            await VerifyRegistrationResponse.query({
                email,
                registrationResponse,
            })
        } catch (err) {
            console.error('Webauthn verification failed', err)
        }
    },
} satisfies Actions
