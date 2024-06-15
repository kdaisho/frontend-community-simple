/* eslint-disable @typescript-eslint/no-explicit-any */
// migration 2023-07-08, 16:59
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .addColumn('webauthn', 'boolean', col => col.notNull().defaultTo(false))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('user').dropColumn('webauthn').execute()
}
