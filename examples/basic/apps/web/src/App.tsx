import { useState } from "react";
import { Button } from "@repo/ui/button";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Vite + React + TypeScript</h1>
      <p>
        Edit <code>apps/web/src/App.tsx</code> and save to see your changes.
      </p>
      <button onClick={() => setCount((value) => value + 1)}>Count is {count}</button>
      <Button appName="web">Open alert from @repo/ui</Button>
    </main>
  );
}
