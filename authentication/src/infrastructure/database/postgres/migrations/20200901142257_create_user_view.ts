import * as Knex from 'knex';
import { TableBuilder } from 'knex';

const TABLE_NAME = 'user_view';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table: TableBuilder) => {
    table.uuid('userId').primary().notNullable();
    table.string('email', 255).notNullable();
    table.timestamp('createdAt');
    table.uuid('sessionId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME);
}
