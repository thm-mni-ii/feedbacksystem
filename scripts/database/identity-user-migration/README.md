# User Migration

## Purpose and Background

The purpose of this migration is to transfer the existing users from the `fbs.user` table to the `fbs_identity.user` table in a consistent and conflict-free way.

The identity service has already been configured to read and write user data through the `fbs_identity.user` table. 
This separates the ownership of identity and user data from the FBS core and allows the identity service to manage its persistence independently.

## Migration Approach

At the time this migration was created, both user tables used the same relevant columns and compatible data types.
This compatible structure allows existing user records to be transferred without transforming their data.

Users are identified by their existing `user_id`. A user that already exists in the target table with the same ID and identical data is treated as already migrated.

Conflicting records are reported by the validation script and must be reviewed before the migration is executed. Conflicts are not resolved automatically.

## Prerequisites

Before starting the migration, the following requirements must be met:

* The `fbs` and `fbs_identity` databases must exist.
* The `fbs_identity.user` table must already have been created through Flyway.
* A backup of both user tables must be created.
* User data must not be modified while the validation and migration scripts are running.
* No new production users should be created exclusively in `fbs_identity.user` before the existing users have been migrated.
* The source validation must complete without conflicts.

## Migration Process

The scripts must be executed in the following order:

1. `01_validate_source.sql`
2. `02_migrate_users.sql`
3. `03_validate_result.sql`

### 1. Validate the source data

`01_validate_source.sql` checks whether the existing users can be migrated safely. It does not modify any data.

The following checks must return no rows:

* duplicate usernames in `fbs.user`
* matching user IDs with different usernames
* matching usernames with different user IDs
* matching user IDs with differing user data

The script also displays general information about the source and target data, including:

* the number of users
* deleted and active users
* global roles
* users with and without a local password
* users that are already present identically in the target table

### 2. Migrate users

`02_migrate_users.sql` copies the missing users from `fbs.user` to `fbs_identity.user` within a transaction.

The original stored values are copied without transformation, including:

* `user_id`
* username
* personal information
* password hash
* global role
* privacy status
* deleted status
* alias

The script calculates the expected number of migrated users before the insert and compares it with the number of rows actually inserted.

A successful execution reports:

```text
MIGRATION COUNT MATCHES
```

The insert is executed within a transaction. Its changes become permanent only when the final `COMMIT` is executed.
The expected and actual migration counts must match. 
If they do not match, the migration result must be treated as invalid and investigated before it is used.

### 3. Validate the result

`03_validate_result.sql` checks the committed migration result. It does not modify any data.

It checks whether:

* every source user exists in the target table
* source and target users with the same ID contain identical data
* any users exist only in the target table
* the source and target user counts can be reviewed

The checks for missing users and differing data must return no rows.

The check for additional target users should normally also return no rows. Any returned users must be known and reviewed.

## Preserved Data and References

Existing user IDs are preserved during the migration.

This is required because several tables in the FBS core continue to reference users through their existing `user_id`, including:

* course registrations
* group memberships
* task submissions
* SQL playground databases
* trace logs

Assigning new IDs during the migration could break these associations or cause existing records to be assigned to the wrong user.

Deleted users are also migrated. The `deleted` column represents the status of the user, 
while other parts of the system may still contain historical references to the corresponding user ID.

Password hashes are copied unchanged. They are not recalculated during the migration.

## Backup and Rollback

A backup of the source and target user tables must be created before the migration.

Example:

```powershell
docker exec feedbacksystem-mysql1-1 mysqldump -u root -p<password> fbs user > fbs-user-backup.sql

docker exec feedbacksystem-mysql1-1 mysqldump -u root -p<password> fbs_identity user > fbs-identity-user-backup.sql
```

Backup files contain sensitive user data and must be stored securely outside the repository.

If an incorrect result is discovered after the migration has been committed, the previous state must be restored from the backup.

## Limitations and Future Integration

The scripts are intended for a controlled, one-time migration. They do not continuously synchronize changes between `fbs.user` and `fbs_identity.user`.

The identity service has already been configured to read and write user data through `fbs_identity.user`. 
Other FBS components still rely on the existing core database structures or directly access user-related data.

The migration scripts do not:

* change database access in the FBS core
* update existing repositories or SQL queries
* redirect other components to the identity service
* remove the existing `fbs.user` table
* provide continuous synchronization between both user tables

Adapting the remaining components and defining how they retrieve or modify user data through the identity service is a separate future integration task.

The production migration should only be executed once the affected components are ready to obtain or modify user data through the identity service.
After that cutover, the identity service should become the authoritative source for user data and parallel writes to `fbs.user` should be prevented.

The migration was manually tested with the local development dataset. The dataset included active and deleted users, 
different global roles, users with and without local passwords, and one user that already existed identically in the target table.
