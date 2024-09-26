import admin from 'firebase-admin'
import dotenv from 'dotenv'
import type { MigrationDoc } from '../types/Migrations'
import { useMigrationsFirestore } from './utils/useMigrationsFirestore'
import { testMigration } from './functions/testMigration'
dotenv.config()

/**
 * List all migration here!
 */
const migrations: Record<string, () => Promise<unknown>> = {
  testMigration
}

// init the firebase app
admin.initializeApp()

const run = async () => {
  // go get the migrations doc from the db
  const migrationsDocRef = useMigrationsFirestore().migrationRuns
  const migrationsDoc = await migrationsDocRef.get()
  const data = migrationsDoc.data() as MigrationDoc | undefined
  const migrationsData = data?.migrations || {}

  // We'll use this to update the migrations doc after all the migrations have run
  const migrationsDocUpdates = { migrations: { ...migrationsData } }

  // run the migrations
  for (const migrationName in migrations) {
    // if the migration has already run, skip it
    if (migrationsData[migrationName]?.hasRun) {
      console.log(`Migration ${migrationName} has already run - skipping`)
      continue
    }

    console.log(`Running migration: ${migrationName}`)
    await migrations[migrationName]()
    console.log(`Migration ${migrationName} complete`)
    migrationsDocUpdates.migrations[migrationName] = {
      hasRun: true,
      timestamp: new Date().toISOString()
    }
  }

  // update the migrations doc
  await migrationsDocRef.set(migrationsDocUpdates, { merge: true })
}

run()
