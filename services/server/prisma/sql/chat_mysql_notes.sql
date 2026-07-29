-- MySQL chat DDL (reference). Apply partitioning manually; Prisma manages base tables via db push/migrate.
-- UUIDs: Prisma uses CHAR(36) via @default(uuid()).

-- Optional monthly partitions for messages (run after messages table exists):
-- ALTER TABLE messages PARTITION BY RANGE (TO_DAYS(created_at)) (
--   PARTITION p202601 VALUES LESS THAN (TO_DAYS('2026-02-01')),
--   PARTITION p202602 VALUES LESS THAN (TO_DAYS('2026-03-01')),
--   PARTITION pmax VALUES LESS THAN MAXVALUE
-- );

-- Note: Do not add FK from messages.conversation_id -> conversations.id on a partitioned messages table.
