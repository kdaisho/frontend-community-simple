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
    registerWebAuthn: async ({ request }) => {
        const formData = await request.formData()
        const userId = formData.get('userId') as string

        if (!userId) {
            return { success: false, message: 'userId not found' }
        }

        try {
            const registrationOptions = await client.getWebAuthnRegistrationOptions.query(userId)

            if (registrationOptions && registrationOptions.authenticatorSelection) {
                registrationOptions.authenticatorSelection.residentKey = 'required'
                registrationOptions.authenticatorSelection.requireResidentKey = true
                registrationOptions.extensions = {
                    credProps: true,
                }
            }

            return { registrationOptions }
        } catch (err) {
            console.error(err)
        }
    },

    registrationWebAuthnVerification: async ({ request, locals }) => {
        const formData = await request.formData()
        const registrationData = formData.get('registrationData') as string

        return {
            registrationOptions_: await client.verifyWebAuthnRegistrationResponse.query({
                userId: locals.user.id,
                data: registrationData,
            }),
        }
    },
} satisfies Actions
