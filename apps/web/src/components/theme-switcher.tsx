import { cn } from "@workspace/ui/utils/cn";
import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";

export default function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      aria-checked={isDark}
      aria-label="Toggle theme"
      className="not-transition-lock relative h-5.5 w-10.5 shrink-0 rounded-full bg-muted transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
    >
      <span
        className={cn(
          "absolute top-0 left-0 flex size-full items-center transition-transform duration-250",
          isDark ? "translate-x-5" : "translate-x-0",
        )}
      >
        <span className="relative flex size-5 items-center justify-center rounded-full bg-background shadow-sm">
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
