// migration 2023-06-17, 13:57
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('user')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'varchar', col => col.notNull())
        .addColumn('email', 'varchar', col => col.notNull())
        .addColumn('created_at', 'timestamp', col => col.defaultTo('now()'))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user').execute()
}