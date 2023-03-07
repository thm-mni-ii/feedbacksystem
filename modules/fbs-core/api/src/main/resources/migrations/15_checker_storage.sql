BEGIN;

create table checkrunner_storage (
    configuration_id integer not null,
    storage_key varchar(255) not null,
    value JSON,
    primary key (configuration_id, storage_key),
    FOREIGN KEY (configuration_id) REFERENCES checkrunner_configuration(configuration_id) on delete cascade on update cascade
) engine=InnoDB;

INSERT INTO migration (number) VALUES (15);

COMMIT;
