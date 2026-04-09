FROM oven/bun:alpine AS build
ENV NODE_ENV=production

WORKDIR /app
COPY package.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM nginx:alpine
WORKDIR /var/www/ticketrush
EXPOSE 80

COPY --from=build /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
