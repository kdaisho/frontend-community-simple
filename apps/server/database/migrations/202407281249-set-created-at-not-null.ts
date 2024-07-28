// migration 2024-07-28, 12:49
import { Kysely, sql } from 'kysely'

// set created_at not null for user, todo, session, footprint, recaptcha table while changing type from timestamp to timestamptz
// add created_at column and set to null for passkey

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .alterColumn('created_at', col => col.setDataType('timestamptz'))
        .alterColumn('created_at', col => col.setNotNull())
        .execute()

    await db.schema
        .alterTable('todo')
        .alterColumn('created_at', col => col.setDataType('timestamptz'))
        .alterColumn('created_at', col => col.setNotNull())
        .execute()

    await db.schema
        .alterTable('session')
        .alterColumn('created_at', col => col.setDataType('timestamptz'))
        .alterColumn('created_at', col => col.setNotNull())
        .alterColumn('token', col => col.setNotNull())
        .execute()

    await db.schema
        .alterTable('footprint')
        .alterColumn('created_at', col => col.setDataType('timestamptz'))
        .alterColumn('created_at', col => col.setNotNull())
        .execute()

    await db.schema
        .alterTable('recaptcha')
        .alterColumn('created_at', col => col.setDataType('timestamptz'))
        .alterColumn('created_at', col => col.setNotNull())
        .execute()

    await db.schema
        .alterTable('passkey')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('user')
        .alterColumn('created_at', col => col.setDataType('timestamp'))
        .alterColumn('created_at', col => col.dropNotNull())
        .execute()

    await db.schema
        .alterTable('todo')
        .alterColumn('created_at', col => col.setDataType('timestamp'))
        .alterColumn('created_at', col => col.dropNotNull())
        .execute()

    await db.schema
        .alterTable('session')
        .alterColumn('created_at', col => col.setDataType('timestamp'))
        .alterColumn('created_at', col => col.dropNotNull())
        .alterColumn('token', col => col.dropNotNull())
        .execute()

    await db.schema
        .alterTable('footprint')
        .alterColumn('created_at', col => col.setDataType('timestamp'))
        .alterColumn('created_at', col => col.dropNotNull())
        .execute()

    await db.schema
        .alterTable('recaptcha')
        .alterColumn('created_at', col => col.setDataType('timestamp'))
        .alterColumn('created_at', col => col.dropNotNull())
        .execute()

    await db.schema.alterTable('passkey').dropColumn('created_at').execute()
}
