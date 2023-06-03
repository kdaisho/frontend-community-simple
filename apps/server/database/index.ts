import {
    type ColumnType,
    type Generated,
    Kysely,
    PostgresDialect,
} from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

interface PersonTable {
    id: Generated<number>
    first_name: string
    gender: 'male' | 'female' | 'other'
    middle_name: string | null
    last_name: string | null
    created_at: ColumnType<Date, string | undefined, never>
}

interface Todo {
    id: Generated<number>
    task: string
    completed: boolean
    created_at: ColumnType<Date, string | undefined, never>
}

export interface Database {
    person: PersonTable
    todo: Todo
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
})
