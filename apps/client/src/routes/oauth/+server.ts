import { BASE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } from '$env/static/private'
import { redirect } from '@sveltejs/kit'
import { OAuth2Client } from 'google-auth-library'

export const GET = async ({ url }) => {
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
        console.info('==>', { user })
    } catch (err) {
        console.error('Error signing in with Google')
    }

    redirect(303, '/') // instead, you can authenticate using the user credential data
}