BEGIN;

ALTER TABLE course ADD COLUMN submission_mode ENUM('internet', 'vpn', 'local') NOT NULL DEFAULT 'internet';

INSERT INTO migration (number) VALUES (23);

COMMIT;

