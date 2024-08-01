// migration 2024-08-01, 07:12
import { Kysely } from 'kysely'

/**
 * drop column is_passkeys_enabled from user table as
 * the app references passkey table to see if the user has passkeys
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('user').dropColumn('is_passkeys_enabled').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .addColumn('is_passkeys_enabled', 'boolean', col => col.notNull().defaultTo(false))
        .execute()
}
