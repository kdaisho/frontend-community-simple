import type { ActionResult, Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import client from '$lib/trpc'
import type { startRegistration } from '@simplewebauthn/browser'

export const load = (async ({ locals }) => {
    return {
        userName: locals.user?.name,
        email: locals.user?.email,
    }
}) satisfies PageServerLoad

export const actions = {
    registerWebAuthn: async (event: { request: { formData: () => any } }) => {
        const formData = await event.request.formData()
        const userId = formData.get('userId') as string

        console.log('==>', userId)

        if (!userId) {
            return { success: false, message: 'userId not found' }
        }

        try {
            const registrationOptions = await client.getRegistrationOptions.query(userId)

            console.log('==>', { registrationOptions })

            if (registrationOptions && registrationOptions.authenticatorSelection) {
                registrationOptions.authenticatorSelection.residentKey = 'required'
                registrationOptions.authenticatorSelection.requireResidentKey = true
                registrationOptions.extensions = {
                    credProps: true,
                }
                // can we do this in the server? // no, we got error: "window is not defined"
                // const authenticationResponse = await startRegistration(registrationOptions)
            }
            return registrationOptions
        } catch (err) {
            console.log('==> Error', err)
        }

        // const response = await fetch('/api/webauthn/register', {
        //     method: 'POST',
        //     body: formData,
        // })
        // const data = await response.json()

        // if (data?.success) {
        //     return { success: true, message: 'webauthn registration successful' }
        // } else {
        //     return { success: false, message: 'webauthn registration failed' }
        // }
    },
} as any
