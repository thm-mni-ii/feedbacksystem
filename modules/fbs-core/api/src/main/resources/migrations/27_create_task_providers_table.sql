BEGIN;

CREATE TABLE IF NOT EXISTS `fbs`.`task_providers` (
    `id` VARCHAR(64) NOT NULL,
    `display_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(64) NOT NULL,
    `version` VARCHAR(32) NOT NULL,
    `evaluation_endpoint_url` VARCHAR(512) NOT NULL,
    `health_endpoint_url` VARCHAR(512) NOT NULL,
    `config_ui_url` VARCHAR(512) NULL,
    `solve_ui_url` VARCHAR(512) NULL,
    `result_ui_url` VARCHAR(512) NULL,
    `supported_media_types` TEXT NOT NULL,
    `has_subtasks` TINYINT(1) NOT NULL DEFAULT 0,
    `supports_staged_feedback` TINYINT(1) NOT NULL DEFAULT 0,
    `config_schema` TEXT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

INSERT INTO `fbs`.`task_providers` 
(`id`, `display_name`, `description`, `icon`, `version`, `evaluation_endpoint_url`, `health_endpoint_url`, `config_ui_url`, `solve_ui_url`, `result_ui_url`, `supported_media_types`, `has_subtasks`, `supports_staged_feedback`, `is_active`)
VALUES 
('sql-checker', 'SQL Query Evaluator', 'Prüft relationale SQL-Abfragen gegen Postgres/MySQL', 'code', '1.0.0', 'http://sql-checker:5000/evaluate', 'http://sql-checker:5000/health', NULL, NULL, NULL, '["application/sql", "text/plain"]', 1, 1, 1);

INSERT INTO migration (number) VALUES (27);

COMMIT;
