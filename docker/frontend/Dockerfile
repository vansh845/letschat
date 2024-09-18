FROM oven/bun:1 AS base
WORKDIR /app
COPY ./ui /app/
RUN bun install
EXPOSE 5173
CMD [ "bun", "dev" ]