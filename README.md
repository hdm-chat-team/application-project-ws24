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
  - `/backend`: a 🔥 [Hono](https://hono.dev) app
  - `/frontend`: a ⚡ [Vite](https://vite.dev) app using
    - ⚛️ [React](https://react.dev) for reactivity
    - 🏝️ [Tanstack Router](https://tanstack.com/router/) for managing SPA routes
    - 🏝️ [Tanstack react-query](https://tanstack.com/query) for managing server state on the client

### 📦 Packages

- `/tsconfig`: shared typescript configuration
- `/auth`: utility function package to manage users and sessions
  - following the 🔐 [lucia-auth](https://lucia-auth.com/) tutorial
- `/database`: package for handling db schema and access
  - using 💧 [Drizzle ORM](https://orm.drizzle.team/) with [PostgreSQL](https://www.postgresql.org/) on the server

## 🧰 Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code linting/formatting
  - use `bun check` to lint/check formatting
  - use `bun check:fix` to fix most linting errors and apply formatting
- [PWA-assets generator](https://vite-pwa-org.netlify.app/assets-generator)
  - use `bun gen-pwa-assets` in the `/frontend` package to generate PWA assets from `logo.svg`

## 💡 Contributing

We use [conventional commits](https://www.conventionalcommits.org) to format commit messages. The repo includes a recommended VSCode extension.
We use issue branches and Pull requests to organize changes.

## ⌨️ Commands

### 🧪 Test

So far we are simply using Bun's integrated test runner:

```zsh
bun test
```

Test files are all named `*.test.ts`

### 🚧 Build

To build all apps and packages, run the following command in the root of the project:

```zsh
bun run build
```

### 🐋 Docker

To build the development database instance and dockerize the backends current build:

```zsh
docker compose build
```

To start both containers:

```zsh
docker compose up -d
```

### 👨‍💻 Develop

To start all development servers, run the following command:

```zsh
bun dev
```

Both Tanstack libraries will render development tools to debug their features.
