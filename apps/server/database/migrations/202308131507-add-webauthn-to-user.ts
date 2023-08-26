// migration 2023-08-13, 15:07
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .addColumn('current_challenge', 'text')
        .addColumn('devices', 'json')
        .execute()

    // drop table 'webauthn'
    await db.schema.dropTable('webauthn').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .dropColumn('current_challenge')
        .dropColumn('devices')
        .execute()

    // re-create table 'webauthn'
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
