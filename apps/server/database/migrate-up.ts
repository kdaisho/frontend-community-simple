import dotenv from 'dotenv'
import { promises as fs } from 'fs'
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely'
import * as path from 'path'
import { Pool } from 'pg'
import type { DB } from './types'

dotenv.config()

const { DATABASE_URL } = process.env

async function migrateToLatest() {
    const db = new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: `${DATABASE_URL}`,
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

    const { error, results } = await migrator.migrateToLatest()

    results?.forEach(it => {
        if (it.status === 'Success') {
            console.info(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration: "${it.migrationName}"`)
        }
    })

    if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
    }

    await db.destroy()
}

migrateToLatest()
