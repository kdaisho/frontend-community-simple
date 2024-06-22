// migration 2024-06-22, 10:04
import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .addColumn('is_admin', 'boolean', col => col.notNull().defaultTo(false))
        .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('user').dropColumn('is_admin').execute()
}
