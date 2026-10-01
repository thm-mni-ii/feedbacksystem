# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build for production
COPY . .
RUN npm run dist

# ─── Stage 2: Serve with Caddy ────────────────────────────────────────────────
FROM caddy:2-alpine

# Remove default static assets
RUN rm -rf /usr/share/caddy/*

# Copy Angular build output
COPY --from=builder /app/dist/sql-playground /usr/share/caddy

# Copy custom Caddyfile (SPA routing + API proxy)
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
