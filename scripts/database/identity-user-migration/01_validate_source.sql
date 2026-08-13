-- Validates whether users can be migrated safely
-- from fbs.user to fbs_identity.user.
--
-- This script does not modify any data.
--
-- The migration is safe only if the following checks return no rows:
-- 1. duplicate usernames in source
-- 2. conflicting user IDs
-- 3. conflicting usernames
-- 4. differing data for matching user IDs

SELECT 'Checking source and target tables' AS validation_step;

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA IN ('fbs', 'fbs_identity')
  AND TABLE_NAME = 'user'
ORDER BY TABLE_SCHEMA;


SELECT 'Counting users in source and target' AS validation_step;

SELECT
    (SELECT COUNT(*) FROM fbs.user) AS source_user_count,
    (SELECT COUNT(*) FROM fbs_identity.user) AS target_user_count;


SELECT 'Checking duplicate usernames in source' AS validation_step;

SELECT
    username,
    COUNT(*) AS occurrences,
    GROUP_CONCAT(user_id ORDER BY user_id) AS affected_user_ids
FROM fbs.user
GROUP BY username
HAVING COUNT(*) > 1;


SELECT 'Checking conflicting user IDs' AS validation_step;

SELECT
    source.user_id,
    source.username AS source_username,
    target.username AS target_username
FROM fbs.user source
    JOIN fbs_identity.user target
        ON target.user_id = source.user_id
WHERE NOT (source.username <=> target.username);


SELECT 'Checking conflicting usernames' AS validation_step;

SELECT
    source.user_id AS source_user_id,
    target.user_id AS target_user_id,
    source.username
FROM fbs.user source
    JOIN fbs_identity.user target
        ON target.username = source.username
WHERE source.user_id <> target.user_id;


SELECT 'Counting users by deleted status' AS validation_step;

SELECT
    deleted,
    COUNT(*) AS user_count
FROM fbs.user
GROUP BY deleted
ORDER BY deleted;


SELECT 'Counting users by global role' AS validation_step;

SELECT
    global_role,
    COUNT(*) AS user_count
FROM fbs.user
GROUP BY global_role
ORDER BY global_role;


SELECT 'Counting users by password type' AS validation_step;

SELECT
    CASE
        WHEN password IS NULL THEN 'NO_LOCAL_PASSWORD'
        ELSE 'LOCAL_PASSWORD'
        END AS password_type,
    COUNT(*) AS user_count
FROM fbs.user
GROUP BY password_type;


SELECT 'Checking differing data for matching user IDs' AS validation_step;

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


SELECT 'Counting already migrated users' AS validation_step;

SELECT COUNT(*) AS already_migrated_users
FROM fbs.user source
    JOIN fbs_identity.user target
        ON target.user_id = source.user_id
WHERE source.prename <=> target.prename
  AND source.surname <=> target.surname
  AND source.email <=> target.email
  AND source.password <=> target.password
  AND source.username <=> target.username
  AND source.privacy_checked <=> target.privacy_checked
  AND source.deleted <=> target.deleted
  AND source.alias <=> target.alias
  AND source.global_role <=> target.global_role;
