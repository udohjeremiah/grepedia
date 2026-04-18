import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = () => {
  return false;
};

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (globalThis.window === undefined || !globalThis.matchMedia) {
        return () => {};
      }

      const mediaQueryList = globalThis.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);

      return () => {
        mediaQueryList.removeEventListener("change", callback);
      };
    },
    [query],
  );

  const getSnapshot = () => {
    if (globalThis.window === undefined || !globalThis.matchMedia) {
      return false;
    }

    return globalThis.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
