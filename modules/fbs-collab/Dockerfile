FROM node:22-alpine
USER node
COPY --chown=node package.json package-lock.json tsconfig.json /app/
WORKDIR /app
RUN npm ci
COPY --chown=node src/ src/
RUN npm run build
CMD ["node", "src/app.js"]
