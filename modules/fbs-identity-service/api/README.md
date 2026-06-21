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

## Local manual testing

Some local manual test requests are available for the IntelliJ HTTP Client:

```text
http/local-auth.http
```

The local HTTP client tests are documented in:

```text
docs/local-http-client-tests.md
```