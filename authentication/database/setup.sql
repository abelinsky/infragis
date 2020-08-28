CREATE TABLE IF NOT EXISTS "session_events" (
  "event_id" uuid PRIMARY KEY NOT NULL,
  "aggregate_id" uuid NOT NULL,
  "version" serial NOT NULL,
  "name" varchar(255) NOT NULL,
  "data" jsonb NOT NULL,
  "inserted_at" timestamp(6) NOT NULL DEFAULT statement_timestamp(),
  "sequence" serial NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_events" (
  "event_id" uuid PRIMARY KEY NOT NULL,
  "aggregate_id" uuid NOT NULL,
  "version" serial NOT NULL,
  "name" varchar(255) NOT NULL,
  "data" jsonb NOT NULL,
  "inserted_at" timestamp(6) NOT NULL DEFAULT statement_timestamp(),
  "sequence" serial NOT NULL
);
