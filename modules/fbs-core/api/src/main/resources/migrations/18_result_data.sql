BEGIN;

ALTER TABLE checker_result ADD COLUMN result_data JSON;

INSERT INTO migration (number) VALUES (18);

COMMIT;
