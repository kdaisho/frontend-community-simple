import { type ColumnType, type Generated, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

const { DATABASE_URL } = process.env

interface Todo {
    id: Generated<string>
    task: string
    user_id: string
    completed: boolean
    created_at: ColumnType<Date, string | undefined, never>
}

interface User {
    id: Generated<string>
    name: string
    email: string
    current_challenge: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    devices: any | null
    webauthn: boolean
    created_at: ColumnType<Date, string | undefined, never>
    is_admin: boolean | null
}

interface Session {
    id: Generated<string>
    token: Generated<string>
    created_at: Generated<Date | null>
    expires_at: ColumnType<Date>
    user_id: string | null
}

interface Footprint {
    id: Generated<string>
    email: string
    token: string
    pristine: boolean
    created_at: ColumnType<Date, string | undefined, never>
}

interface Recaptcha {
    id: Generated<number>
    email: string
    created_at: ColumnType<Date, string | undefined, never>
}

export interface Database {
    todo: Todo
    user: User
    session: Session
    footprint: Footprint
    recaptcha: Recaptcha
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: `${DATABASE_URL}`,
        }),
    }),
})
