import { cp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const templates = resolve(dirname(fileURLToPath(import.meta.url)), "../templates");
const excluded = new Set([".git", "node_modules", ".turbo", "dist", "build", "coverage", "meta.json"]);

function parseArgs(args: string[]) {
  let template: string | undefined;
  let templatePath: string | undefined;
  let name: string | undefined;
  let database: boolean | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--template" || arg === "--template-path") {
      const value = args[++i];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      if (arg === "--template") template = value;
      else templatePath = value;
    } else if (arg === "--help" || arg === "-h") {
      return { help: true } as const;
    } else if (arg === "--database" || arg === "--no-database") {
      if (database !== undefined) throw new Error("Choose either --database or --no-database");
      database = arg === "--database";
    } else if (arg?.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!name) {
      name = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (template && templatePath) throw new Error("Choose either --template or --template-path");
  return { help: false, template, templatePath, name, database } as const;
}

function runPnpm(args: string[], cwd: string): Promise<void> {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.platform === "win32" ? "pnpm.cmd" : "pnpm", args, {
      cwd,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`pnpm ${args.join(" ")} failed (exit code ${code})`));
    });
  });
}

async function directoryExists(path: string) {
  try {
    return (await stat(path)).isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function createProject(source: string, name: string, cwd = process.cwd()) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name) || name === "." || name === "..") {
    throw new Error("Project name must be a lowercase, unscoped package name (no paths)");
  }

  const from = resolve(source);
  const to = resolve(cwd, name);
  if (!(await directoryExists(from))) throw new Error(`Template directory not found: ${from}`);
  try {
    await stat(to);
    throw new Error(`Destination already exists: ${to}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  await cp(from, to, {
    recursive: true,
    errorOnExist: true,
    force: false,
    filter: (path) => path === from || !excluded.has(path.split(/[\\/]/).at(-1)!),
  });

  const packageFile = join(to, "package.json");
  const pkg = JSON.parse(await readFile(packageFile, "utf8")) as { name: string };
  pkg.name = name;
  await writeFile(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
  return to;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Usage: pnpm run create [--template basic | --template-path ./path] [--database | --no-database] <project-name>",
    );
    return;
  }

  let source = args.templatePath && resolve(args.templatePath);
  let name = args.name;
  let database = args.database;
  let names: string[] = [];
  if (!source) {
    names = (await readdir(templates, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    if (!names.length) throw new Error("No templates available");
    if (args.template) {
      if (!names.includes(args.template)) throw new Error(`Unknown template: ${args.template}`);
      source = join(templates, args.template);
    }
  }
  let hasDatabaseGenerator = source && (await directoryExists(join(source, "turbo/generators")));
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (!source) {
      const selected = (await prompt.question(`Template (${names.join(", ")}) [${names[0]}]: `)) || names[0];
      if (!names.includes(selected)) throw new Error(`Unknown template: ${selected}`);
      source = join(templates, selected);
      hasDatabaseGenerator = await directoryExists(join(source, "turbo/generators"));
    }
    name ??= await prompt.question("Project name: ");
    if (database && !hasDatabaseGenerator) throw new Error("This template has no database generator");
    if (database === undefined && hasDatabaseGenerator) {
      const answer = await prompt.question("Add PostgreSQL and Drizzle ORM? [y/N]: ");
      database = /^(y|yes)$/i.test(answer.trim());
    }
  } finally {
    prompt.close();
  }

  const destination = await createProject(source, name);
  console.log(`Created ${destination}`);
  if (database) {
    try {
      await runPnpm(["install"], destination);
      await runPnpm(["turbo", "gen", "database", "--args", "true"], destination);
      await runPnpm(["install"], destination);
    } catch (error) {
      console.error(`Project remains at ${destination}. Complete setup there after fixing the error.`);
      throw error;
    }
    console.log(`Next: cd ${name} && cp .env.example .env && docker compose up -d`);
  } else {
    console.log(`Next: cd ${name} && pnpm install && pnpm dev`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
