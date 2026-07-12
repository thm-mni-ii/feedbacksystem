# Local SAML2 test setup with Keycloak

This document describes the current local SAML2 test setup for the identity-service.

The identity-service is not yet registered as a Service Provider with the productive THM IdP. Keycloak is therefore used as a local test IdP.

## Overview

Local setup:

```text
identity-service: http://localhost:8080
Keycloak:         http://localhost:8090
Realm:            fbs
```

The identity-service acts as the SAML Service Provider.

The local SAML login flow is:

```text
/api/v1/login/sso?route=/groups 
    -> validates the optional route
    -> redirects to /saml2/authenticate/keycloak 
    -> Spring Security creates the SAML AuthnRequest 
    -> the route is forwarded as RelayState 
    -> the browser is redirected to Keycloak
    -> the user logs in at Keycloak 
    -> Keycloak sends the SAMLResponse back to /login/saml2/sso/keycloak 
    -> Spring Security validates the SAMLResponse 
    -> SamlAuthSuccessHandler is called 
    -> the local user is resolved or created 
    -> a JWT is created
    -> the JWT is written to a short-lived, frontend-readable cookie 
    -> the temporary SAML/HTTP session is cleared 
    -> the browser is redirected to the frontend
    -> the frontend stores the JWT in localStorage and deletes the cookie
    -> the frontend opens the forwarded route or default page
```
The `LoginResponse` is only used internally. It is not returned as JSON during SAML browser flow.

The temporary cookie uses:

HttpOnly: false<br>
SameSite: Lax<br>
Path: /<br>
Max-Age: configured through jwt-cookie-max-age-seconds<br>
Secure: enabled when the request uses HTTPS<br>

## Start Keycloak

Start the existing container:

```bash
docker start fbs-keycloak
```

If the container does not exist yet, create a local Keycloak container and expose it on port `8090`.

## Keycloak realm

Create or use the realm:

```text
fbs
```

Create a test user in this realm with a permanent password.

Recommended settings:

```text
Email verified: enabled
Temporary password: disabled
```

## Keycloak SAML client

Create a SAML client for the identity-service.

Important settings:

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

The callback URL `/login/saml2/sso/keycloak` is Spring Security's ACS endpoint for the local Keycloak registration.

## Keycloak mappers

Add the following `UserProperty` mappers to the SAML client scope:

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

These are added as SAML attributes to the SAMLResponse. The identity-service reads them in SamlAuthSuccessHandler through the configured attribute names.

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
To test route forwarding, open for example:

```text
http://localhost:8080/api/v1/login/sso?route=/groups
```
Expected result:
* the browser is redirected to Keycloak
* the local user is resolved or created
* the JWT is passed to the frontend through the temporary cookie
* the frontend redirects to `/groups` or the default page

Keycloak may reuse an existing browser session. Use a private browser window or clear the Keycloak cookies to test a fresh login.

## Known limitations

* The identity-service is not yet registered as a Service Provider with the productive THM IdP.
* AuthnRequests are currently not signed because no SP key pair is configured.
* SAML assertion encryption has not been tested.
* Single Logout is not implemented.
* Frontend logout only removes the JWT from `localStorage`.
* The JWT is transferred through a frontend-readable cookie and stored in `localStorage`.
* The complete route flow depends on the corresponding frontend implementation.

For local testing, AuthnRequest signing is disabled:

```bash
singlesignon:
  sign-request: false
```
These points should be reviewed before a productive SAML integration.
