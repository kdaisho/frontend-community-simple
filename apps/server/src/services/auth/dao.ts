import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import { db } from '../../../database'
import type { User } from '../../../database/db-types'
import { sendEmail } from '../../utils'

type HandleRegisterProps = {
    name: string
    email: string
    isAdmin?: boolean
}

const { BASE_URL, JWT_SIGNATURE } = process.env

export async function handleRegister({ name, email }: HandleRegisterProps) {
    const foundUser = await db
        .selectFrom('user')
        .select('uuid')
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
            is_pristine: true,
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
        .select(['uuid', 'email'])
        .leftJoin('passkey', 'user.uuid', 'passkey.user_uuid')
        .select('passkey.user_uuid as passkeyUserUuid')
        .where('email', '=', email)
        .executeTakeFirst()

    if (!user) {
        throw new Error("User not found, don't tell")
    }

    if (user?.passkeyUserUuid) {
        return {
            success: true,
            userUuid: user.uuid,
            email: user.email,
            webauthn: true,
        }
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
                is_pristine: true,
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
            userUuid: user.uuid,
            email: user.email,
            webauthn: false,
        }
    }

    // we can always show a message to user that an email has been sent, even when it's not true;
    // as we should not to give user a hint that the email is not registered
    return {
        success: false,
        userUuid: null,
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
            is_pristine: true,
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
        // .select(['uuid', 'name', 'email'])
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst()
}

export async function saveUser({ name, email, isAdmin }: HandleRegisterProps) {
    return await db
        .insertInto('user')
        .values({
            name,
            email,
            is_passkeys_enabled: false,
            is_admin: isAdmin,
        })
        .onConflict(oc => oc.column('email').doNothing())
        .returning(['uuid', 'name', 'email'])
        .executeTakeFirst()
}

type SaveSessionProps = {
    userUuid: string
    durationHours: number
}

export async function saveSession({ userUuid, durationHours }: SaveSessionProps) {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    const sessionToken = await db
        .insertInto('session')
        .values({
            user_uuid: userUuid,
            expires_at: expiresAt,
        })
        .returning('token')
        .executeTakeFirst()

    return sessionToken
}

export async function findUserBySessionToken(token: string) {
    return await db
        .selectFrom('user')
        .select([
            'uuid',
            'name',
            'email',
            'is_passkeys_enabled as isPasskeyEnabled',
            'is_admin as isAdmin',
        ])
        .where(
            'uuid',
            '=',
            db
                .selectFrom('session')
                .select('user_uuid')
                .where('token', '=', token)
                .where('expires_at', '>', new Date())
        )
        .executeTakeFirst()
}

export async function findPristineFootprint(token: string) {
    const fp = await db
        .selectFrom('footprint')
        .select('uuid')
        .where('token', '=', token)
        .where('is_pristine', '=', true)
        .executeTakeFirst()

    return fp?.uuid
}

export async function consumeFootprint(id: string) {
    const fp = await db
        .updateTable('footprint')
        .set({ is_pristine: false })
        .where('uuid', '=', id)
        .returning('uuid')
        .executeTakeFirst()

    return fp?.uuid
}

export async function _setCurrentRegistrationOptions(
    user: { uuid: string },
    options: PublicKeyCredentialCreationOptionsJSON
) {
    console.log('==>', { user })

    await db
        .insertInto('passkey')
        .values({
            id: options.challenge,
            user_uuid: user.uuid,
            backed_up: false,
            counter: 0,
            device_type: '', // im gonna insert real value later
            public_key: Buffer.from(''), // im gonna insert real value later
            webauthn_user_id: options.user.id, //  im not sure if im saving the right value
        })
        .execute()
}

export async function setCurrentOptions(
    userUuid: string,
    options: PublicKeyCredentialCreationOptionsJSON
) {
    const session = await db
        .selectFrom('session')
        .select('uuid')
        .where('user_uuid', '=', userUuid)
        .where('expires_at', '>', new Date())
        .executeTakeFirst()

    if (!session) {
        throw new Error('Session not found')
    }

    await db
        .insertInto('current_challenge')
        .values({
            challenge: options.challenge,
            registration_options_user_id: options.user.id,
            session_uuid: session.uuid,
        })
        .execute()
}

export async function getCurrentOptions(userUuid: string) {
    const session = await db
        .selectFrom('session')
        .select('uuid')
        .where('user_uuid', '=', userUuid)
        .where('expires_at', '>', new Date())
        .executeTakeFirst()

    if (!session) {
        throw new Error('Session not found')
    }

    return await db
        .selectFrom('current_challenge')
        .select(['challenge', 'registration_options_user_id as registrationOptionsUserId'])
        .where('session_uuid', '=', session.uuid)
        .executeTakeFirst()
}

export async function updateUserWithWebauthn(userUuid: string) {
    return await db
        .updateTable('user')
        .set({ is_passkeys_enabled: true })
        .where('uuid', '=', userUuid)
        .execute()
}

export async function saveNewPasskeyInDB(newPasskey: {
    user: { uuid: string }
    id: string
    webAuthnUserID: string
    publicKey: Uint8Array
    counter: number
    deviceType: string
    backedUp: boolean
    transports?: string[]
}) {
    await db
        .insertInto('passkey')
        .values({
            id: newPasskey.id,
            webauthn_user_id: newPasskey.webAuthnUserID,
            public_key: Buffer.from(newPasskey.publicKey),
            counter: newPasskey.counter,
            device_type: newPasskey.deviceType,
            backed_up: newPasskey.backedUp,
            transports: JSON.stringify(newPasskey.transports),
            user_uuid: newPasskey.user.uuid,
        })
        .execute()
}

export async function saveBotAttempt(email: string) {
    await db.insertInto('recaptcha').values({ email }).execute()
}

export async function getUsersWithDevices() {
    return await db
        .selectFrom('user')
        .select([
            'user.uuid',
            'user.name',
            'user.email',
            'user.is_passkeys_enabled as isPasskeysEnabled',
            'user.created_at as createdAt',
            'user.is_admin as isAdmin',
        ])
        .leftJoin('passkey', 'user.uuid', 'passkey.user_uuid')
        .execute()
}

export async function getFootprints() {
    return await db
        .selectFrom('footprint')
        .select(['uuid', 'email', 'token', 'is_pristine as isPristine', 'created_at as createdAt'])
        .execute()
}

export async function getSessions() {
    return await db.selectFrom('session').selectAll().execute()
}

export async function getUserPasskeys(user: { uuid: string }) {
    return await db
        .selectFrom('passkey')
        .selectAll()
        .where('user_uuid', '=', user.uuid)
        .orderBy('created_at', 'desc')
        .execute()
}
export async function getSpecificUserPasskeys(user: User, currentChallengeId: string) {
    return await db
        .selectFrom('passkey')
        .selectAll()
        .where('user_uuid', '=', user.uuid.toString())
        .where('id', '=', currentChallengeId)
        .executeTakeFirst()
}

// export async function setCurrentAuthenticationOptions(
//     options: PublicKeyCredentialRequestOptionsJSON,
//     userUuid: string
// ) {
//     await db
//         .updateTable('passkey')
//         .set({ current_challenge_id: options.challenge })
//         // .where('current_challenge_id', '=', options.allowCredentials?.[0].id || '')
//         .where('user_uuid', '=', userUuid)
//         .returning('current_challenge_id')
//         .execute()
// }

export async function saveUpdatedCounter(passkeyId: string, newCounter: number) {
    await db
        .updateTable('passkey')
        .set({ counter: newCounter })
        .where('id', '=', passkeyId)
        .execute()
}
