BEGIN;

alter table checkrunner_configuration
    add main_file_name VARCHAR(255) null after secondary_file_uploaded,
    add secondary_file_name VARCHAR(255) null after main_file_name;

INSERT INTO migration (number) VALUES (26);

COMMIT;
