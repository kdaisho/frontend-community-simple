// migration 2024-07-31, 14:09
import { Kysely, sql } from 'kysely'

/**
 * create current_challenge table to temporarily store challenge value
 * this could be done with session but for me it's more clear to have separate table
 *
 * drop current_challenge_id column from passkey table
 * it will be handled by current_challenge table
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('current_challenge')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('challenge', 'text', col => col.notNull())
        .addColumn('registration_options_user_id', 'text')
        .addColumn('user_uuid', 'uuid', col =>
            col.references('user.uuid').onDelete('cascade').onUpdate('cascade')
        )
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
        .execute()

    await db.schema.alterTable('passkey').dropColumn('current_challenge_id').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('current_challenge').execute()
    await db.schema.alterTable('passkey').addColumn('current_challenge_id', 'text').execute()

    await db.updateTable('passkey').set({ current_challenge_id: '' }).execute()

    await db.schema
        .alterTable('passkey')
        .alterColumn('current_challenge_id', col => col.setNotNull())
        .execute()
}
