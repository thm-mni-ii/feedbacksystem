BEGIN;

alter table user_task_submission
    add is_in_block_storage TINYINT(1) not null default 0;

INSERT INTO migration (number) VALUES (13);

COMMIT;
