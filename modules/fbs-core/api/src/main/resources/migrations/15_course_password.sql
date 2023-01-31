BEGIN;

alter table course
    add password TEXT;

INSERT INTO migration (number) VALUES (14);

COMMIT;
