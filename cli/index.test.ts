import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createProject } from "./index.ts";

test("copies a local template, renames it, and excludes generated files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "turbo-starters-"));
  try {
    const source = join(dir, "source");
    await mkdir(join(source, "node_modules"), { recursive: true });
    await writeFile(join(source, "package.json"), '{"name":"old"}\n');
    await writeFile(join(source, ".gitignore"), "node_modules\n");
    await writeFile(join(source, "node_modules", "ignored"), "unused");

    const target = await createProject(source, "new-project", dir);
    assert.equal(JSON.parse(await readFile(join(target, "package.json"), "utf8")).name, "new-project");
    assert.equal(await readFile(join(target, ".gitignore"), "utf8"), "node_modules\n");
    await assert.rejects(readFile(join(target, "node_modules", "ignored")));
    await assert.rejects(createProject(source, "new-project", dir), /already exists/);
    await assert.rejects(createProject(source, "../outside", dir), /Project name/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("--no-database copies without installing or prompting", async () => {
  const dir = await mkdtemp(join(tmpdir(), "turbo-starters-"));
  try {
    const source = join(dir, "source");
    await mkdir(source);
    await writeFile(join(source, "package.json"), '{"name":"old"}\n');
    const cli = fileURLToPath(new URL("./index.ts", import.meta.url));
    const result = spawnSync(
      process.execPath,
      [cli, "--template-path", source, "--no-database", "new-project"],
      { cwd: dir, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /pnpm install/);
    await assert.rejects(readFile(join(dir, "new-project", "compose.yaml")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("asks about the database when the template has a generator", async () => {
  const dir = await mkdtemp(join(tmpdir(), "turbo-starters-"));
  try {
    const source = join(dir, "source");
    await mkdir(join(source, "turbo", "generators"), { recursive: true });
    await writeFile(join(source, "package.json"), '{"name":"old"}\n');
    const cli = fileURLToPath(new URL("./index.ts", import.meta.url));
    const result = spawnSync(process.execPath, [cli, "--template-path", source, "new-project"], {
      cwd: dir,
      encoding: "utf8",
      input: "n\n",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Add PostgreSQL and Drizzle ORM\?/);
    assert.match(result.stdout, /pnpm install/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
