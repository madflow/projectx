import { Button } from "@repo/ui/components/button";
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
}
