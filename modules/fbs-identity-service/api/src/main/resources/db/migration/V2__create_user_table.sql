CREATE TABLE `user` (
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `prename` VARCHAR(100) NOT NULL,
    `surname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL DEFAULT NULL,
    `password` VARCHAR(255) NULL DEFAULT NULL,
    `username` VARCHAR(200) NOT NULL,
    `privacy_checked` TINYINT(1) NOT NULL DEFAULT 0,
    `deleted` TINYINT(1) NOT NULL DEFAULT 0,
    `alias` VARCHAR(20) NULL DEFAULT NULL,
    `global_role` INT NOT NULL DEFAULT 2
        COMMENT '0 Admin 1 Moderator 2 User',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `uk_user_username` UNIQUE (`username`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;
