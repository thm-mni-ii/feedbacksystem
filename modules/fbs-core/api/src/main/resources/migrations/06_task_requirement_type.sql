BEGIN;

alter table task
    add requirement_type VARCHAR(200) not null;

INSERT INTO migration (number) VALUES (6);

COMMIT;
