import { createClientOnlyFn } from "@tanstack/react-start";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getTheme, type Theme } from "@/utils/get-theme";

type ThemeContextType = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const disableTransitions = createClientOnlyFn(() => {
  const css = document.createElement("style");
  css.textContent = `
    *:not(.not-transition-lock):not(.not-transition-lock *),
    *:not(.not-transition-lock)::before,
    *:not(.not-transition-lock)::after {
      transition: none !important;
    }
  `;
  document.head.append(css);

  return () => {
    (() => globalThis.getComputedStyle(document.body))();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        css.remove();
      });
    });
  };
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getTheme());

  const setTheme = useCallback((newTheme: Theme) => {
    const enable = disableTransitions();
    setThemeState(newTheme);
    document.documentElement.dataset["theme"] = newTheme;
    // eslint-disable-next-line unicorn/no-document-cookie
    document.cookie = `theme=${newTheme}; path=/; max-age=${365 * 24 * 60 * 60}`;
    enable?.();
  }, []);

  useEffect(() => {
    const media = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
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
