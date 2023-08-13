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
    // WEBAUTHN 1st endpoint
    'webauthn-registration-options': async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            return { success: false, message: 'Email not submitted' }
        }

        try {
            const registrationOptions = await client.getWebAuthnRegistrationOptions.query(email)

            return { registrationOptions }
        } catch (err) {
            console.error(err)
        }
    },

    'webauthn-registration-verification': async ({ request, locals }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string
        const registrationData = formData.get('registrationData') as string

        return {
            registrationOptions_: await client.verifyWebAuthnRegistrationResponse.query({
                email,
                data: registrationData,
            }),
        }
    },
} satisfies Actions
