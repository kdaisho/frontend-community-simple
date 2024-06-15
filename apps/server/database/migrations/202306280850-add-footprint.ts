/* eslint-disable @typescript-eslint/no-explicit-any */
// migration 2023-06-28, 08:50
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
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

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('footprint').execute()
}
