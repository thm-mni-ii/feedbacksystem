# FBS 2.0 Web Shell (`modules/fbs-web-shell`)

The **FBS Web Shell** provides the global platform shell and dynamic navigation host for all registered Application Providers in the Feedback System (FBS) 2.0 ecosystem.

## Features
- **OIDC PKCE Authentication:** Integrated with `fbs-identity-service` for Single Sign-On and bearer token distribution.
- **Dynamic Navbar:** Fetches visible and authorized applications dynamically from `GET /api/v2/application-providers`.
- **Iframe Host Container (`<fbs-app-host>`):** Full-height embedded application host with the PostMessage Bridge protocol (`FBS_INIT_HANDSHAKE`, `FBS_REQUEST_AUTH_TOKEN`, `FBS_NAVIGATE`, etc.).
- **Application Management UI (`/admin/apps`):** Administrator view for registering, configuring, reordering, and managing Application Providers with real-time Material Icon previews.
- **User Management UI (`/admin/users`):** Administrator view for managing users, auth sources (`INTERNAL` vs `SAML`), role assignments, and password management via GraphQL.
- **User Profile View (`/profile`):** Account overview and self-service password update.
- **Material Design UI:** Theme matching FBS brand tokens with Dark/Light mode support.

## Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```
