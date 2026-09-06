FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm ci

COPY tsconfig.json tsconfig.json
COPY backend backend
RUN npm run build --workspace backend && npm prune --omit=dev

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend/package.json backend/package.json
COPY --from=build /app/backend/dist backend/dist

WORKDIR /app/backend
EXPOSE 3030

CMD ["node", "dist/index.js"]
