import { existsSync } from "node:fs";

if (existsSync("packages/auth/package.json") && !existsSync("packages/db/src/schema/auth.ts")) {
  console.error(
    "Auth schema is missing: packages/db/src/schema/auth.ts. Run `pnpm env:copy-example`, configure .env, then run `pnpm auth:generate-schema` before `pnpm check`.",
  );
  process.exitCode = 1;
}
