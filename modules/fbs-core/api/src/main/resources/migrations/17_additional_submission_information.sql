BEGIN;

ALTER TABLE user_task_submission ADD COLUMN additional_information TEXT;

INSERT INTO migration (number) VALUES (17);

COMMIT;
