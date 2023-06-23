import {
    type ColumnType,
    type Generated,
    Kysely,
    PostgresDialect,
} from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

interface Todo {
    id: Generated<number>
    task: string
    completed: boolean
    created_at: ColumnType<Date, string | undefined, never>
}

interface User {
    id: Generated<number>
    name: string
    email: string
    created_at: ColumnType<Date, string | undefined, never>
}

export interface Database {
    todo: Todo
    user: User
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
})
