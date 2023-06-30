// migration 2023-05-22, 21:48
import { Kysely, sql } from 'kysely'
import type { Database } from '../index'

export async function up(db: Kysely<Database>): Promise<void> {
    await db.schema
        .createTable('todo')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('task', 'varchar', col => col.notNull())
        .addColumn('completed', 'boolean', col => col.notNull().defaultTo(false))
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
    await db.schema.dropTable('todo').execute()
}
