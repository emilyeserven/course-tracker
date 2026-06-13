import { cva } from "class-variance-authority";

const badgeVariants = cva(
  `
    inline-flex w-fit shrink-0 items-center gap-1 rounded-md border px-2 py-0.5
    text-xs font-medium whitespace-nowrap transition-colors
    focus-visible:border-ring focus-visible:ring-[3px]
    focus-visible:ring-ring/50
    [&>svg]:pointer-events-none [&>svg]:size-3
  `,
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export { badgeVariants };
