BEGIN;

ALTER TABLE sql_entity MODIFY data JSON;

-- Migrate result from Blob to JSON
ALTER TABLE sql_playground_query ADD column json_result JSON;
UPDATE sql_playground_query SET json_result = CAST(result AS CHAR CHARACTER SET utf8);
ALTER TABLE sql_playground_query DROP COLUMN `result`, RENAME COLUMN json_result to `result`;
--

INSERT INTO migration (number) VALUES (9);

COMMIT;
