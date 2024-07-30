// migration 2024-07-29, 15:43
import { Kysely } from 'kysely'

// upgrade webauthn to version 10
// alter passkey table as follows:
// add id as text, public_key as bytea, webauthn_user_id as text and index this column, plus
// unique constraint on webauthn_user_id and user_uuid,
// add counter as integer, add device_type as varchar(32) ex: 'singleDevice' | 'multiDevice',
// add backed_up as boolean, add transports  as text

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('passkey')
        .dropColumn('id')
        .addColumn('current_challenge_id', 'text', col => col.notNull())
        .addColumn('public_key', 'bytea', col => col.notNull())
        .addColumn('webauthn_user_id', 'text', col => col.notNull())
        .addColumn('counter', 'integer', col => col.notNull())
        .addColumn('device_type', 'varchar(32)', col => col.notNull())
        .addColumn('backed_up', 'boolean', col => col.notNull())
        .addColumn('last_used', 'timestamptz')
        .addColumn('transports', 'text')
        .alterColumn('user_uuid', col => col.setNotNull())
        .dropColumn('current_challenge')
        .dropColumn('devices')
        .execute()

    await db.schema
        .alterTable('passkey')
        .addUniqueConstraint('webauthn_user_id_user_uuid_unique', ['webauthn_user_id', 'user_uuid'])
        .execute()

    await db.schema
        .createIndex('webauthn_user_id_index')
        .ifNotExists()
        .on('passkey')
        .column('webauthn_user_id')
        .unique()
        .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('passkey')
        .dropColumn('current_challenge_id')
        .dropColumn('public_key')
        .dropColumn('webauthn_user_id')
        .dropColumn('counter')
        .dropColumn('device_type')
        .dropColumn('backed_up')
        .dropColumn('last_used')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('current_challenge', 'text')
        .addColumn('devices', 'json')
        .alterColumn('user_uuid', col => col.dropNotNull())
        .execute()

    await db.schema
        .alterTable('passkey')
        .dropConstraint('webauthn_user_id_user_uuid_unique')
        .ifExists()
        .execute()

    await db.schema.dropIndex('webauthn_user_id_index').ifExists().execute()
}
