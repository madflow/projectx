# ProjectX

Each directory under `templates/` is a self-contained Turborepo. `templates/basic` is the current Vite/React starter. Requires Node 24+ and pnpm 12; the optional PostgreSQL 18 feature also requires Docker Compose.

## Install the full starter with an AI assistant

Copy this prompt into your AI assistant:

```text
Ask me what to name the project and wait for my answer before starting. Then set up a new project with that name, including the web app, PostgreSQL, Better Auth, and API from https://github.com/madflow/projectx/tree/main/templates/basic. Read and follow the installation instructions at https://raw.githubusercontent.com/madflow/projectx/main/templates/basic/llm.txt (also included as llm.txt in the generated project) in order. Run the generators, install dependencies, set up the local environment and database, generate the auth schema before the SQL migration, apply migrations, and verify the app. Do not skip or reorder prerequisite steps. If a step fails or access is blocked, stop dependent steps, explain what is needed, and wait for me to resolve it; do not try another way around a safety restriction. Do not overwrite existing files or expose secrets. Tell me about any step you cannot complete.
```

The [installation instructions](templates/basic/llm.txt) are included in every project created from this template. `create-turbo --example` only copies the template; database and auth are added afterward by generators.

## Test a template locally

From this repository's root, copy the template to a scratch directory so generator output does not change the source template:

```sh
test_dir=$(mktemp -d)
rsync -a --exclude=node_modules --exclude=.turbo --exclude=dist templates/basic/ "$test_dir/"
cd "$test_dir"
pnpm install
pnpm check
pnpm build
```

Test the optional PostgreSQL and Drizzle ORM generator in the scratch copy:

```sh
pnpm turbo gen database          # adds the optional database workspace
pnpm install                     # install the new db workspace dependencies
pnpm env:copy-example
docker compose config            # check the generated Compose configuration
```

The generator adds no schema or sample tables. To exercise migrations, define your own tables in `packages/db/src/schema/*.ts`, start PostgreSQL with `docker compose up -d`, then run `pnpm db:generate` and `pnpm db:migrate`. See `templates/basic/README.md` for template details.

The optional `pnpm turbo gen auth` generator requires the database generator first. It creates `@repo/auth`, a mountable `@repo/api` OpenAPI REST package, a thin `apps/api` host, and a login UI in `apps/web`. After installing dependencies and copying `.env.example`, run `pnpm auth:generate-schema` before `pnpm db:generate` and `pnpm db:migrate`. Auth also exposes integration entry points for Next.js, TanStack Start, Hono, and headless React hooks. See `templates/basic/README.md` for environment, migrations, and PostgreSQL 17-to-18 upgrade guidance.

`create-turbo --example` supports GitHub URLs, not local filesystem paths. The scratch-copy workflow tests unpublished changes without pushing to GitHub.
