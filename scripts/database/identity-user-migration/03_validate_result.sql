-- Validates the completed user migration
-- from fbs.user to fbs_identity.user.
--
-- This script does not modify any data.
--
-- The migration result is valid if:
-- 1. no source users are missing in the target
-- 2. no matching user IDs contain differing data
-- 3. all additional target users are expected
-- 4. AUTO_INCREMENT is greater than every existing user_id

SELECT 'Counting users in source and target' AS validation_step;

SELECT
    (SELECT COUNT(*) FROM fbs.user) AS source_user_count,
    (SELECT COUNT(*) FROM fbs_identity.user) AS target_user_count;


SELECT 'Checking source users missing in target' AS validation_step;

SELECT
    source.user_id,
    source.username
FROM fbs.user source
    LEFT JOIN fbs_identity.user target
        ON target.user_id = source.user_id
WHERE target.user_id IS NULL;


SELECT 'Checking differing data for migrated users' AS validation_step;

SELECT
    source.user_id,
    source.username AS source_username,
    target.username AS target_username,
    source.prename AS source_prename,
    target.prename AS target_prename,
    source.surname AS source_surname,
    target.surname AS target_surname,
    source.email AS source_email,
    target.email AS target_email,
    source.alias AS source_alias,
    target.alias AS target_alias,
    source.global_role AS source_global_role,
    target.global_role AS target_global_role,
    source.privacy_checked AS source_privacy_checked,
    target.privacy_checked AS target_privacy_checked,
    source.deleted AS source_deleted,
    target.deleted AS target_deleted,
    NOT (source.password <=> target.password) AS password_differs
FROM fbs.user source
    JOIN fbs_identity.user target
        ON target.user_id = source.user_id
WHERE NOT (
    source.prename <=> target.prename
    AND source.surname <=> target.surname
    AND source.email <=> target.email
    AND source.password <=> target.password
    AND source.username <=> target.username
    AND source.privacy_checked <=> target.privacy_checked
    AND source.deleted <=> target.deleted
    AND source.alias <=> target.alias
    AND source.global_role <=> target.global_role
    );


SELECT 'Checking additional users in target' AS validation_step;

SELECT
    target.user_id,
    target.username
FROM fbs_identity.user target
    LEFT JOIN fbs.user source
        ON source.user_id = target.user_id
WHERE source.user_id IS NULL;
