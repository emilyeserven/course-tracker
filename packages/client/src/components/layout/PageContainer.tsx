import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Width-constraining page-body wrapper: centers content horizontally at the
 * app's max content width. Replaces the old `container` CSS utility (which also
 * bundled `flex`); pages add their own `flex flex-col gap-N` as needed.
 */
function PageContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-container"
      className={cn("mx-auto w-full max-w-[1200px] px-4", className)}
      {...props}
    />
  );
}

export { PageContainer };
