BEGIN;

create table checkrunner_sub_task
(
    configuration_id int not null,
    sub_task_id int not null,
    name varchar(64) not null,
    points int not null,
    primary key (configuration_id, sub_task_id),
    constraint checkrunner_sub_task_configuration_id_fk
        foreign key (configuration_id) references checkrunner_configuration (configuration_id)
            on update cascade on delete cascade
);

create table checkrunner_sub_task_result
(
    configuration_id int not null,
    sub_task_id int not null,
    submission_id int not null,
    ponts int not null,
    primary key (configuration_id, sub_task_id, submission_id),
    constraint checkrunner_sub_task_result_checkrunner_configuration_id_fk
        foreign key (configuration_id, submission_id) references checker_result (configuration_id, submission_id)
            on update cascade on delete cascade,
    constraint checkrunner_sub_task_result_checkrunner_sub_task_fk
        foreign key (configuration_id, sub_task_id) references checkrunner_sub_task (configuration_id, sub_task_id)
            on update cascade on delete cascade
);

INSERT INTO migration (number) VALUES (2);

COMMIT;
