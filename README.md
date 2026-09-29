# Turbo starters

Each directory under `templates/` is a self-contained Turborepo. `templates/basic` is the current Vite/React starter. Requires Node 24+ and pnpm 12; the optional PostgreSQL feature also requires Docker Compose.

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
pnpm turbo gen database          # answer yes to add it, or no to leave the template unchanged
pnpm install                     # after choosing yes, install the new db workspace dependencies
cp .env.example .env             # after choosing yes
docker compose config            # check the generated Compose configuration
```

The generator adds no schema or sample tables. To exercise migrations, define your own tables in `packages/db/src/schema/*.ts`, start PostgreSQL with `docker compose up -d`, then run `pnpm --filter @repo/db db:generate` and `pnpm --filter @repo/db db:migrate`. See `templates/basic/README.md` for template details.

`create-turbo --example` supports GitHub URLs, not local filesystem paths. The scratch-copy workflow tests unpublished changes without pushing to GitHub.
