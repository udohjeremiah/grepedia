import { ScriptOnce } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { z } from "zod";

// eslint-disable-next-line unicorn/prefer-top-level-await
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
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

const applyTheme = createClientOnlyFn((resolvedTheme: Theme) => {
  const root = document.documentElement;
  root.dataset["theme"] = resolvedTheme;
  root.dataset["colorMode"] = resolvedTheme;
});

const handleThemeChange = createClientOnlyFn((theme: Theme) => {
  const validated = ThemeSchema.parse(theme);
  const resolved = resolveTheme(validated);
  applyTheme(resolved);
});

const setupPreferredListener = createClientOnlyFn(() => {
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handler = () => handleThemeChange("system");
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
});

const themeFunction = (storageKey: string) => {
  const prefersDark = globalThis.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const resolvedByPreference = prefersDark ? "dark" : "light";
  const root = document.documentElement;

  try {
    const stored = localStorage.getItem(storageKey) || "system";
    const theme = ["dark", "light"].includes(stored) ? stored : "system";
    const resolved = theme === "system" ? resolvedByPreference : theme;

    root.dataset["theme"] = resolved;
    root.dataset["colorMode"] = resolved;
  } catch {
    const resolved = resolvedByPreference;
    root.dataset["theme"] = resolved;
    root.dataset["colorMode"] = resolved;
  }
};

const themeScript = (storageKey: string) => {
  return `(${themeFunction.toString()})(${JSON.stringify(storageKey)});`;
};

type ThemeContextType = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  storageKey = "theme",
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

  return (
    <ThemeContext.Provider value={{ setTheme, theme: userTheme }}>
      <ScriptOnce>{themeScript(storageKey)}</ScriptOnce>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
