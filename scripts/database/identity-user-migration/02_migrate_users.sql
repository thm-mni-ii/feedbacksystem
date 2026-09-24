-- Migrates users from fbs.user to fbs_identity.user.
--
-- Existing users with the same user_id are not overwritten.
-- Run 01_validate_source.sql before executing this script.
-- Execute the migration while user data is not being modified.

START TRANSACTION;

SELECT 'Users before migration' AS migration_step;

SELECT
    (SELECT COUNT(*) FROM fbs.user) AS source_user_count,
    (SELECT COUNT(*) FROM fbs_identity.user) AS target_user_count;


SELECT 'Users expected to be migrated' AS migration_step;

SELECT COUNT(*) AS expected_migrated_user_count
INTO @expected_migrated_user_count
FROM fbs.user source
WHERE NOT EXISTS (
    SELECT 1
    FROM fbs_identity.user target
    WHERE target.user_id = source.user_id
);


SELECT
    'Users expected to be migrated' AS migration_step,
    @expected_migrated_user_count AS expected_migrated_user_count;


INSERT INTO fbs_identity.user (
    user_id,
    prename,
    surname,
    email,
    password,
    username,
    privacy_checked,
    deleted,
    alias,
    global_role
)
SELECT
    source.user_id,
    source.prename,
    source.surname,
    source.email,
    source.password,
    source.username,
    source.privacy_checked,
    source.deleted,
    source.alias,
    source.global_role
FROM fbs.user source
WHERE NOT EXISTS (
    SELECT 1
    FROM fbs_identity.user target
    WHERE target.user_id = source.user_id
);


SET @migrated_user_count = ROW_COUNT();


SELECT 'Migration result' AS migration_step;

SELECT
    @expected_migrated_user_count AS expected_migrated_user_count,
    @migrated_user_count AS migrated_user_count,
    CASE
        WHEN @expected_migrated_user_count = @migrated_user_count
            THEN 'MIGRATION COUNT MATCHES'
        ELSE 'MIGRATION COUNT DOES NOT MATCH'
        END AS migration_result;


SELECT 'Users after migration' AS migration_step;

SELECT
    (SELECT COUNT(*) FROM fbs.user) AS source_user_count,
    (SELECT COUNT(*) FROM fbs_identity.user) AS target_user_count;

COMMIT;
