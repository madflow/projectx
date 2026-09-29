# Turbo starters

One self-contained Turborepo starter lives in `templates/basic`. Each template is its own pnpm workspace; the repository root is only the scaffolding CLI.

Requires Node 24+, pnpm 12, and (for the optional database) Docker Compose.

```sh
pnpm install
pnpm run create --template basic my-app
# Or test any local template directory without pushing to GitHub:
pnpm run create --template-path ./templates/basic my-app
```

The CLI asks whether to add PostgreSQL and Drizzle ORM while creating a project. Choose **yes** to run the template's Turborepo/Plop generator; the CLI installs dependencies before and after generation. Choose **no** to copy the base starter without installing. Use `--database` or `--no-database` to skip the question in scripts. Run `pnpm run create` without arguments to also choose a template and project name interactively. The destination must not already exist. The CLI copies dotfiles, but excludes dependency folders, caches, build outputs, and repository metadata.

```sh
cd my-app
pnpm install # only needed if you chose no
pnpm dev
```

### Optional PostgreSQL

Choosing **yes** while creating the project adds `compose.yaml`, `.env.example`, and a `packages/db` workspace with Drizzle ORM. No schema or sample tables are generated. Then:

```sh
cp .env.example .env
docker compose up -d
```

If you chose no but change your mind later, run `pnpm turbo gen database` inside the project, then `pnpm install`.

Define your own tables in `packages/db/src/schema/*.ts`, then generate and apply migrations:

```sh
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

`DATABASE_URL` is read from the root `.env` by Drizzle Kit. Server-side code importing `@repo/db` must supply `DATABASE_URL` in its environment; the Vite browser app does not connect to PostgreSQL directly.

At this repository root, `pnpm test` checks the CLI and `pnpm check-types` checks its TypeScript. In a generated project, run `pnpm check` and `pnpm build`.
