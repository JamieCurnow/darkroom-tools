# Migrations

Migrations are not really a thing in Firestore because of the no-schema nature of the database.
But occasionally we need to make changes to the database that require some kind mutation to the whole db.

To do this, the index file will be run directly after a deploy from the github action.

Migration statuses should be maintained in the database in the `migrations/runs`.
And migration functions can be deleted from the codebase after they've been run in production. If you foresee them not being run again. However, because their run status is maintained in the database, they can be left and will not be run again if they've already run.

Check the `migrations/runs` doc in the db to see if a migration has been run.

Each migration will be keyed, and the key will be used in the `migrations/runs` doc to track if
the migration has been run.

Add migration functions to the `functions` folder, and import them in the `index.ts` file and expose them
on the `migrations` object to run them. They are just normal functions, no special shcema syntax is required.
They should just go get docs from the db and change them as needed.
