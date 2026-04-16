import { useEffect } from "react";

export function useFavicon(url: string) {
  useEffect(() => {
    if (!url) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    let created = false;

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.append(link);
      created = true;
    }

    const original = link.href;
    link.href = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;

    return () => {
      link.href = original || "/favicon.ico";
      if (created) link.remove();
    };
  }, [url]);
}
