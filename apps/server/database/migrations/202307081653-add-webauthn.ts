/* eslint-disable @typescript-eslint/no-explicit-any */
// migration 2023-07-08, 16:53
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('webauthn')
        .ifNotExists()
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', col =>
            col.references('user.id').unique().onDelete('cascade').onUpdate('cascade')
        )
        .addColumn('current_challenge', 'text', col => col.notNull())
        .addColumn('devices', 'json')
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('webauthn').execute()
}
