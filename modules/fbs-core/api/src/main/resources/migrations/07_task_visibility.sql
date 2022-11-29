BEGIN;

alter table task
    add is_private TINYINT(1) not null default 0;

INSERT INTO migration (number) VALUES (7);

COMMIT;
