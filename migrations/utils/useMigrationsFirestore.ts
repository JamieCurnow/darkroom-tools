import type { User } from '../../types/User'
import type { MigrationDoc } from '../../types/Migrations'
import type { CollectionReference, DocumentReference } from 'firebase-admin/firestore'
import { getFirestore } from 'firebase-admin/firestore'

export const useMigrationsFirestore = () => {
  const firestore = getFirestore()

  return {
    migrationRuns: firestore.collection('migrations').doc('runs') as DocumentReference<MigrationDoc>,
    users: firestore.collection('users') as CollectionReference<User>
  }
}
