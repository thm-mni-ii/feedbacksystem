# Local HTTP client tests

This document describes the current local manual test requests for the identity-service.

The IntelliJ HTTP Client file is located at:

```text
http/local-auth.http
```

It contains manual requests for testing local authentication, JWT validation and role-based GraphQL authorization.

## Prerequisites

The identity-service must be running locally:

```bash
./gradlew bootRun
```

A local MySQL database must be available and the existing FBS user table must contain:

* a regular test user with a BCrypt-encoded password
* an admin test user with a BCrypt-encoded password and the ADMIN global role

The first admin user cannot be created through the protected GraphQL API. It must already exist in the local test data or be created through an appropriate local database setup.

## Covered test cases

The HTTP file currently covers:

* local login with valid and invalid credentials
* GraphQL access without, with valid and with invalid JWT
* resolving the authenticated user
* changing the authenticated user's password
* querying users as regular user and admin
* creating users as unauthenticated, regular and admin user
* changing another user's password as regular user and admin
* updating a global role as regular user and admin
* deactivating a user as regular user and admin
* reading the authenticated user's terms-of-use acceptance status
* accepting the terms of use for the authenticated user
* rejecting unauthenticated terms-of-use requests
* rejecting access to another user's terms-of-use status

## HTTP client variables

The HTTP file stores returned JWT access tokens in IntelliJ HTTP Client variables:

```text
accessToken
adminToken
adminUserId
managedUserId
```

These variables are then reused in later requests.

## Expected authorization behavior

Requests to /graphql without a valid Bearer token return 401 Unauthorized.

GraphQL operations rejected by @PreAuthorize may return HTTP 200 OK with an errors entry in the GraphQL response body.

User-management operations require the ADMIN global role. currentUser and changeOwnPassword are available to every authenticated user.

The terms-of-use endpoints require a valid Bearer token. The user ID in the request path must match the authenticated user. Requests for another user's status return 403 Forbidden, including requests made by an admin.

## Note

Local usernames, passwords and user IDs may need to be adjusted to match the local database. The requests should be executed in order because later tests use the test user created by an earlier request.