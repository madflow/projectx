# Web

A Vite app using React and TypeScript, with a component from `@repo/ui`.

From the repository root, run `pnpm dev` and open http://localhost:5173.

Run `pnpm build` to create a production build in `apps/web/dist`, or `pnpm --filter web preview` to preview it.

## Component testing

`src/App.test.tsx` renders the app in a real Chromium browser using Vitest Browser Mode and checks that clicking the counter updates its label.

Install Chromium once with `pnpm --filter web exec playwright install chromium`, then run `pnpm --filter web test` for a single run or `pnpm --filter web test:watch` while developing.
