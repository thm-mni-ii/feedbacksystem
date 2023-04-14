BEGIN;

ALTER TABLE sql_playground_query ADD COLUMN creator_id INT;

INSERT INTO migration (number) VALUES (17);

COMMIT;
