INSERT INTO events (
    event_id,
    aggregate_id,
    version,
    name,
    data,
    inserted_at,
    sequence
  )
VALUES (
    uuid_generate_v4(),
    uuid_generate_v4(),
    1,
    'infragis.events.session',
    '{"sessionId": "A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11", "userId": "U0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11", "email": "ab@ab.com"}',
    statement_timestamp(),
    1
  ),
  (
    uuid_generate_v4(),
    uuid_generate_v4(),
    1,
    'infragis.events.session',
    '{"sessionId": "B0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11", "userId": "B0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11", "email": "ab1@ab.com"}',
    statement_timestamp(),
    2
  ),
  (
    uuid_generate_v4(),
    uuid_generate_v4(),
    1,
    'infragis.events.session',
    '{"sessionId": "C0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11", "userId": "C0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11", "email": "ab2@ab.com"}',
    statement_timestamp(),
    3
  )