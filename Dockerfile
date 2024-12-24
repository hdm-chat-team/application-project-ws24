FROM oven/bun:alpine AS base
WORKDIR /app

FROM base AS install
COPY . /temp/dev
RUN cd /temp/dev && bun install --frozen-lockfile

COPY . /temp/prod
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bunx clean-modules -y "**/*.ts" "**/@types/**"
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/app/dist dist
COPY --from=prerelease /app/package.json .

# define default environment variables
ENV NODE_ENV=production
ENV PORT=3000

# run the app
USER bun
EXPOSE 3000/tcp
WORKDIR /app
ENTRYPOINT [ "bun", "run", "dist/index.js" ]