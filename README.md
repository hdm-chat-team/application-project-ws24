# StudyConnect

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

A messanger for students at [Stuttgart Media University](https://www.hdm-stuttgart.de/)

## Requirements

This project uses Bun as its package manager and server runtime.
To install it follow the instructions [here](https://bun.sh).

You will also need [Node.js](https://nodejs.org/en/download)

## Project structure

We use [Turborepo](https://turbo.build) for managing our apps/packages

### Apps

- `backend`: a [Hono](https://hono.dev) app
- `frontend`: a [Vite](https://vite.dev) app using [React](https://react.dev)

### Packages

- `tsconfig`: shared typescript configuration

Each app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code linting/formatting
  - use `bun check` to lint/check formatting
  - use `bun check:fix` to fix most linting errors and apply formatting

## Contributing

We use [conventional commits](https://www.conventionalcommits.org) to format commit messages.

## Commands

### Build

To build all apps and packages, run the following command in the root of the project:

```sh
bun run build
```

### Develop

To start all development servers, run the following command:

```sh
bun dev
```
