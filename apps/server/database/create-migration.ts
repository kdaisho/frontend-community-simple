import fs from 'fs'

// Get the filename from command-line arguments
const name = process.argv[2]

if (!name) {
    console.error('Please provide a filename as a command-line argument.')
    process.exit(1)
}

const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const hours = String(now.getHours()).padStart(2, '0')
const minutes = String(now.getMinutes()).padStart(2, '0')

const path = './database/migrations/'
const filename = `${year}${month}${day}${hours}${minutes}-${name}.ts`

const content = `
// migration ${year}-${month}-${day}, ${hours}:${minutes}
import { Kysely, sql } from 'kysely'
import type { Database } from '../index'

export async function up(db: Kysely<any>): Promise<void> {}

export async function down(db: Kysely<any>): Promise<void> {}
`

fs.writeFile(path + filename, content, err => {
    if (err) {
        console.error('An error occurred:', err)
    } else {
        console.log(`File "${filename}" created successfully!`)
    }
})
