import dotenv from 'dotenv'
import { promises as fs } from 'fs'
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely'
import * as path from 'path'
import { Pool } from 'pg'
import type { Database } from './index'

dotenv.config()

const { DB_CONNECTION, DB_NAME } = process.env

async function migrateDown() {
    const db = new Kysely<Database>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: `${DB_CONNECTION}/${DB_NAME}`,
            }),
        }),
    })

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, 'migrations'),
        }),
    })

    const { error, results } = await migrator.migrateDown()

    results?.forEach(it => {
        if (it.status === 'Success') {
            console.info(`migration down "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration down: "${it.migrationName}"`)
        }
    })

    if (error) {
        console.error('failed to migrate down')
        console.error(error)
        process.exit(1)
    }

    await db.destroy()
}

migrateDown()
