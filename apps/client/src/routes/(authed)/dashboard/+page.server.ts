import client from '$lib/trpc'
import type { Actions } from '@sveltejs/kit'
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
    webauthnGetRegistrationOptions: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            return { success: false, message: 'Email not submitted' }
        }

        try {
            const registrationOptions = await client.getWebAuthnRegistrationOptions.query(email)

            return { registrationOptions, email }
        } catch (err) {
            console.error(err)
        }
    },
} satisfies Actions
