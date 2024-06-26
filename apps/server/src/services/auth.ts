import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import { db } from '../../database'
import { sendEmail } from '../utils'

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
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already exists',
        })
    }

    const authToken = jwt.sign(
        {
            name,
            email,
            register: true,
        },
        JWT_SIGNATURE || '',
        { expiresIn: 60 * 10 }
    )

    await db
        .insertInto('footprint')
        .values({
            email,
            token: authToken,
            pristine: true,
        })
        .execute()

    sendEmail({
        email,
        subject: 'Create your account',
        body: `<h1>Almost there, ${name}!</h1><a href="${BASE_URL}/login?token=${authToken}">Click here to create your account and sign in.</a>`,
    })
}

export async function handleSignIn({ email }: { email: string }) {
    const user = await db
        .selectFrom('user')
        .select(['id', 'email', 'webauthn'])
        .where('email', '=', email)
        .executeTakeFirst()

    if (!user) {
        throw new Error("User not found, don't tell")
    }

    if (user?.webauthn) {
        return { success: true, userId: user.id, email: user.email, webauthn: user.webauthn }
    }

    // may not need this check for user as user is guaranteed to be here. there's a check `if (!user)` above
    if (user) {
        const authToken = jwt.sign(
            {
                email,
            },
            JWT_SIGNATURE || '',
            { expiresIn: 60 * 10 }
        )

        await db
            .insertInto('footprint')
            .values({
                email,
                token: authToken,
                pristine: true,
            })
            .execute()

        await sendEmail({
            email,
            subject: 'Login to your account',
            body: `<h1>Sign in</h1><a href="${BASE_URL}/login?token=${authToken}">Click here to login</a>`,
        })

        // show a message to user that an email has been sent
        return {
            success: true,
            userId: user.id,
            email: user.email,
            webauthn: false,
        }
    }

    // we can always show a message to user that an email has been sent, even when it's not true;
    // as we should not to give user a hint that the email is not registered
    return {
        success: false,
        userId: null,
        email: '',
        webauthn: false,
    }
}

export async function sendLoginEmail(email: string) {
    const authToken = jwt.sign(
        {
            email,
        },
        JWT_SIGNATURE || '',
        { expiresIn: 60 * 10 }
    )

    await db
        .insertInto('footprint')
        .values({
            email,
            token: authToken,
            pristine: true,
        })
        .execute()

    await sendEmail({
        email,
        subject: 'Login to your account',
        body: `<h1>Sign in</h1><a href="${BASE_URL}/login?token=${authToken}">Click here to login</a>`,
    })
}

export async function findUserByEmail(email: string) {
    return await db
        .selectFrom('user')
        .select(['id', 'name', 'email'])
        .where('email', '=', email)
        .executeTakeFirst()
}

type UserWithWebAuthn = {
    id: string
    name: string
    email: string
    current_challenge: string
    devices?: AuthenticatorDevice[]
    webauthn: boolean
}

export async function findUserWithWebAuthnByEmail(email: string): Promise<UserWithWebAuthn> {
    return (await db
        .selectFrom('user')
        .select(['id', 'name', 'email', 'current_challenge', 'devices', 'webauthn'])
        .where('email', '=', email)
        .executeTakeFirst()) as UserWithWebAuthn
}

export async function saveUser({ name, email }: HandleRegisterProps) {
    return await db
        .insertInto('user')
        .values({
            name,
            email,
            webauthn: false,
        })
        .onConflict(oc => oc.column('email').doNothing())
        .returning(['id', 'name', 'email'])
        .executeTakeFirst()
}

type SaveSessionProps = {
    userId: string
    durationHours: number
}

export async function saveSession({ userId, durationHours }: SaveSessionProps) {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    const sessionToken = await db
        .insertInto('session')
        .values({
            user_id: userId,
            expires_at: expiresAt,
        })
        .returning('token')
        .executeTakeFirst()

    return sessionToken
}

export async function findUserBySessionToken(token: string) {
    return await db
        .selectFrom('user')
        .select(['id', 'name', 'email', 'webauthn', 'is_admin as isAdmin'])
        .where(
            'id',
            '=',
            db
                .selectFrom('session')
                .select('user_id')
                .where('token', '=', token)
                .where('expires_at', '>', new Date())
        )
        .executeTakeFirst()
}

export async function findPristineFootprint(token: string) {
    const fp = await db
        .selectFrom('footprint')
        .select('id')
        .where('token', '=', token)
        .where('pristine', '=', true)
        .executeTakeFirst()

    return fp?.id
}

export async function consumeFootprint(id: string) {
    const fp = await db
        .updateTable('footprint')
        .set({ pristine: false })
        .where('id', '=', id)
        .returning('id')
        .executeTakeFirst()

    return fp?.id
}

export async function updateUserWithCurrentChallenge({
    userId,
    currentChallenge,
}: {
    userId: string
    currentChallenge: string
}) {
    return await db
        .updateTable('user')
        .set({ current_challenge: currentChallenge })
        .where('id', '=', userId)
        .execute()
}

export async function updateUserWithWebauthn(userId: string) {
    return await db.updateTable('user').set({ webauthn: true }).where('id', '=', userId).execute()
}

export async function saveNewDevices({ userId, devices }: { userId: string; devices: string }) {
    try {
        await db.updateTable('user').set({ devices }).where('id', '=', userId).execute()
    } catch (err) {
        console.error('==> Saving DEVICES FAILED', err)
    }
}

export async function saveBotAttempt(email: string) {
    await db.insertInto('recaptcha').values({ email }).execute()
}

export async function getUsers() {
    return await db
        .selectFrom('user')
        .select([
            'user.id',
            'user.name',
            'user.email',
            'user.webauthn',
            'user.devices',
            'created_at as createdAt',
            'user.is_admin as isAdmin',
        ])
        .execute()
}

export async function getFootprints() {
    return await db.selectFrom('footprint').selectAll().execute()
}

export async function getSessions() {
    return await db.selectFrom('session').selectAll().execute()
}
