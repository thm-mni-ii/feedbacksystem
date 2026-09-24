# Local HTTP client tests

This document describes the local manual test requests for the Identity-Service.

The IntelliJ HTTP Client requests are split into three files:

```
http/local-rest.http
http/local-graphql.http
http/local-oidc.http
```
`local-oidc.http` contains requests for the OIDC/OAuth2 flow, token exchange, metadata, JWKS and UserInfo.

`local-rest.http` contains REST requests such as health, manifest, OpenAPI, legal texts and terms of use.

`local-graphql.http` contains GraphQL queries and mutations for current user, user management, password changes, role updates and deactivation.

## Prerequisites

The OIDC signing-key configuration described in the main README must be available before starting the Identity-Service.

The identity-service must be running locally:

```bash
./gradlew bootRun
```

A local MySQL database must be available and the `fbs_identity.user` table must contain:

* a regular test user with a BCrypt-encoded password
* an admin test user with a BCrypt-encoded password and the ADMIN global role

The first admin user cannot be created through the protected GraphQL API. It must already exist in the local test data or be created through an appropriate local database setup.

## OIDC login and access tokens

Authenticated requests use access tokens from the OIDC Authorization Code Flow with PKCE.

Generate a new PKCE code verifier, code challenge and state with:

```bash
node http/generate-pkce.mjs
```

Use the generated code_challenge and state in an authorization request:

```
http://localhost:8080/oauth2/authorize
?response_type=code
&client_id=fbs-test-client
&redirect_uri=http://127.0.0.1:4200/oauth2/callback
&scope=openid%20profile
&code_challenge=<CODE_CHALLENGE>
&code_challenge_method=S256
&state=<STATE>
```

Authenticate with the local login or SAML login.

After a successful login, copy the authorization code from the callback URL and use it together with the matching code verifier in `local-oidc.http`.

The token exchange requests store the returned access tokens as IntelliJ HTTP Client global variables:

```
accessToken
adminToken
managedUserToken
```

These variables are reused by the REST and GraphQL requests.

A new PKCE pair must be generated for every new authorization flow. An authorization code can only be exchanged once.

## Managed-user flow

Some requests also store:

```
managedUserId
managedUsername
```

For the managed-user tests, use this order:

1. obtain an adminToken
2. create the managed test user in local-graphql.http
3. start a new OIDC flow and authenticate as the managed user
4. exchange the code to obtain managedUserToken
5. run the terms-of-use requests
6. run further GraphQL requests
7. deactivate the managed test user

Deactivation changes the stored username, so the same test username can be used again later.

## Covered test cases

The HTTP files cover:

* OIDC and OAuth2 metadata
* JWKS and UserInfo
* Authorization Code Flow with PKCE
* health, manifest and OpenAPI endpoints
* legal text endpoints
* terms-of-use status and acceptance
* GraphQL access with and without an access token
* current user resolution
* user queries as regular user and admin
* user creation and duplicate usernames
* password changes
* global role updates
* user deactivation
* REST and GraphQL validation errors

## Expected authorization behavior

Requests to `/graphql` without a valid Bearer token return `401 Unauthorized`.

User-management operations require the ADMIN global role. `currentUser` and `changeOwnPassword` are available to every authenticated user.

Both terms-of-use endpoints operate on the currently authenticated user.

Invalid REST request bodies return `400 Bad Request` with the common `ErrorResponse` format.

Invalid GraphQL input returns `HTTP 200 OK` with an `errors` entry.

## Optional longer token lifetime for manual tests

The access token lifetime is intentionally short.

For longer manual test sessions, the access token lifetime can temporarily be increased through the OIDC client configuration, for example by setting:

```text
OIDC_ACCESS_TOKEN_TTL_MINUTES=30
```

The default value is defined in `application.yaml`. This should only be used for local testing and should not be committed as a changed default configuration.

## Note

Local usernames, passwords and user IDs may need to be adjusted to match the local database.
