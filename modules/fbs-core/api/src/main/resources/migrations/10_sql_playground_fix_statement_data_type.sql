BEGIN;

ALTER TABLE sql_playground_query MODIFY statement TEXT;

INSERT INTO migration (number) VALUES (10);

COMMIT;
