// migration 2023-05-22, 19:06
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('person')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('first_name', 'varchar', col => col.notNull())
        .addColumn('middle_name', 'varchar')
        .addColumn('last_name', 'varchar')
        .addColumn('gender', 'varchar(50)', col => col.notNull())
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('person').execute()
}
