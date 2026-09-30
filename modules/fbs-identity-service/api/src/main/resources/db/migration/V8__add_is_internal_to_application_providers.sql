ALTER TABLE application_providers ADD COLUMN is_internal BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE application_providers
SET is_internal = TRUE
WHERE id IN ('course-management', 'sql-playground');
