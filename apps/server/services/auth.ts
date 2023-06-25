import { db } from '../database'
import jwt from 'jsonwebtoken'
import { sendEmail } from './utils'

type HandleRegisterProps = {
    name: string
    email: string
}

const { BASE_URL, JWT_SIGNATURE } = process.env

export async function handleRegister({ name, email }: HandleRegisterProps) {
    const foundUser = await db
        .selectFrom('user')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst()

    if (foundUser) {
        throw new Error('User already exists')
    }

    const authToken = jwt.sign(
        {
            name,
            email,
            register: true,
        },
        JWT_SIGNATURE || ''
    )

    sendEmail({
        email,
        subject: 'Create your account',
        body: `<h1>Nice to meet you ${name}.</h1><a href="${BASE_URL}/login?token=${authToken}">Click here to create your account and sign in</a>`,
    })
}

export async function handleSignIn({ email }: { email: string }) {
    const user = await db
        .selectFrom('user')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst()

    if (!user) {
        console.error('==> User not found', {
            email,
        })
    }

    if (user) {
        const authToken = jwt.sign(
            {
                email,
            },
            JWT_SIGNATURE || ''
        )
        // check if user has registered for authn

        // if yes, return auth n token

        // if not, send email to user to login
        sendEmail({
            email,
            subject: 'Login to your account',
            body: `<h1>Sign in</h1><a href="${BASE_URL}/login?token=${authToken}">Click here to login</a>`,
        })

        // show a message to user that an email has been sent
        return {
            success: true,
        }
    }

    // we can always show a message to user that an email has been sent, even when it's not true;
    // as we should not to give user a hint that the email is not registered
    return {
        success: false,
    }
}

export async function saveUser({ name, email }: HandleRegisterProps) {
    await db
        .insertInto('user')
        .values({
            name,
            email,
        })
        .onConflict(oc => oc.column('email').doNothing())
        .returning('id')
        .execute()
    return true
}

export async function handleAuthenticate(authToken: string) {
    console.log('==> handleAuthenticate', {
        authToken,
    })

    const parsed = jwt.verify(authToken, 'lol')
}
