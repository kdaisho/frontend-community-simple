// migration 2024-07-28, 07:39
import { Kysely } from 'kysely'

/**
 * This separate passkey information and user information.
 * 1. create passkey table with id (integer) PK, current_challenge (text), devices (json), user_id (uuid) FK
 * 2 move data (current_challenge, devices) from user to passkey and also associate them using user_id
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('passkey')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('current_challenge', 'text')
        .addColumn('devices', 'json')
        .addColumn('user_uuid', 'uuid', col =>
            col.references('user.id').onDelete('cascade').onUpdate('cascade')
        )
        .execute()

    const userPasskeys = await db
        .selectFrom('user')
        .select(['id', 'current_challenge', 'devices'])
        .execute()

    for (const user of userPasskeys) {
        await db
            .insertInto('passkey')
            .values({
                current_challenge: user.current_challenge,
                devices: JSON.stringify(user.devices),
                user_uuid: user.id,
            })
            .execute()
    }

    await db.schema
        .alterTable('user')
        .dropColumn('current_challenge')
        .dropColumn('devices')
        .execute()

    await db.schema.alterTable('footprint').renameColumn('id', 'uuid').execute()

    await db.schema.alterTable('todo').renameColumn('id', 'uuid').execute()

    await db.schema.alterTable('todo').renameColumn('user_id', 'user_uuid').execute()

    await db.schema.alterTable('session').renameColumn('id', 'uuid').execute()

    await db.schema.alterTable('session').renameColumn('user_id', 'user_uuid').execute()

    await db.schema.alterTable('user').renameColumn('id', 'uuid').execute()

    await db.schema.alterTable('user').renameColumn('webauthn', 'is_passkeys_enabled').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .addColumn('current_challenge', 'text')
        .addColumn('devices', 'json')
        .execute()

    await db.schema.alterTable('user').renameColumn('uuid', 'id').execute()

    await db.schema.alterTable('user').renameColumn('is_passkeys_enabled', 'webauthn').execute()

    await db.schema.alterTable('footprint').renameColumn('uuid', 'id').execute()

    await db.schema.alterTable('todo').renameColumn('uuid', 'id').execute()

    await db.schema.alterTable('todo').renameColumn('user_uuid', 'user_id').execute()

    await db.schema.alterTable('session').renameColumn('uuid', 'id').execute()

    await db.schema.alterTable('session').renameColumn('user_uuid', 'user_id').execute()

    const passkeys = await db
        .selectFrom('passkey')
        .select(['current_challenge', 'devices', 'user_uuid'])
        .execute()

    for (const passkey of passkeys) {
        await db
            .updateTable('user')
            .set({
                current_challenge: passkey.current_challenge,
                devices: JSON.stringify(passkey.devices),
            })
            .where('id', '=', passkey.user_uuid)
            .execute()
    }

    await db.schema.dropTable('passkey').execute()
}
