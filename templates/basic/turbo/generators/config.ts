import type { PlopTypes } from "@turbo/gen";
import { existsSync, readFileSync } from "node:fs";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("database", {
    description: "Optionally add local PostgreSQL 18 and Drizzle ORM",
    prompts: [],
    actions: () => {
      const files = [
        ["compose.yaml", "compose.yaml.hbs"],
        [".env.example", "env.example.hbs"],
        ["packages/db/package.json", "db-package.json.hbs"],
        ["packages/db/tsconfig.json", "db-tsconfig.json.hbs"],
        ["packages/db/turbo.json", "db-turbo.json.hbs"],
        ["packages/db/drizzle.config.ts", "drizzle.config.ts.hbs"],
        ["packages/db/src/index.ts", "db-index.ts.hbs"],
        ["packages/db/src/schema/.gitkeep", "empty.hbs"],
      ];

      return files.map(([path, template]) => ({
        type: "add" as const,
        path,
        templateFile: `templates/${template}`,
      }));
    },
  });

  plop.setGenerator("auth", {
    description: "Add Better Auth on top of the database package",
    prompts: [],
    actions: () => {
      if (!existsSync("packages/db/package.json")) {
        throw new Error("Auth requires @repo/db. Run `pnpm turbo gen database` first.");
      }
      if (existsSync("packages/auth") || existsSync("packages/db/src/schema/auth.ts")) {
        throw new Error("Auth package or schema already exists; refusing to overwrite it.");
      }
      if (
        existsSync("packages/api") ||
        existsSync("apps/api") ||
        existsSync("apps/web/src/AuthApp.tsx")
      ) {
        throw new Error(
          "API package, host, or web auth app already exists; refusing to overwrite it.",
        );
      }
      const starterApp = `import { Button } from "@repo/ui/components/button";
import { ThemeToggle } from "./components/theme-toggle";

export default function App() {
  return (
    <main className="flex min-h-svh flex-col gap-6 p-6">
      <ThemeToggle />
      <div className="flex max-w-md flex-col gap-4 text-sm leading-loose">
        <h1 className="font-medium">ProjectX</h1>
        <p>Run the database and auth generators to add sign-in and signup.</p>
        <Button>Button</Button>
      </div>
    </main>
  );
}`;
      if (readFileSync("apps/web/src/App.tsx", "utf8").trim() !== starterApp) {
        throw new Error("Web app has been customized; refusing to replace it with the auth flow.");
      }

      const files = [
        ["packages/auth/package.json", "auth-package.json.hbs"],
        ["packages/auth/turbo.json", "auth-turbo.json.hbs"],
        ["packages/auth/tsconfig.json", "auth-tsconfig.json.hbs"],
        ["packages/auth/src/index.ts", "auth-index.ts.hbs"],
        ["packages/auth/src/schema.config.ts", "auth-schema-config.ts.hbs"],
        ["packages/auth/src/next.ts", "auth-next.ts.hbs"],
        ["packages/auth/src/tanstack.ts", "auth-tanstack.ts.hbs"],
        ["packages/auth/src/hono.ts", "auth-hono.ts.hbs"],
        ["packages/auth/src/react.ts", "auth-react.ts.hbs"],
        ["packages/api/package.json", "api-package.json.hbs"],
        ["packages/api/tsconfig.json", "api-tsconfig.json.hbs"],
        ["packages/api/src/index.ts", "api-index.ts.hbs"],
        ["apps/api/package.json", "api-app-package.json.hbs"],
        ["apps/api/turbo.json", "api-app-turbo.json.hbs"],
        ["apps/api/tsconfig.json", "api-app-tsconfig.json.hbs"],
        ["apps/api/src/index.ts", "api-app-index.ts.hbs"],
        ["apps/web/src/AuthApp.tsx", "web-auth-app.tsx.hbs"],
      ];

      return [
        ...files.map(([path, template]) => ({
          type: "add" as const,
          path,
          templateFile: `templates/${template}`,
        })),
        {
          type: "modify" as const,
          path: ".env.example",
          pattern: /$/,
          template:
            "\nBETTER_AUTH_SECRET=\nBETTER_AUTH_URL=http://localhost:3000\nWEB_ORIGIN=http://localhost:5173\n",
        },
        {
          type: "modify" as const,
          path: "apps/web/package.json",
          pattern: /"@repo\/ui": "workspace:\*",/,
          template: '"@repo/ui": "workspace:*",\n    "@repo/auth": "workspace:*",',
        },
        {
          type: "modify" as const,
          path: "apps/web/src/App.tsx",
          pattern: /^[\s\S]*$/,
          template: 'export { default } from "./AuthApp";\n',
        },
        {
          type: "modify" as const,
          path: "apps/web/vite.config.ts",
          pattern: /  plugins: \[react\(\), tailwindcss\(\)\],/,
          template:
            '  plugins: [react(), tailwindcss()],\n  server: { proxy: { "/api": "http://localhost:3000" } },',
        },
      ];
    },
  });
}
