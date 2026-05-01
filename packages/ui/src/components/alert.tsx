import { cn } from "@workspace/ui/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const alertVariants = cva(
  "group/alert relative grid w-full gap-1 border bg-background px-4 py-3 text-start text-sm after:absolute after:-inset-y-px after:-start-px after:w-0.5 has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-card text-card-foreground after:bg-foreground",
        destructive:
          "bg-card text-destructive after:bg-destructive *:data-[slot=alert-description]:text-destructive/90",
        info: "bg-card text-info after:bg-info *:data-[slot=alert-description]:text-info/90",
        success:
          "bg-card text-success after:bg-success *:data-[slot=alert-description]:text-success/90",
        warning:
          "bg-card text-warning after:bg-warning *:data-[slot=alert-description]:text-warning/90",
      },
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute inset-e-3 top-2.5", className)}
      data-slot="alert-action"
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm font-semibold group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
