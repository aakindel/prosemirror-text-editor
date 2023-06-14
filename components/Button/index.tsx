// adapted from https://github.com/shadcn/ui/blob/main/apps/www/components/ui/button.tsx

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

const buttonVariants = cva(
  "rounded disabled:opacity-50 disabled:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "text-neutral-100 bg-neutral-700 hover:bg-neutral-600 dark:text-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-200",
        ghost:
          "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
        emphasis:
          "text-neutral-500 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-400 focus:outline-none focus-visible:bg-clip-border focus-visible:outline-neutral-700 focus-visible:dark:outline-neutral-200",
      },
      size: {
        default: "h-7 text-[14px] px-[8px] py-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
