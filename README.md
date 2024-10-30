# StudyConnect

A messanger for students at [Stuttgart Media University](https://www.hdm-stuttgart.de/)

## Requirements

This project uses Bun as its package manager and server runtime.
To install it follow the instructions [here](https://bun.sh).

You will also need [Node.js](https://nodejs.org/en/download)

## Project structure

We use [Turborepo](https://turbo.build) for managing our apps/packages

### Apps

- `backend`: a [Hono](https://hono.dev/) app
- `frontend`: the web-app (TBD)

Each app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code linting/formatting
  - use `bun check` to lint/check formatting
  - use `bun check:fix` to fix some linting errors and apply formatting

### Build

To build all apps and packages, run the following command in the root of the project:

```sh
bun build
```

### Develop

To start all development servers, run the following command:

```sh
bun dev
```
