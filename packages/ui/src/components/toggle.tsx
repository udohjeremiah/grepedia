import { cn } from "@workspace/ui/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import * as React from "react";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1.5 rounded-none text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-10 min-w-10 px-6 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        lg: "h-11 min-w-11 px-8 has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
        sm: "h-9 min-w-9 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
      },
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
      },
    },
  },
);

function Toggle({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ className, size, variant }))}
      data-slot="toggle"
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
