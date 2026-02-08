import type { GlobalBanner } from "@/providers/global-banner-provider";

export type GlobalBannerAction =
  | { banner: Omit<GlobalBanner, "id" | "timestamp">; type: "add" }
  | { id: string; type: "remove" };

type Listener = (action: GlobalBannerAction) => void;

let listeners: Listener[] = [];

export const globalBanner = {
  emit: (action: GlobalBannerAction) => {
    switch (action.type) {
      case "add": {
        const id = crypto.randomUUID();
        const timestamp = new Date();
        const fullBanner: GlobalBanner = { id, timestamp, ...action.banner };

        for (const listener of listeners) {
          listener({ banner: fullBanner, type: "add" });
        }

        return id;
      }

      case "remove": {
        for (const listener of listeners) {
          listener({ id: action.id, type: "remove" });
        }

        return;
      }

      default: {
        throw new Error("Invalid action type");
      }
    }
  },

  subscribe: (listener: Listener) => {
    listeners.push(listener);
  },

  unsubscribe: (listener: Listener) => {
    listeners = listeners.filter((l) => l !== listener);
  },
};
