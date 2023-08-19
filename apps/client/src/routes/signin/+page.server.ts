import type { Actions, PageServerLoad } from './$types'
import { TRPCClientError } from '@trpc/client'
import client from '$lib/trpc'
import { fail } from '@sveltejs/kit'

const { BASE_URL, JWT_SIGNATURE } = process.env

export const load = (async ({ locals }) => {
    console.log('LOAD SignIn ==>', locals)
}) satisfies PageServerLoad

export const actions = {
    'signIn': async ({ request }) => {
        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()

        if (!email.length) {
            return fail(422, {
                email,
                error: ['Email cannot be empty'],
            })
        }

        try {
            const res = await client.signIn.query({ email })
            return {
                success: res.success,
                userId: res.userId,
                email: res.email,
                webauthn: res.webauthn,
            }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                console.error('==>', err)
            }
            return { success: false, message: 'Failed to sign in' }
        }
    },
    // 3rd
    'webauthn-login-options': async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        console.log('==> GOT USER ID', email)

        /* TODO run two methods from SimpleWebAuthn
            1. generateAuthenticationOptions (server)
            2. startAuthentication (client)
        */

        if (!email) {
            return fail(422, {
                error: ['User not found'],
            })
        }

        console.log('==>', 'RED')

        return { loginOptions: await client.getWebAuthnLoginOptions.query({ email }) }
    },
    // 4th
    'webauthn-login-verification': async ({ request }) => {
        const formData = await request.formData()
        const registrationDataString = formData.get('registrationData') as string
        const registrationDataParsed = JSON.parse(registrationDataString)

        console.log('==> ho ho', registrationDataParsed)

        if (!registrationDataParsed) {
            return fail(422, {
                error: ['Registration data not found'],
            })
        }

        try {
            await client.verifyWebAuthnLogin.query({ email: 'aa@aa.aa', registrationDataParsed })
        } catch (err) {
            console.error('Webauthn verification failed', err)
        }
    },

    'signInWithEmail': async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string

        try {
            await client.sendLoginEmail.query(email)
        } catch (err) {
            console.error('Sending login email failed.', err)
        }
    },
} satisfies Actions
