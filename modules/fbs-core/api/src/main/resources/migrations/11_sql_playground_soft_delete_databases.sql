BEGIN;

ALTER TABLE sql_playground_database ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX sql_playground_database_deleted ON sql_playground_database (deleted);

INSERT INTO migration (number) VALUES (11);

COMMIT;
