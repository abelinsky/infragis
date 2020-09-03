import { injectable } from 'inversify';
import { StoredEvent } from '../event-sourcing';
import { DomesticProjector } from '../event-sourcing/projections/domestic-projector';
import { PostgresDatabase } from './postgres-database';
import { EventName } from '../types';
import { ITransactionable } from './transactionable';

interface OffsetCounter {
  projectorGroupId: string;
  topic: string;
  offset: number;
  projectionTime: string;
}

@injectable()
export abstract class PostgresDomesticProjector extends DomesticProjector {
  protected abstract database: PostgresDatabase;
  private readonly offsetTrackerTableName = 'projection_offsets';

  protected get transactionProvider(): ITransactionable {
    return this.database;
  }

  private Counter = () => this.database.knex<OffsetCounter>(this.offsetTrackerTableName);

  async getOffset(topic: string): Promise<number> {
    await this._ensureOffsetCounterTable(this.offsetTrackerTableName, this.getTopics());
    const counter = await this.Counter()
      .select()
      .where('projectorGroupId', this.groupId)
      .andWhere({ topic })
      .first();
    return counter?.offset ?? 0;
  }

  async setOffset(lastProjectedEvent: StoredEvent): Promise<void> {
    const topic = EventName.fromString(lastProjectedEvent.name).getTopic();
    await this.Counter().where('projectorGroupId', this.groupId).andWhere({ topic }).update({
      offset: lastProjectedEvent.sequence,
      projectionTime: new Date().toISOString(),
    });
  }

  private async _ensureOffsetCounterTable(tableName: string, topics: string[]): Promise<void> {
    try {
      const exists = await this.database.knex.schema.hasTable(tableName);
      if (!exists) await this._createOffsetCounterTable(tableName);

      for (const topic of topics) {
        const data = await this.Counter().select('*').where({ topic });
        if (data.length) continue;
        await this.Counter()
          .insert({
            topic,
            projectorGroupId: this.groupId,
            offset: 0,
            projectionTime: new Date().toISOString(),
          })
          .into(tableName);
      }
    } catch (error) {
      this.logger.error(error, `Failed to create/query table ${tableName}.`);
      throw error;
    }
  }

  private async _createOffsetCounterTable(tableName: string): Promise<void> {
    const knex = this.database.knex;
    await knex.schema.createTable(tableName, function (table) {
      table.increments().primary();
      table.string('projector_group_id');
      table.string('topic');
      table.integer('offset');
      table.dateTime('projection_time').defaultTo(knex.fn.now());
      table.unique(['projector_group_id', 'topic']);
    });
  }
}
