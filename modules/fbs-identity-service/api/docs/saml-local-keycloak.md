# Local SAML2 test setup with Keycloak

This document describes the current local SAML2 test setup for the FBS identity-service.

The productive THM IdP integration is not available locally yet, because the FBS/identity-service setup is not registered with the THM IdP. For local development, Keycloak is used as a test SAML IdP.

## Overview

Local setup:

```text
Identity-service: http://localhost:8080
Keycloak:         http://localhost:8090
Realm:            fbs
```

The identity-service acts as the SAML Service Provider.

The SAML SSO login flow is:

```text
/api/v1/login/sso
    -> redirects to Spring Security's SAML entrypoint /saml2/authenticate/keycloak
    -> Spring Security creates the SAML AuthnRequest and redirects the browser to Keycloak
    -> the user logs in at Keycloak
    -> Keycloak sends a SAMLResponse back to the Spring Security ACS endpoint /login/saml2/sso/keycloak
    -> Spring Security validates the SAMLResponse
    -> SamlAuthSuccessHandler is called
    -> the local user is resolved or created
    -> the existing JWT LoginResponse is returned
```

## Start Keycloak

Example Docker command:

```bash
docker start fbs-keycloak
```

If the container does not exist yet, create a local Keycloak container and expose it on port `8090`.

## Keycloak realm

Create or use the realm:

```text
fbs
```

Create a test user in this realm.

Recommended test user settings:

```text
Username: any local test username
Email verified: enabled
Temporary password: disabled
```

## Keycloak SAML client

Create a SAML client for the identity-service.

Important client settings:

```text
Client type: SAML
Client ID: http://localhost:8080/saml2/metadata/keycloak
Root URL: http://localhost:8080
Home URL: http://localhost:8080
Valid redirect URIs: http://localhost:8080/login/saml2/sso/keycloak
Master SAML Processing URL: http://localhost:8080/login/saml2/sso/keycloak
Client signature required: Off
Force POST binding: On
Sign documents: On
Sign assertions: Off
```

The callback URL `/login/saml2/sso/keycloak` is Spring Security's default ACS endpoint for the keycloak SAML registration.

## Keycloak mappers

Add the following mappers to the dedicated client scope of the SAML client.

All mappers use mapper type `User Property`.

```text
Property: username
SAML Attribute Name: uid
SAML Attribute NameFormat: Basic
```

```text
Property: firstName
SAML Attribute Name: givenName
SAML Attribute NameFormat: Basic
```

```text
Property: lastName
SAML Attribute Name: sn
SAML Attribute NameFormat: Basic
```

```text
Property: email
SAML Attribute Name: mail
SAML Attribute NameFormat: Basic
```

The Keycloak mappers add these values as SAML attributes to the SAMLResponse. The identity-service reads them in SamlAuthSuccessHandler through the configured attribute names.

## Start the identity-service with SAML enabled

Use the local SAML Spring profile:

```bash
./gradlew bootRun --args='--spring.profiles.active=saml-local'
```

The profile loads the local Keycloak SAML configuration from:

```text
application-saml-local.yaml
```

## Test the SAML login

Open:

```text
http://localhost:8080/api/v1/login/sso
```

Expected result:

* `SamlAuthSuccessHandler` is reached
* a local user is resolved or created
* the existing JWT `LoginResponse` is returned

Example response shape:

```json
{
  "accessToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

## Notes

Keycloak may keep a browser session after the first login. In that case, calling `/api/v1/login/sso` again may return to the identity-service without asking for username and password again. For a fresh login test, use an incognito/private browser window or clear the browser cookies for `localhost:8090`.

For local testing, AuthnRequest signing is disabled:

```yaml
singlesignon:
  sign-request: false
```

This is needed because the local Keycloak IdP metadata may still contain `WantAuthnRequestsSigned="true"`, while the identity-service currently does not configure its own SP signing key pair. This setting should be reviewed again before any productive SAML integration.
