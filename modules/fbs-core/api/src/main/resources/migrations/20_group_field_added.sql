BEGIN;


CREATE TABLE IF NOT EXISTS `fbs`.`group` (
        `group_id` INT NOT NULL AUTO_INCREMENT, 
        `course_id` INT NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `membership` INT NOT NULL,
        `visible` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`group_id`),
    FOREIGN KEY (`course_id`) REFERENCES `fbs`.`course`(`course_id`),
    UNIQUE INDEX `groups_groupid_courseid_uindex` (`group_id`, `course_id`))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

INSERT INTO migration (number) VALUES (20);

COMMIT;


