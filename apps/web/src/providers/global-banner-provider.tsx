import { globalBanner, GlobalBannerAction } from "@/utils/global-banner";
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

export type GlobalBannerVariant = "info" | "success" | "warning" | "critical";

export type GlobalBanner = {
  id: string;
  variant: GlobalBannerVariant;
  title: string;
  description: string;
  timestamp: Date;
  autoDismiss?: boolean;
  autoDismissMs?: number;
};

type GlobalBannerContextType = {
  banners: GlobalBanner[];
};

const GlobalBannerContext = createContext<GlobalBannerContextType | null>(null);

interface GlobalBannerProviderProps {
  children: ReactNode;
}

export function GlobalBannerProvider({ children }: GlobalBannerProviderProps) {
  const [banners, setBanners] = useState<GlobalBanner[]>([]);

  const addBanner = useCallback(
    (banner: Omit<GlobalBanner, "id" | "timestamp">) => {
      setBanners((prev) => {
        if (
          prev.some(
            (b) =>
              b.variant === banner.variant &&
              b.title === banner.title &&
              b.description === banner.description,
          )
        ) {
          return prev;
        }

        const newBanner = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          autoDismiss: banner.autoDismiss ?? true,
          autoDismissMs: banner.autoDismissMs ?? 7000,
          ...banner,
        };

        return [...prev, newBanner];
      });
    },
    [],
  );

  const removeBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
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
    const timers: Record<string, number> = {};

    banners.forEach((banner) => {
      if (banner.autoDismiss && !timers[banner.id]) {
        timers[banner.id] = window.setTimeout(() => {
          removeBanner(banner.id);
          delete timers[banner.id];
        }, banner.autoDismissMs ?? 7000);
      }
    });

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, [banners, removeBanner]);

  const getIcon = (variant: GlobalBannerVariant) => {
    switch (variant) {
      case "info":
        return <InfoIcon />;
      case "success":
        return <CircleCheckIcon />;
      case "warning":
        return <CircleAlertIcon />;
      case "critical":
        return <OctagonAlertIcon />;
      default:
        return null;
    }
  };

  return (
    <GlobalBannerContext.Provider value={{ banners }}>
      {banners.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {banners.map((banner) => (
            <Alert
              key={banner.id}
              variant={banner.variant}
              className="rounded-none"
            >
              {getIcon(banner.variant)}
              <div>
                <AlertTitle className="sr-only">{banner.title}</AlertTitle>
                <time
                  dateTime={banner.timestamp.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {new Intl.DateTimeFormat("default", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  }).format(banner.timestamp)}
                </time>{" "}
                <AlertDescription>{banner.description}</AlertDescription>
              </div>
              <AlertAction>
                <Button
                  aria-label="Dismiss alert"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeBanner(banner.id)}
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
