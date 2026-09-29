import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const oxfmt = join(dirname(fileURLToPath(import.meta.resolve("oxfmt/package.json"))), "bin/oxfmt");
const templates = join(root, "turbo/generators/templates");
const check = process.argv.includes("--check");
let failed = false;

for (const name of readdirSync(templates).filter((name) => /\.[cm]?[jt]sx?\.hbs$/.test(name))) {
  const path = join(templates, name);
  const source = readFileSync(path, "utf8");
  const result = spawnSync(process.execPath, [oxfmt, `--stdin-filepath=${name.slice(0, -4)}`], {
    cwd: root,
    input: source,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    console.error(`Could not format ${name}: ${result.stderr}`);
    failed = true;
  } else if (result.stdout !== source) {
    if (check) {
      console.error(`Generator template needs formatting: ${name}`);
      failed = true;
    } else {
      writeFileSync(path, result.stdout);
    }
  }
}

const generator = readFileSync(join(root, "turbo/generators/config.ts"), "utf8");
const starterApp = generator.match(/const starterApp = `([\s\S]*?)`;/)?.[1];
if (!starterApp || starterApp !== readFileSync(join(root, "apps/web/src/App.tsx"), "utf8").trim()) {
  console.error("Auth generator starterApp does not match apps/web/src/App.tsx");
  failed = true;
}

if (failed) process.exitCode = 1;
