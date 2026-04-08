FROM oven/bun:distroless AS build
ENV NODE_ENV=production
WORKDIR /build
COPY . .
RUN bun install
RUN bun run build

FROM oven/bun:distroless
ENV NODE_ENV=production
EXPOSE 4173
WORKDIR /app
COPY --from=build /build/dist ./dist
COPY --from=build /build/package.json ./package.json
RUN bun install --production

ENTRYPOINT [ "bun", "run", "preview" ]
