BEGIN;

create table checkrunner_storage (
    id integer not null auto_increment,
    configuration_id integer not null,
    submission_id integer default null,
    storage_key varchar(255) not null,
    value JSON,
    primary key (id),
    FOREIGN KEY (configuration_id) REFERENCES checkrunner_configuration(configuration_id) on delete cascade on update cascade,
    FOREIGN KEY (submission_id) REFERENCES user_task_submission(submission_id) on delete cascade on update cascade
) engine=InnoDB;

create unique index checkrunner_storage_configuration_id_storage_key_uindex on checkrunner_storage (configuration_id, storage_key);
create unique index checkrunner_storage_configuration_id_sub_storage_key_uindex on checkrunner_storage (configuration_id, submission_id, storage_key);

INSERT INTO migration (number) VALUES (15);

COMMIT;
