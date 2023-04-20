BEGIN;

ALTER TABLE sql_playground_query ADD COLUMN creator_id integer not null;

INSERT INTO migration (number) VALUES (17);

COMMIT;
