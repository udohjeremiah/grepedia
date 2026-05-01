import { cn } from "@workspace/ui/lib/cn";
import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      aria-checked={isDark}
      aria-label="Toggle theme"
      className="not-transition-lock relative h-6 w-11 shrink-0 bg-muted p-0.5"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
    >
      <span
        className={cn(
          "flex h-full w-fit items-center transition-transform duration-250",
          isDark ? "translate-x-full" : "translate-x-0",
        )}
      >
        <span className="relative flex size-5 items-center justify-center bg-background shadow-sm">
          <SunIcon
            className={cn(
              "absolute size-3 transition-all duration-250",
              isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 opacity-100",
            )}
          />
          <MoonIcon
            className={cn(
              "absolute size-3 transition-all duration-250",
              isDark ? "scale-100 opacity-100" : "scale-0 -rotate-90 opacity-0",
            )}
          />
        </span>
      </span>
    </button>
  );
}
