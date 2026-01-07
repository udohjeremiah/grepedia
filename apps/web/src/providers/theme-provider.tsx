import { ScriptOnce } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { z } from "zod";

const ThemeSchema = z.enum(["light", "dark", "system"]).catch("system");
export type Theme = z.infer<typeof ThemeSchema>;

const getStoredTheme = createIsomorphicFn()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .server((_storageKey: string): Theme => "system")
  .client((storageKey: string): Theme => {
    const stored = localStorage.getItem(storageKey);
    return ThemeSchema.parse(stored);
  });

const setStoredTheme = createClientOnlyFn(
  (storageKey: string, theme: Theme) => {
    localStorage.setItem(storageKey, ThemeSchema.parse(theme));
  },
);

const resolveTheme = createIsomorphicFn()
  .server((theme: Theme): Theme => (theme === "system" ? "light" : theme))
  .client((theme: Theme): Theme => {
    if (theme !== "system") return theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

const applyTheme = createClientOnlyFn((resolvedTheme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
});

const handleThemeChange = createClientOnlyFn((theme: Theme) => {
  const validated = ThemeSchema.parse(theme);
  const resolved = resolveTheme(validated);
  applyTheme(resolved);
});

const setupPreferredListener = createClientOnlyFn(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => handleThemeChange("system");
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
});

const themeScript = (storageKey: string) => {
  function themeFn(storageKey: string) {
    try {
      const stored = localStorage.getItem(storageKey) || "system";
      const theme = ["light", "dark"].includes(stored) ? stored : "system";

      const resolved =
        theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : theme === "system"
            ? "light"
            : theme;

      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    } catch {
      const root = document.documentElement;
      const resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(resolved);
    }
  }

  return `(${themeFn.toString()})(${JSON.stringify(storageKey)});`;
};

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

interface ThemeProviderProps {
  storageKey?: string;
  children: ReactNode;
}

export function ThemeProvider({
  storageKey = "ui-theme",
  children,
}: ThemeProviderProps) {
  const [userTheme, setUserTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = getStoredTheme(storageKey);
    setUserTheme(stored);
    handleThemeChange(stored);

    if (stored === "system") setupPreferredListener();
  }, [storageKey]);

  const setTheme = (newTheme: Theme) => {
    const validated = ThemeSchema.parse(newTheme);
    setUserTheme(validated);
    setStoredTheme(storageKey, validated);
    handleThemeChange(validated);
  };

  const theme = resolveTheme(userTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ScriptOnce>{themeScript(storageKey)}</ScriptOnce>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => use(ThemeContext);
