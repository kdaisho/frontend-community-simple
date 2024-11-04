import { BASE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } from '$env/static/private'
import {
    SignInWithOAuth,
} from '$lib/trpc'
import { redirect } from '@sveltejs/kit'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

export const GET = async ({ url, cookies }) => {
    const redirectUrl = BASE_URL + '/oauth'
    const code = url.searchParams.get('code')

    if (!code) throw new Error('The parameter:code not found')

    try {
        const oauth2Client = new OAuth2Client(
            OAUTH_CLIENT_ID,
            OAUTH_CLIENT_SECRET,
            redirectUrl,
        )

        const res = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(res.tokens)

        const user = oauth2Client.credentials;

        if (!user.id_token) throw new Error('OAuth failed')
        const decoded = jwt.decode(user.id_token) as jwt.JwtPayload & { email: string, email_verified: boolean }

        if (!(decoded?.email_verified)) throw new Error('OAuth provider email verification failed')

        const session = await SignInWithOAuth.query({ email: decoded.email })

        if (!session) {
            throw new Error('Creating session failed.')
        }

        cookies.set('session', session.token, { path: '/' })
    } catch (err) {
        console.error('Error signing in with Google')
        redirect(307, '/oauth/error')
    }

    redirect(303, '/dashboard')
}