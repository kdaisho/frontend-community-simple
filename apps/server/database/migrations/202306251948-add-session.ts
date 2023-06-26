// migration 2023-06-25, 19:48
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db)

    await db.schema
        .createTable('session')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('token', 'uuid', col => col.defaultTo(sql`uuid_generate_v4()`))
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .addColumn('expires_at', 'timestamp', col => col.notNull())
        .addColumn('user_id', 'integer', col =>
            col.references('user.id').onDelete('cascade').onUpdate('cascade')
        )
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('session').execute()
}
