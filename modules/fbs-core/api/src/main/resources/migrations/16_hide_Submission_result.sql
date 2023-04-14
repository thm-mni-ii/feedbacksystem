BEGIN;

ALTER TABLE task ADD COLUMN hide_result BOOLEAN;

INSERT INTO migration (number) VALUES (16);

COMMIT;
