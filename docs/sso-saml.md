# Single Sign-On and SAML

The application no longer needs to be tied directly to CAS for seamless LMS login.
The backend now exposes a generic single sign-on entrypoint at `/api/v1/login/sso`.
For existing LMS, proxy, or IdP callback configurations, `/api/v1/login/cas` remains available as a legacy alias for already-authenticated requests.

## Where to configure it

For Docker-based deployments you now have two practical options:

- Environment variables on the `core` container, for example `SSO_LOGIN_URL`, `SSO_RETURN_URL_PARAMETER`, and `SSO_PRINCIPAL_HEADER_NAMES`
- An external config file mounted at `conf/fbs-core.api/application.yml`

A ready-to-adapt example is provided in `conf/fbs-core.api/application.yml.example`.

## Supported integration patterns

### 1. SAML handled by a reverse proxy or service provider

Recommended for Shibboleth SP, Apache `mod_auth_mellon`, or an ingress that authenticates the request before forwarding it to the application.

Flow:

1. The frontend redirects the user to `/api/v1/login/sso`.
2. The proxy or SAML service provider protects this route.
3. After successful authentication, the request reaches the backend with an authenticated principal or a trusted user header.
4. The backend creates the Feedbacksystem JWT and redirects back to `/login`.

Relevant configuration:

```yaml
sso:
  login-url: ""
  return-url-parameter: ""
  principal-header-names: X-Forwarded-User,Remote-User,SM_USER,eppn
```

Use this when `/api/v1/login/sso` is already protected externally and the authenticated username is forwarded in one of the configured headers.

### 2. Redirecting to an external login endpoint

Recommended when the application must actively redirect the browser to a central login endpoint.

Relevant configuration:

```yaml
sso:
  login-url: https://idp.example.org/Shibboleth.sso/Login
  return-url-parameter: target
  principal-header-names: X-Forwarded-User,Remote-User,SM_USER,eppn
```

In this mode, the backend builds a redirect URL to the external login endpoint and passes `/api/v1/login/sso` as callback target.

## Trusted header contract

When SSO is terminated outside the application, the backend trusts the first non-empty identity source from:

1. `request.getUserPrincipal`
2. `request.getRemoteUser`
3. the configured `sso.principal-header-names`

For productive setups this means:

- The proxy, ingress, or service provider must strip client-supplied identity headers before forwarding the request.
- Only infrastructure you control may inject headers such as `X-Forwarded-User`, `Remote-User`, `SM_USER`, or `eppn`.
- The backend should usually be reachable only behind that proxy for `/api/v1/login/sso`.

## Example for Shibboleth SP

Typical Shibboleth deployments expose the user through `REMOTE_USER` or `eppn`.
If your reverse proxy forwards `eppn` into `X-Forwarded-User`, the application can stay independent from the SAML implementation details.

Example mapping:

```apache
RequestHeader set X-Forwarded-User %{eppn}e env=eppn
```

Application configuration:

```yaml
sso:
  principal-header-names: X-Forwarded-User,eppn,Remote-User,SM_USER
```

## Reverse proxy examples

Concrete example files are included in `docs/examples/`:

- `docs/examples/apache-shibboleth-feedbacksystem.conf`
- `docs/examples/nginx-authenticated-sso.conf`

### Apache + Shibboleth SP

Use this when Apache and the Shibboleth SP terminate SAML directly in front of Feedbacksystem.

Key points:

- Protect `/api/v1/login/sso`.
- During migration optionally protect `/api/v1/login/cas` as well.
- Strip identity headers before re-setting the trusted one.
- Forward the authenticated principal, for example as `X-Forwarded-User`.

### Nginx behind an upstream auth layer

Use this when SAML is already handled by another ingress, auth gateway, or service mesh and Nginx only forwards the sanitized identity header to Feedbacksystem.

Key points:

- Do not accept `X-Forwarded-User` from clients.
- Forward only the value produced by the trusted upstream auth component.
- Keep direct access to the backend restricted if possible.

## Example for Docker Compose

If your proxy or SAML SP authenticates the request before it reaches the container, the compose service can stay simple:

```yaml
services:
  core:
    environment:
      - SSO_LOGIN_URL=
      - SSO_RETURN_URL_PARAMETER=
      - SSO_PRINCIPAL_HEADER_NAMES=X-Forwarded-User,eppn,Remote-User,SM_USER
      - SSO_SUCCESS_URL=/login
      - SSO_FAILURE_URL=/login?ssoError=1
      - LDAP_ENABLED=true
      - LDAP_ALLOW_LOGIN=false
```

If the backend should redirect to a central login endpoint itself:

```yaml
services:
  core:
    environment:
      - SSO_LOGIN_URL=https://idp.example.org/Shibboleth.sso/Login
      - SSO_RETURN_URL_PARAMETER=target
      - SSO_PRINCIPAL_HEADER_NAMES=X-Forwarded-User,eppn,Remote-User,SM_USER
      - SSO_SUCCESS_URL=/login
      - SSO_FAILURE_URL=/login?ssoError=1
```

## LMS migration

Recommended migration strategy:

1. Configure the proxy or SAML service provider for `/api/v1/login/sso`.
2. Keep `/api/v1/login/cas` enabled as a temporary compatibility alias.
3. Switch new LMS deep links and launch URLs to `/api/v1/login/sso`.
4. Verify that the frontend returns to the requested `route`.
5. After all LMS integrations have been updated and validated, stop using the legacy `/api/v1/login/cas` path.

If the LMS previously linked directly to the CAS entrypoint, point it to the application route or backend SSO route that now starts the generic SSO flow.

## LDAP interaction

SSO remains the preferred path for seamless LMS integration.
LDAP is still used as a provisioning fallback:

- If the external identity already exists in the local database, that user is used.
- Otherwise the backend tries to resolve the user via LDAP and creates a local application user automatically.
- Local or unified login remains available for cases where SSO is not possible.

Recommended settings for seamless LMS integration:

- `ldap.enabled: true`
- `ldap.allowLogin: false`

This keeps automatic user provisioning available without falling back to LDAP as the primary interactive login method.

## Rollout checklist

Before production rollout:

1. Configure `conf/fbs-core.api/application.yml` or environment variables for the chosen SSO mode.
2. Ensure the proxy strips client-supplied identity headers.
3. Protect `/api/v1/login/sso` at the edge.
4. Keep `/api/v1/login/cas` only as long as legacy consumers still need it.
5. Verify that LDAP lookups for new SSO users succeed.
6. Test both a known local user and a user that must be provisioned from LDAP.
7. Test a deep link with `route`, for example `/login?route=/courses/7`.
8. Test the failure path and confirm the frontend shows `ssoError`.

## Validation checklist

After deployment, validate these scenarios end-to-end:

- Existing user logs in via SSO and lands on `/courses`.
- Existing user with a deep link lands on the requested route.
- Unknown but valid directory user is provisioned from LDAP and then logged in.
- Direct access without SSO protection does not allow forged identity headers.
- Legacy `/api/v1/login/cas` still works while migration is ongoing.

## Important operational note

Only trust user identity headers from a proxy or ingress you control.
Direct client-supplied headers such as `X-Forwarded-User` must be stripped at the edge.
