import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { DB } from './types'

const { DATABASE_URL } = process.env

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: `${DATABASE_URL}`,
        }),
    }),
})
