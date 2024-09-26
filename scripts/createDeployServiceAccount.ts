import { rm, readFile } from 'fs/promises'
import { existsSync } from 'fs'

import * as util from 'util'
import * as childProcess from 'child_process'
import { join } from 'path'
const exec = util.promisify(childProcess.exec)

// Very minimal type for the service account
interface ServiceAccount {
  displayName: string
  email: string
}

const createDeployServiceAccountForProject = async (
  projectAlias: string,
  opts: { isStaging: boolean; isDev: boolean }
) => {
  const { isDev, isStaging } = opts
  try {
    // use gcloud to create a service account with the following roles:
    // Owner
    // Artifact Registry Admin
    // The name of the service account should be 'gh-actions-ci'
    const serviceAccountName = 'gh-actions-ci'
    console.log(`Creating the service account ${serviceAccountName} for project ${projectAlias}...`)

    console.log('Getting actual project name...')

    const firebaseRcPath = join(process.cwd(), '.firebaserc')

    if (!existsSync(firebaseRcPath)) {
      throw new Error('No .firebaserc file found')
    }

    const firebaseRc = await readFile(firebaseRcPath, 'utf-8')

    const projectId = JSON.parse(firebaseRc).projects[projectAlias]

    if (projectId.startsWith('<')) {
      throw new Error('Project ID not found in .firebaserc')
    }

    console.log(`Using project: ${projectId}`)

    // try and add the right permissions to the default compute engine service account
    // that will be used in deployment. First deploy will fail otherwise.
    console.log('Attempting to add the required roles to the default compute engine service accounts...')
    try {
      const allServiceAccountsRes = await exec(
        `gcloud iam service-accounts list --format json --project=${projectId}`
      )
      const allServiceAccounts: ServiceAccount[] = JSON.parse(allServiceAccountsRes.stdout)
      const defaultComputeServiceAccounts = allServiceAccounts.filter((sa) => {
        return (sa.displayName = 'Default compute service account')
      })

      if (defaultComputeServiceAccounts.length) {
        console.log('Adding the required roles to the default compute service accounts...')
        for (const serviceAccount of defaultComputeServiceAccounts) {
          const command = `gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccount.email}" `
          const defaultComputeRoles = ['roles/artifactregistry.reader']

          for (const role of defaultComputeRoles) {
            console.log(`Adding role ${role} to default compute engine service account...`)
            await exec(command + `--role="${role}"`)
          }
        }
      }
    } catch (e) {
      console.error(e)
      console.log('This error can be ignored')
    }

    console.log('Enabling the required APIs...')
    const apis = ['artifactregistry', 'cloudbuild', 'cloudfunctions', 'run', 'eventarc', 'pubsub', 'storage']

    for (const api of apis) {
      console.log(`Enabling API ${api}...`)
      await exec(`gcloud services enable ${api}.googleapis.com --project=${projectId}`)
    }

    console.log('Creating the service account...')
    await exec(`gcloud iam service-accounts create ${serviceAccountName} --project=${projectId}`).catch(
      (e) => {
        if (e.message.includes('already exists')) {
          console.log('Service account already exists, skipping...')
          return
        }
        throw e
      }
    )

    console.log('Adding the required roles to the service account...')

    const command = `gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccountName}@${projectId}.iam.gserviceaccount.com" `
    const roles = [
      'roles/artifactregistry.createOnPushWriter',
      'roles/owner',
      'roles/firebaseauth.admin',
      'roles/firebasehosting.admin',
      'roles/run.viewer',
      'roles/serviceusage.apiKeysViewer',
      'roles/artifactregistry.admin',
      'roles/artifactregistry.reader'
    ]
    for (const role of roles) {
      console.log(`Adding role ${role}...`)
      await exec(command + `--role="${role}"`)
    }

    // get a service account key in memory
    console.log('Downloading the service account key...')
    const { stdout } = await exec(
      `gcloud iam service-accounts keys create - --iam-account=${serviceAccountName}@${projectId}.iam.gserviceaccount.com`
    )
    const serviceAccountKey = JSON.parse(stdout)

    // that command weirdly creates an empty temp file at './-', so we need to delete it
    // delete the temp file
    console.log('Deleting the temp file...')
    await rm('./-').catch((e) => {
      if (e.message.includes('no such file or directory')) {
        return
      }
      throw e
    })

    console.log('Secret Value:\n\n', JSON.stringify(serviceAccountKey, null, 2), '\n\n')

    console.log('****** Add this service account key to the GitHub secrets for the project ******')

    // get the remote to get a url
    const gitRemote = await exec('git remote get-url origin')
    if (gitRemote.stdout.startsWith('git@github.com')) {
      const repoPath = gitRemote.stdout.split(':')[1].replace('.git', '').trim()
      const url = `https://github.com/${repoPath}/settings/secrets/actions/new`
      console.log(url)
    }

    const secretName = isDev
      ? 'GOOGLE_APPLICATION_CREDENTIALS_DEV'
      : isStaging
        ? 'GOOGLE_APPLICATION_CREDENTIALS'
        : 'GOOGLE_APPLICATION_CREDENTIALS_PRODUCTION'
    console.log('Secret name:', secretName)
  } catch (e) {
    console.error('Could not create the service account')
    console.log('Please make sure you have access to the project and try again')
    console.error(e)
    process.exit(1)
  }
}

const projectAlias = process.argv[2]
if (!projectAlias) throw new Error('Please provide a project name')
const isStaging = projectAlias === 'staging'
const isDev = projectAlias === 'dev'

createDeployServiceAccountForProject(projectAlias!, { isStaging, isDev })
