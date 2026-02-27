# sql-playground — Standalone Angular 14 App

Standalone front-end for the SQL Playground feature.  
Built with **Angular 14**, served in production by **nginx** inside Docker.

---

## Local development

### Prerequisites
- Node.js ≥ 16 (LTS)
- npm ≥ 8

### 1. Install dependencies

```bash
cd modules/sql-playground/web
npm install
```

### 2. Start the dev server

```bash
npm start
# or equivalently:
npx ng serve --proxy-config proxy.config.json
```

The app is available at **http://localhost:4200**.

The proxy config (`proxy.config.json`) forwards all `/api/**` requests to
`https://127.0.0.1:443` so that the local dev server talks to the same backend
as the main application.

---

## Production build

```bash
npm run dist
# Output: dist/sql-playground/
```

---

## Docker

### Build the image

```bash
# From the project root (feedbacksystem/) or from this directory:
docker build -t sql-playground:latest modules/sql-playground/web/
# or, if already inside modules/sql-playground/web/:
docker build -t sql-playground:latest .
```

The multi-stage `Dockerfile`:
1. **Stage 1 – builder** (`node:18-alpine`): runs `npm ci` + `npm run dist`
2. **Stage 2 – serve** (`nginx:1.25-alpine`): copies the Angular build output and a custom `nginx.conf` that handles SPA routing

### Run the container

```bash
docker run --rm -p 8080:80 sql-playground:latest
```

Open **http://localhost:8080** in your browser.

---

## Project structure

```
modules/sql-playground/web/
├── angular.json               # Angular workspace config
├── Dockerfile                 # Multi-stage build
├── nginx.conf                 # nginx SPA config
├── package.json
├── proxy.config.json          # Dev proxy: /api → backend
├── tsconfig.json
└── src/
    ├── index.html
    ├── main.ts
    ├── polyfills.ts
    ├── styles.scss
    ├── environments/
    │   ├── environment.ts
    │   └── environment.prod.ts
    └── app/
        ├── app.module.ts
        ├── app-routing.module.ts
        ├── app.component.*
        └── sql-playground-page/   ← placeholder page (future: real implementation)
```
