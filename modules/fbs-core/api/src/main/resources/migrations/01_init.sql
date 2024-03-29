BEGIN;
-- MySQL Script generated by MySQL Workbench
-- Tue Aug 25 20:48:49 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='';

-- -----------------------------------------------------
-- Schema fbs
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema fbs
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `fbs` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
USE `fbs` ;

-- -----------------------------------------------------
-- Table `fbs`.`course`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`course` ;

CREATE TABLE IF NOT EXISTS `fbs`.`course` (
                                              `course_id` INT NOT NULL AUTO_INCREMENT,
                                              `name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL DEFAULT '',
    `visible` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`course_id`),
    UNIQUE INDEX `courses_courseid_uindex` (`course_id` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fbs`.`submission`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`submission` ;

CREATE TABLE IF NOT EXISTS `fbs`.`submission` (
                                                  `submission_id` INT NOT NULL AUTO_INCREMENT,
                                                  `file_name` VARCHAR(255) NOT NULL,
    `submission_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `exitcode` INT NOT NULL DEFAULT 1,
    `result_text` TEXT NOT NULL DEFAULT '',
    `checked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Checker has checked this submission',
    PRIMARY KEY (`submission_id`))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fbs`.`task`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`task` ;

CREATE TABLE IF NOT EXISTS `fbs`.`task` (
                                            `task_id` INT NOT NULL AUTO_INCREMENT,
                                            `name` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL DEFAULT '',
    `course_id` INT NOT NULL,
    `deadline` DATETIME NOT NULL,
    `media_type` VARCHAR(255) NOT NULL,
    `media_information` JSON NULL,
    PRIMARY KEY (`task_id`),
    INDEX `task_courses_courseid_fk` (`course_id` ASC) VISIBLE,
    CONSTRAINT `task_course_course_id_fk`
    FOREIGN KEY (`course_id`)
    REFERENCES `fbs`.`course` (`course_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fbs`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`user` ;

CREATE TABLE IF NOT EXISTS `fbs`.`user` (
                                            `user_id` INT NOT NULL AUTO_INCREMENT,
                                            `prename` VARCHAR(100) NOT NULL,
    `surname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL DEFAULT NULL,
    `password` VARCHAR(255) NULL DEFAULT NULL,
    `username` VARCHAR(200) NOT NULL,
    `privacy_checked` TINYINT(1) NOT NULL DEFAULT 0,
    `deleted` TINYINT(1) NOT NULL DEFAULT 0,
    `alias` VARCHAR(20) NULL DEFAULT NULL,
    `global_role` INT NOT NULL DEFAULT 2 COMMENT '0 Admin 1 Moderator 2 User',
    PRIMARY KEY (`user_id`))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fbs`.`user_task_submission`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`user_task_submission` ;

CREATE TABLE IF NOT EXISTS `fbs`.`user_task_submission` (
                                                            `submission_id` INT NOT NULL AUTO_INCREMENT,
                                                            `user_id` INT NOT NULL,
                                                            `task_id` INT NOT NULL,
                                                            `submission_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                            PRIMARY KEY (`submission_id`),
    INDEX `submission_task_taskid_fk` (`task_id` ASC) VISIBLE,
    INDEX `submission_users_userid_fk` (`user_id` ASC) VISIBLE,
    CONSTRAINT `submission_task_taskid_fk`
    FOREIGN KEY (`task_id`)
    REFERENCES `fbs`.`task` (`task_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT `submission_users_userid_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `fbs`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fbs`.`user_course`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`user_course` ;

CREATE TABLE IF NOT EXISTS `fbs`.`user_course` (
                                                   `course_id` INT NOT NULL,
                                                   `user_id` INT NOT NULL,
                                                   `course_role` INT NOT NULL DEFAULT 2,
                                                   PRIMARY KEY (`course_id`, `user_id`),
    INDEX `user_has_courses_users_user_id_fk` (`user_id` ASC) VISIBLE,
    CONSTRAINT `user_course_course_course_id_fk`
    FOREIGN KEY (`course_id`)
    REFERENCES `fbs`.`course` (`course_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT `user_has_courses_users_user_id_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `fbs`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fbs`.`checkrunner_configuration`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`checkrunner_configuration` ;

CREATE TABLE IF NOT EXISTS `fbs`.`checkrunner_configuration` (
                                                                 `configuration_id` INT NOT NULL AUTO_INCREMENT,
                                                                 `task_id` INT NOT NULL,
                                                                 `checker_type` VARCHAR(100) NOT NULL,
    `main_file_uploaded` TINYINT(1) NOT NULL DEFAULT 0,
    `secondary_file_uploaded` TINYINT(1) NOT NULL DEFAULT 0,
    `ord` INT NOT NULL,
    PRIMARY KEY (`configuration_id`),
    INDEX `task_id_idx` (`task_id` ASC) VISIBLE,
    CONSTRAINT `task_id`
    FOREIGN KEY (`task_id`)
    REFERENCES `fbs`.`task` (`task_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `fbs`.`checker_result`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fbs`.`checker_result` ;

CREATE TABLE IF NOT EXISTS `fbs`.`checker_result` (
                                                      `submission_id` INT NOT NULL,
                                                      `configuration_id` INT NOT NULL,
                                                      `exit_code` INT NOT NULL DEFAULT 1,
                                                      `result_text` TEXT NOT NULL DEFAULT '',
                                                      `ext_info` JSON,
                                                      PRIMARY KEY (`submission_id`, `configuration_id`),
    INDEX `configuration_id_fk_idx` (`configuration_id` ASC) VISIBLE,
    CONSTRAINT `submussuibn_id_fk`
    FOREIGN KEY (`submission_id`)
    REFERENCES `fbs`.`user_task_submission` (`submission_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT `configuration_id_fk`
    FOREIGN KEY (`configuration_id`)
    REFERENCES `fbs`.`checkrunner_configuration` (`configuration_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `fbs`.`evaluation_container`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `fbs`.`evaluation_container`;
CREATE TABLE IF NOT EXISTS `fbs`.`evaluation_container` (
                                                            `evaluation_container_id` int NOT NULL AUTO_INCREMENT,
                                                            `to_pass` int NOT NULL DEFAULT '0',
                                                            `bonus_formula` varchar(45) DEFAULT NULL,
    `hide_points` tinyint DEFAULT '0',
    `course_id` int NOT NULL,
    PRIMARY KEY (`evaluation_container_id`),
    UNIQUE KEY `evlaution_container_id_UNIQUE` (`evaluation_container_id`),
    KEY `evaluation_container_1_fk_idx` (`course_id`),
    CONSTRAINT `evaluation_container_1_fk`
    FOREIGN KEY (`course_id`)
    REFERENCES `fbs`.`course` (`course_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE=InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table structure for table `evaluation_container_tasks`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `fbs`.`evaluation_container_tasks`;
CREATE TABLE IF NOT EXISTS `fbs`.`evaluation_container_tasks` (
                                                                  `evaluation_container_id` int NOT NULL,
                                                                  `task_id` int NOT NULL,
                                                                  PRIMARY KEY (`evaluation_container_id`,`task_id`),
    KEY `evaluation_container_tasks_2_fk_idx` (`task_id`),
    CONSTRAINT `evaluation_container_tasks_1_fk`
    FOREIGN KEY (`evaluation_container_id`)
    REFERENCES `fbs`.`evaluation_container` (`evaluation_container_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT `evaluation_container_tasks_2_fk`
    FOREIGN KEY (`task_id`)
    REFERENCES `fbs`.`task` (`task_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
    ENGINE=InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `fbs`.`user` WRITE;
INSERT INTO `fbs`.`user` VALUES (1, 'Admin','Admin','','2c8e25270865a74e374db1ad6e7005b406f23cb6','admin',1, 0, null, 0);
UNLOCK TABLES;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO migration (number) VALUES (1);

COMMIT;
