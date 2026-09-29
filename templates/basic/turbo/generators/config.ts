import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("database", {
    description: "Optionally add local PostgreSQL and Drizzle ORM",
    prompts: [
      {
        type: "confirm",
        name: "database",
        message: "Add PostgreSQL and Drizzle ORM?",
        default: true,
      },
    ],
    actions: (answers) => {
      if (!answers?.database) return ["Skipped database setup"];

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
}
