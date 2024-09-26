import { https } from 'firebase-functions/v2'
import * as admin from 'firebase-admin'
import * as handlers from './handlers'
require('module-alias/register')

// init the firebase app
admin.initializeApp()

// get the projectId from firebase admin
const projectId = admin.instanceId().app.options.projectId || '<your_project_id>'
console.log(`Project ID: ${projectId}`)

// firestore settings
const firestoreSettings = { ignoreUndefinedProperties: true }
admin.firestore().settings(firestoreSettings)

// set the default region for all cloud functions
const region = 'europe-west2'

export const helloWorld = https.onRequest({ maxInstances: 1, memory: '128MiB', region }, handlers.helloWorld)
