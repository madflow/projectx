import { useTheme } from "./theme-provider";

const themes = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex gap-1 rounded-lg border border-border bg-card p-1"
      aria-label="Color theme"
    >
      {themes.map((value) => (
        <button
          key={value}
          type="button"
          aria-label={`${value} theme`}
          aria-pressed={theme === value}
          className="rounded-md px-2 py-1 text-xs capitalize text-muted-foreground hover:bg-muted aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          onClick={() => setTheme(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
