FROM oven/bun:alpine AS build
ENV NODE_ENV=production
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:alpine
ENV NODE_ENV=production
EXPOSE 4173
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

ENTRYPOINT [ "bun", "run", "preview", "--", "--host", "--port", "4173" ]
