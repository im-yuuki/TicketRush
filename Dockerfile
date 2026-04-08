FROM oven/bun:alpine
ENV NODE_ENV=production
EXPOSE 4173

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
RUN rm -rf src/ public/
RUN bun cache clean

ENTRYPOINT [ "bun", "run", "preview", "--", "--host", "--port", "4173" ]
