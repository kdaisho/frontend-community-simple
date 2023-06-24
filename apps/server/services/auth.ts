import { db } from '../database'
import { sendEmail } from './utils'

type HandleRegisterProps = {
    name: string
    email: string
}

export async function handleRegister({ name, email }: HandleRegisterProps) {
    const foundUser = await db
        .selectFrom('user')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst()

    if (foundUser) {
        throw new Error('User already exists')
    }

    sendEmail({
        email,
        subject: 'Create your account',
        body: `<h1>Nice to meet you ${name}.</h1><a href="http://localhost:5173/login?register=true&email=${email}">Click here to create your account and sign in</a>`,
    })
}

export async function handleSignIn({ email }: { email: string }) {
    // find a user using email
    const user = await db
        .selectFrom('user')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst()

    if (!user) {
        // show a message to user that an email has been sent
        console.error('==> User not found', { email })
    }

    console.log('==> DB', { user })

    if (user) {
        // check if user has registered for authn

        // if yes, return auth n token

        // if not, send email to user to login
        sendEmail({
            email,
            subject: 'Login to your account',
            body: `<h1>Sign in</h1><a href="http://localhost:5173/login?email=${email}">Click here to login</a>`,
        })

        // show a message to user that an email has been sent
        return { success: true }
    }

    // we can always show a message to user that an email has been sent, even when it's not true;
    // as we should not to give user a hint that the email is not registered
    return { success: false }
}
