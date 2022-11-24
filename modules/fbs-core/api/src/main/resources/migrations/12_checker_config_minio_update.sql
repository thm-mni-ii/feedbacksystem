BEGIN;

alter table checkrunner_configuration
    add is_in_block_storage TINYINT(1) not null default 0;

INSERT INTO migration (number) VALUES (12);

COMMIT;
