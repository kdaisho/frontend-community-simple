// migration 2023-06-25, 19:48
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('session')
        .ifNotExists()
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('token', 'uuid', col => col.defaultTo(sql`gen_random_uuid()`))
        .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
        .addColumn('expires_at', 'timestamp', col => col.notNull())
        .addColumn('user_id', 'uuid', col =>
            col.references('user.id').onDelete('cascade').onUpdate('cascade')
        )
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('session').execute()
}
