# FBS Identity Service

This module contains the initial setup for the FBS identity service.

## Current status

* Spring Boot service written in Kotlin and running on Java 17
* Standalone Gradle build
* Health and manifest endpoints at `/health` and `/manifest`
* Connection to the existing FBS MySQL database
* JPA/Hibernate mapping for the existing FBS `user` table
* Local username/password authentication through Spring Security
* OpenID Connect / OAuth 2.0 Authorization Server
* Authorization Code Flow with PKCE for public clients
* RSA-signed access tokens and ID tokens
* JWT-based Resource Server authentication for protected REST and GraphQL endpoints
* Current-user resolution from the authenticated access token
* Local SAML2 login using Keycloak as a test IdP
* SAML authentication integrated into the OIDC Authorization Code Flow
* OpenAPI documentation at `/openapi` and Swagger UI
* Global REST exception handling with a common `ErrorResponse` format
* Dockerfile and Docker Compose integration using the existing `mysql1` service

## Working directory

All commands in this README are meant to be executed from the identity-service API module:

```bash
modules/fbs-identity-service/api
```

## Build

```bash
./gradlew build
```

## Run

```bash
./gradlew bootRun
```

## Run with Docker Compose

The Identity-Service can also be built and started through the main `docker-compose.yml` from the repository root.

From the repository root:

```bash
docker compose up --build mysql1 identity-service
```

The Identity-Service uses the existing `mysql1` MySQL service but connects to its own fbs_identity database within the same MySQL instance. The `fbs_identity` database is created during the initial MySQL container setup. 

By default, SAML is disabled in the Docker Compose configuration, so a local Keycloak/SAML test environment is not required for normal startup.


## ## API documentation

The REST API is documented with OpenAPI.

The OpenAPI JSON is available at:

```text
http://localhost:8080/openapi
````

Swagger UI is available at:

```
http://localhost:8080/swagger-ui.html
```

The service manifest is available at:

```
http://localhost:8080/manifest
```

## OIDC / OAuth 2.0

The Identity-Service acts as an OpenID Connect / OAuth 2.0 Authorization Server.

Important endpoints include:

```
/oauth2/authorize
/oauth2/token
/oauth2/jwks
/userinfo
/.well-known/openid-configuration
/.well-known/oauth-authorization-server
```

The current local test client uses the Authorization Code Flow with PKCE.

The public client does not use refresh tokens. When an access token expires, a new authorization flow can be started. If the login session is still valid, the user does not need to authenticate again.

## Run with local dev tools such as GraphiQL

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

GraphiQL is then available at:

```
http://localhost:8080/graphiql
```

## Run with local SAML profile

For local SAML testing with Keycloak:

```bash
./gradlew bootRun --args='--spring.profiles.active=saml-local'
```

The local SAML setup is documented in:

```
docs/saml-local-keycloak.md
```

## Automated tests

Automated tests can be executed from this module with:

```bash
./gradlew test
```

## Local manual testing

Local manual test requests are available for the IntelliJ HTTP Client:

```
http/local-rest.http
http/local-graphql.http
http/local-oidc.http
```

PKCE values for manual OIDC tests can be generated with:

```bash
node http/generate-pkce.mjs
```

The local HTTP client tests are documented in:

```
docs/local-http-client-tests.md
```

## Known limitations

* The frontend has not yet been migrated to the new OIDC Authorization Code Flow with PKCE.
* The Spring Security login page is currently used for local testing.
* The Identity-Service is not yet registered as a Service Provider with the productive THM IdP.
* SAML AuthnRequests are currently not signed.
* SAML assertion encryption has not been configured or tested.
* Single Logout is not implemented.
* RSA signing keys are currently generated when the Identity-Service starts. Tokens issued before a restart therefore become invalid.
* The public OIDC client currently uses short-lived access tokens without refresh tokens.
