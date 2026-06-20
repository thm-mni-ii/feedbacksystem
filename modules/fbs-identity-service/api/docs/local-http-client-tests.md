# Local HTTP client tests

This document describes the current local manual test requests for the identity-service.

The IntelliJ HTTP Client file is located at:

```text
http/local-auth.http
```

It contains manual requests for testing the local authentication and JWT-based user handling.

## Prerequisites

The identity-service must be running locally:

```bash
./gradlew bootRun
```

A local MySQL database must be available and the existing FBS `user` table must contain suitable test users.

For successful local login tests, the user password must be stored as a BCrypt hash.

## Covered test cases

The HTTP file currently covers:

* local login with valid credentials
* local login with wrong password
* local login with unknown user
* GraphQL `currentUser` without token
* GraphQL `currentUser` with valid Bearer token
* GraphQL `currentUser` with invalid token
* changing the own password as authenticated user
* changing another user's password as non-admin user
* creating a local admin test user
* changing another user's password as admin user

## Access tokens

The HTTP file stores returned JWT access tokens in IntelliJ HTTP Client variables:

```text
accessToken
adminToken
```

These variables are then reused in later requests through the `Authorization: Bearer ...` header.

## Note

Local test values such as usernames, passwords, and fixed user IDs may need to be adjusted to match the local database.git