import { injectable } from 'inversify';

import { StoredEvent } from '../event-sourcing';
import { DomesticProjector } from '../event-sourcing/projections/domestic-projector';

import { PostgresDatabase } from './postgres-database';

interface SequencePositionCounter {
  projectorName: string;
  sequencePosition: number;
  projectionTime: Date;
}

@injectable()
export abstract class PostgresDomesticProjector extends DomesticProjector {
  abstract database: PostgresDatabase;
  abstract projectorName: string;
  protected counterTableName = 'projection_counters';

  abstract async getEvents(after: number): Promise<StoredEvent[]>;

  protected Counter = () => this.database.knex<SequencePositionCounter>(this.counterTableName);

  async getPosition(): Promise<number> {
    await this.ensureSequenceCounterTable(this.counterTableName);
    const counter = await this.Counter()
      .select()
      .where('projector_name', this.projectorName)
      .first();
    return counter?.sequencePosition ?? 0;
  }

  async increasePosition(): Promise<void> {
    const pos = await this.getPosition();
    await this.Counter()
      .where('projector_name', this.projectorName)
      .update({
        sequencePosition: pos + 1,
      });
  }

  private async ensureSequenceCounterTable(tableName: string): Promise<void> {
    try {
      const exists = await this.database.knex.schema.hasTable(tableName);
      !exists && (await this._createSequenceCounterTable(tableName));
      const data = await this.database.knex.select('*').from(tableName);
      !data.length &&
        (await this.database.knex
          .insert({
            projector_name: this.projectorName,
            sequence_position: 0,
            projection_time: new Date(),
          })
          .into(tableName));
    } catch (error) {
      this.logger.error(error, `Failed to create table ${tableName}`);
      throw error;
    }
  }

  private async _createSequenceCounterTable(tableName: string): Promise<void> {
    const knex = this.database.knex;
    await this.database.knex.schema.createTable(tableName, function (t) {
      t.increments();
      t.string('projector_name').unique();
      t.integer('sequence_position');
      t.dateTime('projection_time').defaultTo(knex.fn.now());
    });
  }
}
