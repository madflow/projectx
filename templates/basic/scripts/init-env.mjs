import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

let example;
try {
  example = readFileSync(".env.example", "utf8");
} catch {
  console.error("Cannot read .env.example. Run the database and auth generators first.");
  process.exit(1);
}

const placeholder = /^BETTER_AUTH_SECRET=$/gm;
if ([...example.matchAll(placeholder)].length !== 1) {
  console.error(
    "Expected one empty BETTER_AUTH_SECRET in .env.example. Run the auth generator before `pnpm env:init`.",
  );
  process.exit(1);
}

const env = example.replace(
  placeholder,
  `BETTER_AUTH_SECRET=${randomBytes(48).toString("base64url")}`,
);
try {
  writeFileSync(".env", env, { flag: "wx", mode: 0o600 });
} catch (error) {
  if (error.code === "EEXIST") {
    console.error(".env already exists; left it unchanged. Verify its settings before continuing.");
  } else {
    console.error("Could not create .env. Stop here; do not bypass an access restriction.");
  }
  process.exit(1);
}

console.log("Created .env with a random BETTER_AUTH_SECRET using the .env.example settings.");
