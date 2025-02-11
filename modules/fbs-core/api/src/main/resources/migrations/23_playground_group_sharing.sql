BEGIN;

ALTER TABLE `fbs`.`sql_playground_database`
    ADD `share_with_group_group_id` INT NULL DEFAULT NULL REFERENCES `group`(`group_id`);

INSERT INTO migration (number) VALUES (23);

COMMIT;
