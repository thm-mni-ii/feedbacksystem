BEGIN;

CREATE TABLE `fbs`.`trace_log` (
    trace_id      INT NOT NULL AUTO_INCREMENT,
    user_id       INT NULL,
    course_id     INT NULL,
    task_id       INT NULL,
    checker_id    INT NULL,
    submission_id INT NULL,
    type          VARCHAR(256) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    payload       TEXT,
    CONSTRAINT trace_log_pk
       PRIMARY KEY (trace_id),
    constraint trace_log_user_id_fk
       FOREIGN KEY (user_id) references user (user_id)
           ON UPDATE CASCADE,
    constraint trace_log_course_id_fk
       FOREIGN KEY (course_id) references course (course_id)
           ON UPDATE CASCADE,
    constraint trace_log_task_id_fk
       FOREIGN KEY (task_id) references task (task_id)
           ON UPDATE CASCADE,
    constraint trace_log_checker_id_fk
       FOREIGN KEY (checker_id) references checkrunner_configuration (configuration_id)
           ON UPDATE CASCADE,
    constraint trace_log_submission_id_fk
       FOREIGN KEY (submission_id) references user_task_submission (submission_id)
           ON UPDATE CASCADE
);

INSERT INTO migration (number) VALUES (25);

COMMIT;
