import client from '$lib/trpc'
import { json } from '@sveltejs/kit'

export async function POST({ request }: { request: Request }) {
    const { email, data } = await request.json()

    try {
        const response = await client.verifyWebAuthnRegistrationResponse.query({
            email,
            data,
        })

        if (response?.ok) {
            return json({
                success: true,
                message: 'You can now login with WebAuthn',
            })
        }
    } catch (err) {
        console.error('Webauthn verification failed', err)
    }
}
