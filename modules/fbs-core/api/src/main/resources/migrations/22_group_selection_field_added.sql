BEGIN;

alter table `fbs`.`course`
    ADD `group_selection` BOOLEAN NULL DEFAULT NULL;

INSERT INTO migration (number) VALUES (22);

COMMIT;