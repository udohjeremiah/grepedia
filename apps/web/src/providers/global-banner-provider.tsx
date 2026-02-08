import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  OctagonAlertIcon,
  XIcon,
} from "lucide-react";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

import { globalBanner, GlobalBannerAction } from "@/utils/global-banner";

export type GlobalBanner = {
  autoDismiss?: boolean;
  autoDismissMs?: number;
  description: string;
  id: string;
  timestamp: Date;
  title: string;
  variant: GlobalBannerVariant;
};

export type GlobalBannerVariant = "critical" | "info" | "success" | "warning";

type GlobalBannerContextType = {
  banners: GlobalBanner[];
};

const GlobalBannerContext = createContext<GlobalBannerContextType | undefined>(
  undefined,
);

interface GlobalBannerProviderProps {
  children: ReactNode;
}

export function GlobalBannerProvider({ children }: GlobalBannerProviderProps) {
  const [banners, setBanners] = useState<GlobalBanner[]>([]);

  const addBanner = useCallback(
    (banner: Omit<GlobalBanner, "id" | "timestamp">) => {
      setBanners((previous) => {
        if (
          previous.some(
            (b) =>
              b.variant === banner.variant &&
              b.title === banner.title &&
              b.description === banner.description,
          )
        ) {
          return previous;
        }

        const newBanner = {
          autoDismiss: banner.autoDismiss ?? true,
          autoDismissMs: banner.autoDismissMs ?? 7000,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          ...banner,
        };

        return [...previous, newBanner];
      });
    },
    [],
  );

  const removeBanner = useCallback((id: string) => {
    setBanners((previous) => previous.filter((banner) => banner.id !== id));
  }, []);

  useEffect(() => {
    const listener = (action: GlobalBannerAction) => {
      if (action.type === "add") {
        addBanner(action.banner);
      } else if (action.type === "remove") {
        removeBanner(action.id);
      }
    };

    globalBanner.subscribe(listener);
    return () => globalBanner.unsubscribe(listener);
  }, [addBanner, removeBanner]);

  useEffect(() => {
    const timers: Record<string, ReturnType<typeof setTimeout>> = {};

    for (const banner of banners) {
      if (banner.autoDismiss && !timers[banner.id]) {
        timers[banner.id] = globalThis.setTimeout(() => {
          removeBanner(banner.id);
          delete timers[banner.id];
        }, banner.autoDismissMs ?? 7000);
      }
    }

    return () => {
      for (const timer of Object.values(timers)) {
        clearTimeout(timer);
      }
    };
  }, [banners, removeBanner]);

  const getIcon = (variant: GlobalBannerVariant) => {
    switch (variant) {
      case "critical": {
        return <OctagonAlertIcon />;
      }
      case "info": {
        return <InfoIcon />;
      }
      case "success": {
        return <CircleCheckIcon />;
      }
      case "warning": {
        return <CircleAlertIcon />;
      }
      default: {
        throw new Error("Invalid banner variant");
      }
    }
  };

  return (
    <GlobalBannerContext.Provider value={{ banners }}>
      {banners.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {banners.map((banner) => (
            <Alert
              className="rounded-none"
              key={banner.id}
              variant={banner.variant}
            >
              {getIcon(banner.variant)}
              <div>
                <AlertTitle className="sr-only">{banner.title}</AlertTitle>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={banner.timestamp.toISOString()}
                >
                  {new Intl.DateTimeFormat("default", {
                    hour: "2-digit",
                    hour12: false,
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(banner.timestamp)}
                </time>{" "}
                <AlertDescription>{banner.description}</AlertDescription>
              </div>
              <AlertAction>
                <Button
                  aria-label="Dismiss alert"
                  onClick={() => removeBanner(banner.id)}
                  size="icon-xs"
                  variant="ghost"
                >
                  <XIcon />
                </Button>
              </AlertAction>
            </Alert>
          ))}
        </div>
      )}
      {children}
    </GlobalBannerContext.Provider>
  );
}

export const useGlobalBanner = () => {
  const context = use(GlobalBannerContext);
  if (!context) {
    throw new Error(
      "useGlobalBanner must be used within a GlobalBannerProvider",
    );
  }
  return context;
};
