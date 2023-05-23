import { Pool } from 'pg'
import { Kysely, PostgresDialect, Generated, ColumnType } from 'kysely'
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

console.log('==>', process.env.DATABASE_URL)

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
})

// async function demo() {
//     const { id } = await db
//         .insertInto('person')
//         .values({ first_name: 'Jennifer', gender: 'female' })
//         .returning('id')
//         .executeTakeFirstOrThrow()

//     console.log('DONE! ==>', id)
// }

// demo()
