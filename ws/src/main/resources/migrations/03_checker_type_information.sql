BEGIN;

alter table checkrunner_configuration
    add checker_type_information json null;

INSERT INTO migration (number) VALUES (3);

COMMIT;
