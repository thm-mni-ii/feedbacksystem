# FBS Identity Service

This module contains the initial setup for the FBS identity service.

## Current status

* Spring Boot service written in Kotlin and running on Java 17
* Standalone Gradle build
* Health and manifest endpoints at `/health` and `/manifest`
* Connection to the existing FBS MySQL database
* JPA/Hibernate mapping for the existing FBS `user` table
* Spring Security with local username/password authentication
* JWT creation, validation, and current-user resolution
* Local SAML2 login prototype using Keycloak as a test IdP
* SAML success and failure handling with optional route forwarding through RelayState
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

The service uses the existing mysql1 database service from the compose setup.

By default, SAML is disabled for the Docker setup, so no local Keycloak/SAML test environment is required for normal startup.


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

Some local manual test requests are available for the IntelliJ HTTP Client:

```
http/local-auth.http
```

The local HTTP client tests are documented in:

```
docs/local-http-client-tests.md
```
