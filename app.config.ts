import type { User } from '~/types/User'

export default defineAppConfig({
  hiyieldNuxtLayerFirebaseAuth: {
    /**
     * The amount of retries to pass to $fetch when using the $authedFetch composable.
     * @see https://github.com/unjs/ofetch#%EF%B8%8F-auto-retry
     */
    authedFetchRetryAmount: 0,
    /**
     * The type of the user object to use to type the store.
     * Use type casting here as below. The only thing this is used for is the type.
     * The type cast here will be used to type the `userDoc` ref in the auth store.
     */
    userDocType: {} as User,
    /**
     * The firestore collection in which to store user data.
     */
    userCollection: 'users',
    /**
     * The user defaults to use when creating a new user after signup.
     * Use the special keys `_now_` which will be replaced with the current timestamp in ISO format
     * and `_uid_` which will be replaced with the user's uid.
     */
    userDefaults: {
      created: '_now_',
      uid: '_uid_'
    }
  },
  hiyieldNuxtLayerFirebase: {
    /**
     * This is the name that will be used to create a service
     * account for local development. If it's omitted, we will
     * try to use the name of the development machine's current
     * user. If that fails, we will use nanoid to make a random uid.
     */
    yourName: '',
    /**
     * This will be used to create the useDb() and useServerDb() composables.
     * Read more about this in the readme.
     */
    dbCollections: {
      users: { type: {} as User }
    },
    /**
     * If the firebase storage functions should be available.
     */
    initStorage: {
      /**
       * If the firebase storage functions should be available on the client.
       */
      client: false,
      /**
       * If the firebase storage functions should be available on the server.
       */
      server: false
    },
    /**
     * If the firebase auth functions should be available.
     */
    initAuth: {
      /**
       * If the firebase auth functions should be available on the client.
       */
      client: true,
      /**
       * If the firebase auth functions should be available on the server.
       */
      server: true
    },
    /**
     * If the firebase firestore functions should be available.
     */
    initFirestore: {
      /**
       * If the firebase firestore functions should be available on the client.
       */
      client: true,
      /**
       * If the firebase firestore functions should be available on the server.
       */
      server: true
    }
  }
})
