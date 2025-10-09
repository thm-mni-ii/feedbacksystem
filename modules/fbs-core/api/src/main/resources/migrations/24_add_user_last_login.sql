BEGIN;

ALTER TABLE `fbs`.`user`
    ADD `last_login` DATETIME NULL DEFAULT NULL;

INSERT INTO migration (number) VALUES (24);

COMMIT;
