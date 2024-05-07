BEGIN;

CREATE TABLE IF NOT EXISTS `fbs`.`user_group` (
    `user_id` INT NOT NULL,
    `course_id` INT NOT NULL,
    `group_id` INT NOT NULL,
    PRIMARY KEY (`user_id`, `course_id`, `group_id`),
    INDEX `user_has_groups_users_user_id_fk` (`user_id` ASC), 
    CONSTRAINT `user_has_groups_users_user_id_fk` 
        FOREIGN KEY (`user_id`)
        REFERENCES `fbs`.`user` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `user_group_course_course_id_fk`
        FOREIGN KEY (`course_id`)
        REFERENCES `fbs`.`course` (`course_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `user_group_group_group_id_fk`
        FOREIGN KEY (`group_id`)
        REFERENCES `fbs`.`group` (`group_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- trigger to check if user is participant of the course
-- -----------------------------------------------------

CREATE TRIGGER check_user_course_before_insert
BEFORE INSERT ON `user_group`
FOR EACH ROW
BEGIN
    DECLARE user_in_course INT;
    SELECT COUNT(*)
    INTO user_in_course
    FROM user_course
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;

    IF user_in_course = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Der Nutzer gehört nicht zum angegebenen Kurs.';
    END IF;
END;


INSERT INTO migration (number) VALUES (21);

COMMIT;

