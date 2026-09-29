# Vite + React Turborepo starter

This pnpm workspace contains:

- `apps/web`: a Vite app using React and TypeScript
- `packages/ui`: shared shadcn/ui components, Tailwind styles, and React feature blocks
- `packages/typescript-config`: shared TypeScript configurations

## AI-assisted installation

For a complete setup with PostgreSQL, Better Auth, and the API, give your assistant this prompt:

```text
Set up this starter with PostgreSQL, Better Auth, and the API. Read and follow ./llm.txt (https://raw.githubusercontent.com/madflow/projectx/main/templates/basic/llm.txt). Do not overwrite existing files or expose secrets. Verify the app and report any steps you cannot complete.
```

The same instructions are available in [llm.txt](llm.txt). Manual steps are below.

## Develop

Install dependencies with `pnpm install`, then run `pnpm dev`. Open http://localhost:5173.

The web app imports `@repo/ui/globals.css`, which supplies Tailwind v4, the neutral shadcn theme, Figtree, and shared light/dark tokens. Enabled buttons use a pointer cursor, as in the `buFyx8K` Vite monorepo preset. Use the theme control in the app to select light, dark, or system mode (or press `d` outside an editable field to toggle light/dark). The selection is saved in local storage and follows system preference when set to system.

To add shared shadcn components, run `pnpm dlx shadcn@latest add <component> -c apps/web` from this directory. The app and UI package `components.json` files point to `packages/ui/src/styles/globals.css` and route shared components to `packages/ui/src/components`; import them as `@repo/ui/components/<component>`. Add dependencies required by new components to `packages/ui/package.json`.

## Validate and build

- `pnpm check` runs Oxlint and Knip, type checking, and a non-writing formatting check. After adding auth, run `pnpm env:init` and `pnpm auth:generate-schema` first; checks cannot pass until `packages/db/src/schema/auth.ts` exists.
- `pnpm build` builds the Vite app to `apps/web/dist`.
- `pnpm --filter web preview` previews the production build.

The root scripts use Turborepo to run tasks across the workspace.

`pnpm format` and `pnpm format:check` use Oxfmt to sort imports and Tailwind v4 classes against `packages/ui/src/styles/globals.css`. They also format/check the TypeScript generator templates (`*.ts.hbs` and `*.tsx.hbs`) as generated files and verify that the auth generator's starter-app guard matches `apps/web/src/App.tsx`.

## Optional database

Run `pnpm turbo gen database` to add local PostgreSQL 18 (Docker Compose) and a Drizzle ORM `packages/db` workspace. No schema is provided: add your own tables in `packages/db/src/schema/*.ts` before generating migrations (or generate the auth schema as described below).

```sh
pnpm install
pnpm env:copy-example
docker compose up -d
pnpm db:generate
pnpm db:migrate
```

The database package is for server-side use and is not connected to the Vite browser app. Supply `DATABASE_URL` to any server process that imports it.

### Existing PostgreSQL 17 data

The PostgreSQL 18 image mounts its volume at `/var/lib/postgresql` rather than `/var/lib/postgresql/data`. Changing the image tag **does not upgrade** an existing PostgreSQL 17 database. Back up the old database with `pg_dump`/`pg_dumpall` while PostgreSQL 17 is still running, retain the old volume, create a **new** PostgreSQL 18 volume (with a new name or Compose project), and restore the dump into PostgreSQL 18. Verify the restored data before removing the old volume. Never run `docker compose down -v` against a volume you want to keep. For large installations, follow the PostgreSQL `pg_upgrade` documentation instead.

## UI feature blocks

`@repo/ui` exports styled, framework-neutral blocks at `@repo/ui/features/login-form`, `@repo/ui/features/signup-form`, and `@repo/ui/features/sidebar-layout`. The blocks adapt the upstream shadcn `base-lyra` layouts with unmodified shadcn primitives in `packages/ui/src/components/`, using Tailwind classes instead of a separate feature stylesheet. The login and signup forms require an `onSubmit` callback and accept optional `pending`, `error`, and navigation-link props; wire them to `@repo/auth/react` in the consuming app. `LoginForm` accepts optional `onSignupClick`, `onForgotPasswordClick`, and `onGoogleLogin` callbacks; the Google button appears only when its action is supplied. `SignupForm` accepts `onLoginClick` for an in-app switch. `SidebarLayout` accepts `navigation`, `header`, `footer`, and page `children`; use `SidebarNavItem` for icon-collapsing links. It uses the shadcn sidebar's mobile sheet and remembers desktop collapse state in a cookie. These blocks do not create routes, supply sample data, or enable social login by default.

## Optional authentication

To start with database, auth, API, and web, run the following from the project root. The auth generator refuses to run without the database package, overwrite existing auth/API packages or auth UI, or replace a customized `apps/web/src/App.tsx`. It wires the reusable login/signup UI blocks to Better Auth in the web app.

