/* eslint-disable @typescript-eslint/no-explicit-any */
// migration 2023-11-19, 19:17
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('todo')
        .addColumn('user_id', 'uuid', col =>
            col.references('user.id').onDelete('cascade').onUpdate('cascade')
        )
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('todo').dropColumn('user_id').execute()
}
