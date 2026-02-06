import type { GlobalBanner } from "@/providers/global-banner-provider";

export type GlobalBannerAction =
  | { type: "add"; banner: Omit<GlobalBanner, "id" | "timestamp"> }
  | { type: "remove"; id: string };

type Listener = (action: GlobalBannerAction) => void;

let listeners: Listener[] = [];

export const globalBanner = {
  emit: (action: GlobalBannerAction) => {
    switch (action.type) {
      case "add": {
        const id = crypto.randomUUID();
        const timestamp = new Date();
        const fullBanner: GlobalBanner = { id, timestamp, ...action.banner };

        listeners.forEach((listener) =>
          listener({ type: "add", banner: fullBanner }),
        );

        return id;
      }

      case "remove": {
        listeners.forEach((listener) =>
          listener({ type: "remove", id: action.id }),
        );
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
