import { db } from '../database'
import { sendEmail } from './utils'

type HandleRegisterProps = {
    name: string
    email: string
}

export async function handleRegister({ name, email }: HandleRegisterProps) {
    // find a user using email
    const foundUser = await db
        .selectFrom('user')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst()

    if (foundUser) {
        throw new Error('User already exists')
    }

    // if not, send an email to user to create an account
    sendEmail({ email, subject: 'Create your account' })
}

export async function handleSignIn({ email }: { email: string }) {
    // find a user using email
    const user = await db
        .selectFrom('user')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst()

    console.log('==> DB', { user })

    if (user) {
        // check if user has registered for authn

        // if yes, return auth n token

        // if not, send email to user to login
        sendEmail({ email, subject: 'Sign in to your account' })

        // show a message to user that an email has been sent
        return { success: true }
    }

    // we can always show a message to user that an email has been sent, even when it's not true;
    // as we should not to give user a hint that the email is not registered
    return { success: false }
}
