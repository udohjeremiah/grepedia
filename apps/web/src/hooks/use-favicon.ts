import { useEffect } from "react";

export function useFavicon(url: string, defaultFavicon = "/favicon.ico") {
  useEffect(() => {
    const link =
      document.querySelector<HTMLLinkElement>("link[rel~='icon']") ??
      (() => {
        const element = document.createElement("link");
        element.rel = "icon";
        document.head.append(element);
        return element;
      })();

    const previousHref = link.href;

    if (url) {
      link.href = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
    }

    return () => {
      link.href = previousHref || defaultFavicon;
    };
  }, [defaultFavicon, url]);
}
