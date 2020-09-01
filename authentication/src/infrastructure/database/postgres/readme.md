# To create migration file:

- Run `knex migrate:make migration_name -x ts`
- Edit new migration file `./migrations/XXXXX_migration_name.ts`
- Migrations will run automatically during service startup
