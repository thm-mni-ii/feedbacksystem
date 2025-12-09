BEGIN;

ALTER TABLE `fbs`.`task`
    ADD `staged_feedback_enabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `fbs`.`task`
    ADD `staged_feedback_limit` INTEGER NULL DEFAULT NULL;

INSERT INTO migration (number) VALUES (24);

COMMIT;
