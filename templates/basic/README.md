# Vite + React Turborepo starter

This pnpm workspace contains:

- `apps/web`: a Vite app using React and TypeScript
- `packages/ui`: shared React components
- `packages/typescript-config`: shared TypeScript configurations

## Develop

Install dependencies with `pnpm install`, then run `pnpm dev`. Open http://localhost:5173.

## Validate and build

- `pnpm check` runs Oxlint and Knip, type checking, and a non-writing formatting check.
- `pnpm build` builds the Vite app to `apps/web/dist`.
- `pnpm --filter web preview` previews the production build.

The root scripts use Turborepo to run tasks across the workspace.

## Optional database

Run `pnpm turbo gen database` and confirm to add local PostgreSQL (Docker Compose) and a Drizzle ORM `packages/db` workspace. Declining makes no changes. No schema is provided: add your own tables in `packages/db/src/schema/*.ts` before generating migrations.

```sh
cp .env.example .env
docker compose up -d
pnpm install
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

The database package is for server-side use and is not connected to the Vite browser app. Supply `DATABASE_URL` to any server process that imports it.
