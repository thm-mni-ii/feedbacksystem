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

The identity-service acts as:

* an OpenID Connect / OAuth 2.0 Authorization Server
* a SAML Service Provider for authentication against Keycloak

SAML is used as an authentication method inside the OIDC Authorization Code Flow.

The local flow is:

```
/oauth2/authorize
    -> starts the OIDC Authorization Code Flow
    -> the original authorization request is stored in the HTTP session
    -> the user selects SAML login
    -> Spring Security redirects to /saml2/authenticate/keycloak
    -> Spring Security creates the SAML AuthnRequest
    -> the browser is redirected to Keycloak
    -> the user authenticates at Keycloak
    -> Keycloak sends the SAMLResponse to /login/saml2/sso/keycloak
    -> Spring Security validates the SAMLResponse
    -> SamlAuthSuccessHandler is called
    -> the local user is resolved or created
    -> an IdentityUserPrincipal is created
    -> the SecurityContext is stored in the HTTP session
    -> the original /oauth2/authorize request is continued
    -> the Authorization Server creates an authorization code
    -> the browser is redirected to the configured client callback
    -> the authorization code is exchanged at /oauth2/token
    -> the client receives an access token and ID token
```

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

The Identity-Service also requires the OIDC signing-key configuration described in the main README.

Use the local SAML Spring profile:

```bash
./gradlew bootRun --args='--spring.profiles.active=saml-local'
```

The profile loads the local Keycloak SAML configuration from:

```text
application-saml-local.yaml
```

## Test the SAML login

Generate PKCE values first:

```bash
node http/generate-pkce.mjs
```

Use the generated code challenge and state in an OIDC authorization request:

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

On the login page, select the SAML / Keycloak login.

Expected result:
* the browser is redirected to Keycloak
* the user authenticates at Keycloak
* the local user is resolved or created
* the original OIDC authorization request is continued
* the client callback receives an authorization code and the original state
* the authorization code can be exchanged at `/oauth2/token`
* an access token and ID token are returned

The token exchange can be tested with `http/local-oidc.http`.

Keycloak may reuse an existing SSO session and therefore skip the credential form. To test a fresh login, log out from Keycloak or use a browser session without an existing Keycloak session.

## Known limitations

* The identity-service is not yet registered as a Service Provider with the productive THM IdP.
* AuthnRequests are currently not signed because no SP key pair is configured.
* SAML assertion encryption has not been tested.
* Single Logout is not implemented.
* The frontend has not yet been migrated to the new OIDC Authorization Code Flow with PKCE.
* The Spring Security login page is currently used for local testing.
* The public OIDC client currently uses short-lived access tokens without refresh tokens.

For local testing, AuthnRequest signing is disabled:

```yaml
singlesignon:
  sign-request: false
```
These points should be reviewed before a productive SAML integration.
