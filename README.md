# StudyConnect

[![Tests](https://github.com/DenizGazitepe/application-project-ws24/actions/workflows/test.yml/badge.svg)](https://github.com/DenizGazitepe/application-project-ws24/actions/workflows/test.yml) [![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

A realtime web messanger to connect students at [Stuttgart Media University](https://www.hdm-stuttgart.de/)

## 🗒️ Requirements

This project uses [Bun](https://bun.sh) as its package manager and server runtime.
To install it follow the instructions [here](https://bun.sh/docs/installation).

You will also need [Node.js](https://nodejs.org/en/download).

[Docker Desktop](https://www.docker.com/) to run the development database.

## 🏗️ Project structure

We use 🚀 [Turborepo](https://turbo.build) for managing our apps/packages.
Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### 🌐 Apps

- `/app`: a monorepo-style app
  - `/backend`: a 🔥 [Hono](https://hono.dev) server providing api routes and serving the frontend
    - 🔐 Cookie based authentication using the [lucia-auth](https://lucia-auth.com/) guide.
    - 🔌 [Websockets](https://bun.sh/docs/api/websockets) for real time features.
  - `/frontend`: a ⚡ [Vite](https://vite.dev) SPA using
    - ⚛️ [React](https://react.dev) as the frontend framework.
    - 🏝️ [Tanstack Router](https://tanstack.com/router/) for managing SPA routes.
    - 🏝️ [Tanstack react-query](https://tanstack.com/query) for managing server.state on the client

### 📦 Packages

- `/cuid`: package for generating and validating [CUID2](https://github.com/paralleldrive/cuid2) ids on the server and client.
- `/tsconfig`: shared typescript configuration

## 🧰 Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code linting/formatting
  - use `bun check` to lint/check formatting
  - use `bun check:fix` to fix most linting errors and apply formatting
- [PWA-assets generator](https://vite-pwa-org.netlify.app/assets-generator)
  - use `bun assets`  to generate PWA assets from `public/logo.svg`

## 💡 Contributing

We use [conventional commits](https://www.conventionalcommits.org) to format commit messages. The repo includes a recommended VSCode extension.
We use issue branches and Pull requests to organize changes.

## ⌨️ Commands

### 🧪 Test

So far we are simply using Bun's integrated test runner:

```zsh
bun run test
```

Make sure to include `run`, otherwise environment variables won't be set.

Test files are all named `*.test.ts`

### 👷‍♂️ Build

To build all apps and packages, run the following command in the root of the project:

```zsh
bun run build
```

### 🐋 Docker

To start the local database run:

```zsh
docker compose up db --detach
```

To start both containers:

```zsh
docker compose up --build --detach
```

### 👨‍💻 Develop

To start all development servers, run the following command:

```zsh
bun dev
```

Both Tanstack libraries will render development tools to debug their features.

To use Drizzle-kit CLI [commands](https://orm.drizzle.team/docs/kit-overview) run:

```zsh
bun db <COMMAND>
```

To use shadcn/ui CLI [commands](https://ui.shadcn.com/docs/cli) run:

```zsh
bun ui <COMMAND>
```
