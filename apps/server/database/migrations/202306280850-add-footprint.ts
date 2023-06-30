// migration 2023-06-28, 08:50
import { Kysely, sql } from 'kysely'
import type { Database } from '../index'

export async function up(db: Kysely<Database>): Promise<void> {
    await db.schema
        .createTable('footprint')
        .ifNotExists()
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('email', 'varchar', col => col.notNull())
        .addColumn('token', 'text', col => col.notNull())
        .addColumn('pristine', 'boolean', col => col.notNull().defaultTo(true))
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
    await db.schema.dropTable('footprint').execute()
}
