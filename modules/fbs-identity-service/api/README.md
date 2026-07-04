# FBS Identity Service

This module contains the initial setup for the FBS identity service.

## Current status

* Spring Boot Kotlin service
* Java 17
* Standalone Gradle build
* Health endpoint at `/health`
* Manifest endpoint at `/manifest`
* Basic Spring Security configuration
* Connection to the local FBS MySQL database
* JPA/Hibernate mapping for the existing FBS `user` table
* Local username/password login
* JWT creation and JWT validation
* Current user resolution through the Spring Security context
* Local SAML2 login prototype with Keycloak as test IdP
* SAML success/failure redirect handling
* Optional SAML route forwarding through RelayState
* Dockerfile for containerized startup
* Docker Compose integration using the existing `mysql1` service

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

The service uses the existing `mysql1` database service from the compose setup.

By default, SAML is disabled for the Docker setup, so no local Keycloak/SAML test environment is required for normal startup.

The health endpoint is available at:

```text
http://localhost:8080/health
```

Local login can be tested against:

```text
POST http://localhost:8080/api/v1/auth/login
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

```text
docs/saml-local-keycloak.md
```

## Automated tests

Automated tests can be executed from this module with:

```bash
./gradlew test
```

## Local manual testing

Some local manual test requests are available for the IntelliJ HTTP Client:

```text
http/local-auth.http
```

The local HTTP client tests are documented in:

```text
docs/local-http-client-tests.md
```
