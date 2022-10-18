BEGIN;

alter table task
    modify deadline datetime null;

INSERT INTO migration (number) VALUES (4);

COMMIT;
