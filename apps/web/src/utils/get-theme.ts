import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export type Theme = "dark" | "light";

export const getTheme = createIsomorphicFn()
  .client(() => {
    const cookie = document.cookie;
    const match = cookie.match(/(?:^|;)\s*theme=(dark|light)/);
    return (match?.[1] as Theme) ?? "light";
  })
  .server(() => {
    const cookie = getRequestHeaders().get("cookie") ?? "";
    const match = cookie.match(/(?:^|;)\s*theme=(dark|light)/);
    return (match?.[1] as Theme) ?? "light";
  });