```sh
pnpm turbo gen database
pnpm turbo gen auth
pnpm install
# Review the non-secret .env.example defaults before initializing.
pnpm env:init
pnpm auth:generate-schema
pnpm db:generate
# Review the generated migration before applying it.
docker compose up -d
pnpm db:migrate
pnpm check
pnpm dev
```

Run `pnpm env:init` only after both generators, after reviewing the non-secret `.env.example` defaults. It creates `.env` from `.env.example` with a random `BETTER_AUTH_SECRET`, without printing it, and refuses to overwrite an existing file. A successful initialization does not require reading `.env` back. The example database credentials are for local development only; if `.env` already exists, verify it rather than rerunning initialization. For a database-only setup, `pnpm env:copy-example` copies the example without generating an auth secret. `pnpm env:run <command>` runs a command with root `.env` loaded, and `pnpm env:remove` deletes the local `.env`. `pnpm auth:generate-schema` uses the pinned Better Auth 1.7.6 CLI to generate `packages/db/src/schema/auth.ts` from `packages/auth/src/schema.config.ts`, replacing that generated file on subsequent runs. This is required before `pnpm check`: without it, `@repo/auth` cannot resolve `@repo/db/schema/auth`. Schema generation needs `.env` but not a running database. The root `db:generate`, `db:migrate`, and `db:studio` scripts delegate to `@repo/db` (and are available after generating the database workspace). `db:generate` creates SQL migrations in `packages/db/drizzle/` from `packages/db/src/schema/*.ts`; `db:migrate` applies them to `DATABASE_URL`. The API loads `.env` itself on startup.

The generated auth schema has plural table names (`users`, `sessions`, `accounts`, `verifications`, and plural plugin tables), snake_case SQL columns, and PostgreSQL `uuid` primary keys defaulting to `pg_catalog.gen_random_uuid()`. Better Auth leaves ID generation to PostgreSQL. The CLI and runtime share `usePlural: true`; joins are enabled and the CLI-generated Drizzle relations are passed to both Drizzle and the Better Auth adapter. Run the Drizzle migration **before** serving auth requests. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in the server process. Do not commit `.env`.

Add schema-affecting Better Auth plugins to `authOptions.plugins` in `packages/auth/src/schema.config.ts` so the CLI and runtime use the same configuration. After changing plugins or auth options, run `pnpm auth:generate-schema`, `pnpm db:generate`, and `pnpm db:migrate` again. Do not hand-edit `packages/db/src/schema/auth.ts`: regeneration replaces it. Add other application tables in separate files under `packages/db/src/schema/`.

`@repo/auth` exports a framework-neutral `auth` instance and framework entry points. Add `@repo/auth: workspace:*` to the consuming server app and mount `/api/auth/*` there:

- Next.js App Router, `app/api/auth/[...all]/route.ts`: `export { GET, POST } from "@repo/auth/next";`
- TanStack Start, `src/routes/api/auth/$.ts`: use `createFileRoute('/api/auth/$')({ server: { handlers: { GET, POST } } })` with `import { GET, POST } from "@repo/auth/tanstack";`.
- Hono: `app.all("/api/auth/*", (c) => honoAuthHandler(c.req.raw));` with `import { honoAuthHandler } from "@repo/auth/hono";`.

The Next.js and TanStack entry points install their respective server-action cookie plugins. `apps/api` mounts Better Auth at `/api/auth/*` and `@repo/api` at `/api/v1/*`. The API package exports an oRPC `OpenAPIHandler` with `/health` (public) and `/me` (session-required), plus generated OpenAPI documentation at `/api/v1/docs` and `/api/v1/openapi.json`. Add more REST procedures in `packages/api/src/index.ts`; keep login and signup on Better Auth's native endpoints.

After auth generation, `apps/web` shows email/password sign-in and signup forms, the active session, and sign-out. The generated `AuthApp.tsx` composes headless `@repo/auth/react` hooks with the `@repo/ui` blocks; it does not enable social login. The web app proxies `/api` to the host at `http://localhost:3000` in development. Open http://localhost:5173 after starting `pnpm dev`. The same-origin proxy makes session cookies work without development CORS configuration; `WEB_ORIGIN=http://localhost:5173` allows Better Auth to accept browser requests from the Vite origin. In production, route `/api/*` to `apps/api` and serve the Vite build on the same origin (or explicitly configure cross-origin cookies and trusted origins). `apps/api` loads the root `.env` on startup; configure `BETTER_AUTH_URL=http://localhost:3000` for this local setup. If port 3000 is already in use, set `PORT` and `BETTER_AUTH_URL` for the API process and change the target in `apps/web/vite.config.ts` to match.

### React UI integration

`@repo/auth/react` is a **client-only, headless** entry point. The generator adds `@repo/auth: workspace:*` to the web app's dependencies. It provides `createAuthClient`, `AuthProvider`, `useAuthClient` (the full typed client, including configured plugin actions), `useAuthSession` (reactive session), and action hooks for email sign-in/up, sign-out, password reset, verification email, and password change. `useAuthAction` can wrap any other client action with pending and error state. The package does not define UI routes or import the database-backed server instance into browser code. Build other forms and route layouts in the consuming app.

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
