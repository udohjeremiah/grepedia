import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { format } from "date-fns";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  OctagonAlertIcon,
  XIcon,
} from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  type GlobalBanner,
  globalBannerStore,
} from "@/lib/global-banner-store";

const getIcon = (variant: GlobalBanner["variant"]) => {
  switch (variant) {
    case "destructive": {
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

export default function GlobalBanner() {
  const banners = useSyncExternalStore(
    globalBannerStore.subscribe,
    getBanners,
    getBanners,
  );

  if (banners.length === 0) return;

  return (
    <div className="sticky top-0 z-60 flex w-full flex-col bg-background">
      {banners.map((banner) => (
        <Alert key={banner.id} variant={banner.variant}>
          {getIcon(banner.variant)}
          <AlertTitle className="sr-only">{banner.title}</AlertTitle>
          <AlertDescription>
            <time dateTime={banner.timestamp.toISOString()}>
              {format(banner.timestamp, "HH:mm:ss")}
            </time>{" "}
            {banner.description}
          </AlertDescription>
          <AlertAction>
            <Button
              aria-label="Dismiss alert"
              onClick={() => globalBannerStore.remove(banner.id)}
              size="icon-xs"
              variant="ghost"
            >
              <XIcon />
            </Button>
          </AlertAction>
        </Alert>
      ))}
    </div>
  );
}

function getBanners() {
  return globalBannerStore.getState().banners;
}
