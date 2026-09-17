import * as React from "react"

import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/shared/lib/utils"

function Label({
  className,
  children,
  required,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-muted-foreground text-2xs flex items-center gap-1.5 font-semibold tracking-[0.04em] select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {required ? <span className="text-destructive mx-0.5">*</span> : null}
    </LabelPrimitive.Root>
  )
}

export { Label }
