import { Button } from "@repo/ui/components/button";

import { useTheme } from "./theme-provider";

const themes = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Color theme">
      {themes.map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={theme === value ? "secondary" : "ghost"}
          aria-label={`${value} theme`}
          aria-pressed={theme === value}
          className="capitalize"
          onClick={() => setTheme(value)}
        >
          {value}
        </Button>
      ))}
    </div>
  );
}
