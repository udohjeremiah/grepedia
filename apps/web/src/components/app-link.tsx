import { createLink, LinkComponent } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/cn";
import { AnchorHTMLAttributes, forwardRef } from "react";

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

const AppLinkComponent = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button asChild className={cn("size-fit p-0", className)} variant="link">
        <a ref={ref} {...props} />
      </Button>
    );
  },
);

AppLinkComponent.displayName = "AppLinkComponent";

const CreatedLinkComponent = createLink(AppLinkComponent);

export const AppLink: LinkComponent<typeof AppLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};
