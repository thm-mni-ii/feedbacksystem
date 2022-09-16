BEGIN;


CREATE TABLE IF NOT EXISTS `fbs`.`semester` (
    `semester_id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY (`semester_id`))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

alter table course
    add `semester_id` INT NOT NULL,
    ADD FOREIGN KEY (`semester_id`) REFERENCES semester(semester_id);

INSERT INTO migration (number) VALUES (5);

COMMIT;
