# Local HTTP client tests

This document describes the local manual test requests for the Identity-Service.

The IntelliJ HTTP Client requests are split into two files:

```
http/local-rest.http
http/local-graphql.http
```
`local-rest.http` contains REST requests such as health, manifest, OpenAPI, local login, legal texts, terms of use and SAML redirect checks.

`local-graphql.http` contains GraphQL queries and mutations for current user, user management, password changes, role updates and deactivation.

## Prerequisites

The identity-service must be running locally:

```bash
./gradlew bootRun
```

A local MySQL database must be available and the existing FBS user table must contain:

* a regular test user with a BCrypt-encoded password
* an admin test user with a BCrypt-encoded password and the ADMIN global role

The first admin user cannot be created through the protected GraphQL API. It must already exist in the local test data or be created through an appropriate local database setup.

## How to use the requests

Start with the login requests in `local-rest.http`.

The successful login requests store tokens in IntelliJ HTTP Client variables:
```
accessToken
adminToken
```
The GraphQL requests in `local-graphql.http` reuse these tokens.

Some later requests also store user IDs:

```
adminUserId
managedUserId
```
These are used by later REST and GraphQL requests. Because of that, some requests should be executed in order.

## Covered test cases

The HTTP files cover:

* health, manifest and OpenAPI endpoints
* local login with valid and invalid credentials
* REST validation errors and malformed request bodies
* legal text endpoints
* terms-of-use status and acceptance
* GraphQL access with and without JWT
* current user resolution
* user queries as regular user and admin
* user creation as unauthenticated, regular and admin user
* password changes
* global role updates
* user deactivation
* GraphQL validation errors

## Expected authorization behavior

Requests to `/graphql` without a valid Bearer token return `401 Unauthorized`.

User-management operations require the ADMIN global role. `currentUser` and `changeOwnPassword` are available to every authenticated user.

The terms-of-use endpoints require a valid Bearer token. The user ID in the request path must match the authenticated user. Requests for another user's status return `403 Forbidden`, even when using an admin token.

Invalid REST request bodies return `400 Bad Request` with the common `ErrorResponse` format.

Invalid GraphQL input returns `HTTP 200 OK ` with an errors entry.

## Note

Local usernames, passwords and user IDs may need to be adjusted to match the local database.
