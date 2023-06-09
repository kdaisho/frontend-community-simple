import { type ColumnType, type Generated, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

interface Todo {
    id: Generated<string>
    task: string
    completed: boolean
    created_at: ColumnType<Date, string | undefined, never>
}

interface User {
    id: Generated<string>
    name: string
    email: string
    created_at: ColumnType<Date, string | undefined, never>
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

export interface Database {
    todo: Todo
    user: User
    session: Session
    footprint: Footprint
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
})
