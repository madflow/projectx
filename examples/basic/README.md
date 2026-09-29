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
