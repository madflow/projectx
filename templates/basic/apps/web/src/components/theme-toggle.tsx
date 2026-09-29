import { Menu } from "@base-ui/react/menu";
import { Button } from "@repo/ui/components/button";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "./theme-provider";

const themes = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const CurrentIcon = themes.find((option) => option.value === theme)?.Icon ?? MonitorIcon;

  return (
    <Menu.Root>
      <Menu.Trigger
        render={<Button type="button" variant="outline" size="icon" aria-label="Choose theme" />}
      >
        <CurrentIcon aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="z-50" align="start" sideOffset={6}>
          <Menu.Popup
            aria-label="Theme"
            className="min-w-36 border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"
          >
            <Menu.RadioGroup value={theme} onValueChange={setTheme}>
              {themes.map(({ value, label, Icon }) => (
                <Menu.RadioItem
                  key={value}
                  value={value}
                  closeOnClick
                  className="flex cursor-default items-center gap-2 px-2 py-1.5 text-xs outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                  <Menu.RadioItemIndicator className="ml-auto">
                    <CheckIcon aria-hidden="true" className="size-4" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
