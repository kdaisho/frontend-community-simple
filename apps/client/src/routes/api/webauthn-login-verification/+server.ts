import client from '$lib/trpc'
import { json } from '@sveltejs/kit'

export async function POST({ request, cookies }: { request: Request; cookies: any }) {
    const { email, data } = await request.json()

    try {
        const response = await client.verifyWebAuthnLogin.query({
            email,
            registrationDataParsed: data,
        })

        if (!response?.userId || !response?.verified) {
            return json({ success: false, message: 'verification failed' })
        }

        const session = await client.createSession.query({
            userId: response.userId,
        })

        if (!session) {
            return json({ success: false, message: 'session creation failed' })
        }

        cookies.set('session', session.token, { path: '/' })

        return json({
            success: true,
            message: 'verification success',
            redirectTo: '/dashboard',
        })
    } catch (err) {
        console.error('Webauthn verification failed', err)
    }
}
