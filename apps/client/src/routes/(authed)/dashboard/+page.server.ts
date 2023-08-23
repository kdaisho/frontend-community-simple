import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import client from '$lib/trpc'

export const load = (async ({ locals }) => {
    return {
        userName: locals.user?.name,
        email: locals.user?.email,
    }
}) satisfies PageServerLoad

export const actions = {
    'webauthn-registration-options': async ({ request }) => {
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
