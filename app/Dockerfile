ARG BUN_VERSION=1.1.34

ARG YARN_PKG_MANAGER="this.packageManager=\"yarn@1.22.22\""
ARG BUN_PKG_MANAGER="this.packageManager=\"bun@${BUN_VERSION}\""

FROM oven/bun:${BUN_VERSION} as bun
WORKDIR /app

FROM oven/bun:${BUN_VERSION}-alpine as bun-alpine
WORKDIR /app

# ================= TURBO PRUNE ===================

FROM bun as pruned
ARG YARN_PKG_MANAGER
COPY . .
RUN bunx json -I -f package.json -e ${YARN_PKG_MANAGER}
RUN bunx turbo prune --scope="@application-project-ws24/app" --docker

# =============== INSTALL & BUILD =================

FROM bun as builder
ARG BUN_PKG_MANAGER
COPY --from=pruned /app/out/full/ .
RUN bunx json -I -f package.json -e ${BUN_PKG_MANAGER}
RUN bun install --production
RUN bunx clean-modules -y "**/*.ts" "**/@types/**"
RUN bunx turbo build --filter="@application-project-ws24/app"

# ================== RELEASE ======================

FROM bun-alpine AS release
USER bun
COPY --from=builder /app .
EXPOSE 3000/tcp
WORKDIR /app/app
ENTRYPOINT [ "bun", "dist/index.js" ]