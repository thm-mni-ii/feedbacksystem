# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build for production
COPY . .
RUN npm run dist

# ─── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build output
COPY --from=builder /app/dist/sql-playground /usr/share/nginx/html

# Copy custom nginx config template (SPA routing + API proxy)
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

# envsubst substitutes $FBS_CORE_URL at container start; nginx:alpine
# images automatically process /etc/nginx/templates/*.template into
# /etc/nginx/conf.d/ before nginx launches.
CMD ["nginx", "-g", "daemon off;"]
