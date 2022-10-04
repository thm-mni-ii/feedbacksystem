BEGIN;

alter table task
    add requirement_type VARCHAR(20) not null default 'mandatory';

INSERT INTO migration (number) VALUES (6);

COMMIT;
