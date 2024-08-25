// migration 2024-08-25, 11:32
import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('recaptcha')
        .dropConstraint('recaptcha_email_key')
        .ifExists()
        .execute()

    await db.schema.alterTable('recaptcha').dropConstraint('email_unique').ifExists().execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('recaptcha').addUniqueConstraint('email_unique', ['email']).execute()
}
