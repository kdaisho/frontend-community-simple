/* eslint-disable @typescript-eslint/no-explicit-any */
// migration 2023-11-19, 18:45
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('recaptcha')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('email', 'varchar', col => col.unique().notNull())
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('recaptcha').execute()
}
