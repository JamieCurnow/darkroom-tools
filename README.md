# Nuxt 3 Full Stack Firebase Starter

This template is a starting point for using Nuxt 3 with Firebase in a full-stack setup. There is SSR and static content. The server side is
deployed using Firebase Web Frameworks which will end up on a V2 firebase cloud function (Cloud run under the hood). The static content
will be served on Firebase Hosting as a CDN.

There is a `functions` directory where you can deploy custom cloud functions. Everything else is standard Nuxt-land stuff.
Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

It comes pre-packed with [Nuxt Ui](https://ui.nuxt.com/) which in turn uses Tailwind CSS.

It's using the following Hiyield Nuxt Layers:

- [@hiyield/nuxt-layer-firebase](https://github.com/hiyield/nuxt-layer-firebase)
- [@hiyield/nuxt-layer-firebase-auth](https://github.com/hiyield/nuxt-layer-firebase-auth)
- [@hiyield/nuxt-layer-ui](https://github.com/hiyield/nuxt-layer-ui)

Go check the docs on those for detailed setup steps, or follow the setup below to get started quickly...

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Firebase

Go and create a new project in the [Firebase console](https://console.firebase.google.com/u/0/). Once created, you'll want to set up billing or else you will not be able to deploy.
You also need to enable the following services:

- Authentication
- Cloud Firestore
- Cloud Functions
- Hosting

Once the project is set up, find and replace the string `<your_project_id>` in the whole repo with your actual firebase project id. Or go and manually update the following files:

- `.firebaserc`
- `functions/src/index.ts`
- `.github/workflows/firebase-hosting-pull-request.yml`

Do the same for a production firebase project if another environment is needed and remember to update the `procuction` project id in `.firebaserc`.

## Env vars

Env vars are managed by [Doppler](https://doppler.com). So go and create a new project there. Give the project the same name are the firebase project. You can make a config in doppler for each environment you need. This template is setup to have a `staging` config for staging and local dev, and a `production` config for production.

There's a file names `.env.example` in the root. Copy this file to `.env` and fill in the `DOPPLER_SERVICE_TOKEN` env var with the doppler service token for the project/config. [Generate your key](https://docs.doppler.com/docs/service-tokens). You will also need to add this key to the github repo as a secret. The name of the secret should be `DOPPLER_SERVICE_TOKEN`. You'll need to add one called `DOPPLER_SERVICE_TOKEN_PRODUCTION` too if you want to deploy to a different project for production.

You should also set a `GOOGLE_APPLICATION_CREDENTIALS` env var which should always be equal to `"./firebase-service-account.json"`

```txt
GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
```

There are some env vars that you will need to make firebase work out-of-the-box. You can get the values from the [Firebase console](https://console.firebase.google.com/u/0/).

Required values are:

- NUXT_PUBLIC_FIREBASE_API_KEY
- NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NUXT_PUBLIC_FIREBASE_PROJECT_ID
- NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NUXT_PUBLIC_FIREBASE_APP_ID
- NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID

Make sure you add these to doppler, or if you're not using firebase in the app (just using it for deployment) then you can omit these and remove the firebase layers from the `extends` key in the `nuxt.config.ts` file.

When you need to add more env vars, add them to Doppler, and then trigger a re-build of the github actions workflow. This will update the env vars in the build and deploy the built code up to firebase.

### **Important**

If you need any env vars to be available at build time, they must be added to the github actions files in `.github/workflows` in the build step. You can either hard code in if they're public, or use Github Secrets to store them. Almost the only reason for adding env vars at biuld time is if you need to reference them in the `nuxt.config.ts` file.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Deployment

There is a github action that will deploy the app to the staging environment project on push to `main`, and to the production environment
project on push to the `releases/production` branch. There's a manually invoked action that will merge main into `releases/production` for easy deployment. There is also an action that will be triggered on a PR to the main branch - this will make a preview deployment to the staging environment.

**You will need to add the github action secret for the GOOGLE_APPLICATION_CREDENTIALS** in order for the deployment to work.

To do this, run:

```bash
npm run createDeployServiceAccount:staging
```

or

```bash
npm run createDeployServiceAccount:production
```

Then add the generated secret to the github repo as instructed in the output of the command.

Also add the `DOPPLER_SERVICE_TOKEN` secret to the repo for staging, or the `DOPPLER_SERVICE_TOKEN_PRODUCTION` secret for production. This will give the workflow access to the correct Doppler config.

### Configuring the deployment

The `firebase.json` file is used to control some aspects of the deployment. Here you can set the region and the min/max instances etc. This file should have auto-completion to help you out, most of the configuration will be in the `hosting.frameworksBackend` object. Here's an example of the file:

```json
{
  "$schema": "https://raw.githubusercontent.com/firebase/firebase-tools/master/schema/firebase-config.json",
  "hosting": {
    "frameworksBackend": {
      "region": "europe-west1",
      "minInstances": 0,
      "maxInstances": 4,
      "concurrency": 80
    },
    "source": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
  },
   "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": ["node_modules", ".git", "firebase-debug.log", "firebase-debug.*.log"],
      "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
    }
  ]
}
```

If you need a different configuration in staging and production, you can use [deploy targets](https://firebase.google.com/docs/cli/targets).

## Step by step setup

This will set you up with a firebase project for staging / local dev, along with a Doppler config. If you need a production environment, you can follow the same steps again, but use a different firebase project and Doppler config.

You will need to install the [`gcloud` cli](https://cloud.google.com/sdk/docs/install) locally on your machine in order to create a service account for deployment.

1. [Create a new Github repo](https://github.com/new?owner=hiyield&template_name=nuxt-3-full-stack-firebase&template_owner=hiyield) using this repo as a template
2. Clone that repo down to your local machine
3. Go create a new project in the [Firebase console](https://console.firebase.google.com) (or find an existing project you want to use)
4. Set up firebase auth in the firebase console to use email/password provider
5. Enable Cloud Firestore in the firebase console
6. Set up the firebase rules to allow read/write access to the user's collection for authenticated users only:

    ```js
    rules_version = '2';

    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if false;
        }
        
        match /users/{userId} {
          allow read, write: if request.auth.uid == userId
        }
      }
    }
    ```

7. Enable Cloud Functions in the firebase console
8. Go to the settings page in the firebase console and create a new "app" for "web". The name doesn't matter, but make sure you set up hosting at the same time by clicking the tick box. Then just go next, next, next until you're back at the settings page.
9. Scroll down a little further from that button and copy the `firebaseConfig` object value - we'll use this in one of the next steps in doppler.
10. Log in to [Doppler](https://dashboard.doppler.com/login) and create a new project.
11. Add the project name to the `doppler` object in the `nuxt.config.ts` file.
12. Doppler will create 3 configs - `dev` `stg` and `prd`. You can use these, but those names are a bit icky. Usually we have a `staging` and `production` env, so delete the `dev` config and rename `stg` to `staging` and `prd` to `production`. **IF you don't do this, you'll need to update the `ENV` environment variable in the github actions files to match the names of the configs in Doppler.**
13. Open up the staging env and add the following env vars, the values can be found in the firebase console:

    - NUXT_PUBLIC_FIREBASE_API_KEY
    - NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    - NUXT_PUBLIC_FIREBASE_PROJECT_ID
    - NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    - NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    - NUXT_PUBLIC_FIREBASE_APP_ID
    - NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID

    You can actually copy/paste the object from the firebase config code example into Doppler and it will parse it for you and create the env vars, then you just need to update the env var names to match the ones above. Note that if you did not set up Firebase Analytics you will not have a `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` value - that is ok, just omit it.

    Make sure you save those Doppler env vars.

14. Go and get a Doppler service token for the config. Click the access tab, or follow the [Doppler service token guide](https://docs.doppler.com/docs/service-tokens). It should have `read` access only and never expire.
15. Copy the `.env.example` file in the root of this repo to a new file called `.env` and add the `DOPPLER_SERVICE_TOKEN` to it.
16. Check the doppler settings in your nuxt.config.ts file and make sure the `project` key matches the name of the project you created in Doppler.
17. Also add a new service token as a new secret called `DOPPLER_SERVICE_TOKEN_DEV` in the Github Actions secrets for the repo. This is on the `github repo -> settings -> secrets and variables -> actions` page.
18. Do a find-and-replace in the whole repo for the string `<your_project_id>` and replace it with the actual firebase project id. You can find this in the firebase console - it should be the same as the `NUXT_PUBLIC_FIREBASE_PROJECT_ID` env var that you added to doppler.
19. Run `npm i` to install the dependencies
20. Run `npm run createDeployServiceAccount:dev` to create a service account for the Github action to be able to deploy the app.
21. Copy the output of the command and set the `GOOGLE_APPLICATION_CREDENTIALS_DEV` secret in the Github Actions secrets for the repo. The command will give you a link to the page where you can add the secret. The secret value is the whole JSON object, and you want to make sure that there is no whitespace surrounding the JSON object.
22. Run `npm run dev` - this will create and download a firebase-service-account.json on the first run, and you'll need to run it again to start the dev server.
23. Run `npm run dev` again to start the dev server - you should be able to go to `http://localhost:3000` and see the app running.
24. Commit your code and push it up to the main branch to deploy. Your app should be available at `https://<your_project_id>.web.app` once the deployment is complete. Check the Github actions for the status of the deployment.
