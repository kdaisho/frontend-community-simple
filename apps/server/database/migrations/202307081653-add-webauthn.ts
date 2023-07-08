// migration 2023-07-08, 16:53
import { Kysely, sql } from 'kysely'
import type { Database } from '../index'

export async function up(db: Kysely<Database>): Promise<void> {
    await db.schema
        .createTable('webauthn')
        .ifNotExists()
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', col =>
            col.references('user.id').unique().onDelete('cascade').onUpdate('cascade')
        )
        .addColumn('current_challenge', 'text', col => col.notNull())
        .addColumn('device', 'text', col => col.notNull())
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
    await db.schema.dropTable('webauthn').execute()
}
