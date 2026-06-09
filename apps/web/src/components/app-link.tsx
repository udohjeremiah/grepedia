import { createLink, LinkComponent } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/cn";
import { AnchorHTMLAttributes } from "react";

const AppLinkComponent = ({
  children,
  className,
  ref,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: React.RefObject<HTMLAnchorElement | null>;
}) => {
  return (
    <Button asChild className={cn("size-fit p-0", className)} variant="link">
      <a ref={ref} {...props}>
        {children}
      </a>
    </Button>
  );
};

AppLinkComponent.displayName = "AppLinkComponent";

const CreatedLinkComponent = createLink(AppLinkComponent);

export const AppLink: LinkComponent<typeof AppLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};
