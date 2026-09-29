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

Run `pnpm turbo gen database` and confirm to add local PostgreSQL 18 (Docker Compose) and a Drizzle ORM `packages/db` workspace. Declining makes no changes. No schema is provided: add your own tables in `packages/db/src/schema/*.ts` before generating migrations (or use the auth generator below).

```sh
cp .env.example .env
docker compose up -d
pnpm install
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

The database package is for server-side use and is not connected to the Vite browser app. Supply `DATABASE_URL` to any server process that imports it.

### Existing PostgreSQL 17 data

The PostgreSQL 18 image mounts its volume at `/var/lib/postgresql` rather than `/var/lib/postgresql/data`. Changing the image tag **does not upgrade** an existing PostgreSQL 17 database. Back up the old database with `pg_dump`/`pg_dumpall` while PostgreSQL 17 is still running, retain the old volume, create a **new** PostgreSQL 18 volume (with a new name or Compose project), and restore the dump into PostgreSQL 18. Verify the restored data before removing the old volume. Never run `docker compose down -v` against a volume you want to keep. For large installations, follow the PostgreSQL `pg_upgrade` documentation instead.

## Optional authentication

Run `pnpm turbo gen database` first, then `pnpm turbo gen auth` to add `@repo/auth`, the Better Auth schema in `@repo/db`, a mountable OpenAPI REST `@repo/api` package, a thin `apps/api` host, and login/signup in `apps/web`. The auth generator refuses to run without the database package or overwrite existing auth/API packages and web auth UI.

```sh
pnpm install
cp .env.example .env # if you haven't already
# Add BETTER_AUTH_SECRET (at least 32 random characters), BETTER_AUTH_URL, and WEB_ORIGIN to .env
docker compose up -d
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
pnpm dev
```

The auth schema has lowercase plural tables (`users`, `sessions`, `accounts`, `verifications`), snake_case SQL columns, and PostgreSQL `uuid` primary keys defaulting to PostgreSQL 18's `uuidv7()`. Better Auth leaves ID generation to the database. Run the Drizzle migration **before** serving auth requests. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in the server process. Do not commit `.env`.

The schema is supplied by the generator, not by `auth generate`: that command may replace native UUID columns and UUIDv7 defaults with text IDs. When adding Better Auth plugins, update `packages/db/src/schema/auth.ts` to include their fields/tables before running Drizzle migrations.

`@repo/auth` exports a framework-neutral `auth` instance and framework entry points. Add `@repo/auth: workspace:*` to the consuming server app and mount `/api/auth/*` there:

- Next.js App Router, `app/api/auth/[...all]/route.ts`: `export { GET, POST } from "@repo/auth/next";`
- TanStack Start, `src/routes/api/auth/$.ts`: use `createFileRoute('/api/auth/$')({ server: { handlers: { GET, POST } } })` with `import { GET, POST } from "@repo/auth/tanstack";`.
- Hono: `app.all("/api/auth/*", (c) => honoAuthHandler(c.req.raw));` with `import { honoAuthHandler } from "@repo/auth/hono";`.

The Next.js and TanStack entry points install their respective server-action cookie plugins. `apps/api` mounts Better Auth at `/api/auth/*` and `@repo/api` at `/api/v1/*`. The API package exports an oRPC `OpenAPIHandler` with `/health` (public) and `/me` (session-required), plus generated OpenAPI documentation at `/api/v1/docs` and `/api/v1/openapi.json`. Add more REST procedures in `packages/api/src/index.ts`; keep login and signup on Better Auth's native endpoints.

`apps/web` proxies `/api` to the host at `http://localhost:3000` in development and offers a minimal email/password login/signup form. Open http://localhost:5173 after starting `pnpm dev`. The same-origin proxy makes session cookies work without development CORS configuration; `WEB_ORIGIN=http://localhost:5173` allows Better Auth to accept browser requests from the Vite origin. In production, route `/api/*` to `apps/api` and serve the Vite build on the same origin (or explicitly configure cross-origin cookies and trusted origins). `apps/api` loads the root `.env` on startup; configure `BETTER_AUTH_URL=http://localhost:3000` for this local setup. If port 3000 is already in use, set `PORT` and `BETTER_AUTH_URL` for the API process and change the target in `apps/web/vite.config.ts` to match.

### React UI integration

`@repo/auth/react` is a **client-only, headless** entry point used by the generated web login UI. It provides `createAuthClient`, `AuthProvider`, `useAuthClient` (the full typed client, including configured plugin actions), `useAuthSession` (reactive session), and action hooks for email sign-in/up, sign-out, password reset, verification email, and password change. `useAuthAction` can wrap any other client action with pending and error state. The package does not define UI routes or import the database-backed server instance into browser code. Build other forms and route layouts in the consuming app.

```tsx
"use client";

import { AuthProvider, createAuthClient, useSignInEmail } from "@repo/auth/react";
import type { ReactNode } from "react";

const authClient = createAuthClient({ baseURL: "http://localhost:3000" });

export function AuthProviders({ children }: { children: ReactNode }) {
  return <AuthProvider client={authClient}>{children}</AuthProvider>;
}

export function SignInButton() {
  const { execute, isPending, error } = useSignInEmail();
  return (
    <>
      <button
        disabled={isPending}
        onClick={() => execute({ email: "user@example.com", password: "password" })}
      >
        Sign in
      </button>
      {error && <p role="alert">{error.message}</p>}
    </>
  );
}
```

Use real form values and handle redirects in your app router. For other built-in endpoints, use `useAuthClient()` directly or wrap a method with `useAuthAction((client, input) => client.someAction(input))`. For plugin actions, use `useAuthClient<typeof authClient>()` with your plugin-configured client type. Action hooks return Better Auth's original `{ data, error }` result; the hook's `error` state is for display, not an exception. Password-reset and verification flows require your server to configure email delivery before they can send mail.
