import { cn } from "@/shared/lib/utils"

/**
 * Shared loading indicator.
 *
 * <p>The reference has a fourth variant that renders the product wordmark while the session
 * bootstraps. That one is branding rather than a pattern, so it is not reproduced here; the
 * full-page fallback uses the dots variant with a caption instead.
 */
export type LoaderProps = {
  type: "dots" | "falling-dots" | "page"
  size?: "base" | "xs" | "sm" | "md" | "lg" | "xl"
  dark?: boolean
  className?: string
  label?: string
}

export function Loader({ className, label, ...rest }: LoaderProps) {
  if (rest.type === "dots") {
    return (
      <div
        className={cn(
          "loader",
          rest.size !== "base" && `loader-${rest.size ?? "base"}`,
          !rest.dark && "light",
          className
        )}
      />
    )
  }

  if (rest.type === "falling-dots") {
    const sizeClassName = (() => {
      switch (rest.size) {
        case "xs":
          return "h-0.5 w-0.5"
        case "sm":
          return "h-1 w-1"
        case "md":
          return "h-2 w-2"
        case "lg":
          return "h-3 w-3"
        case "xl":
          return "h-4 w-4"
        default:
          return "h-1 w-1"
      }
    })()

    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <div className={cn("animate-falling rounded-full bg-current [animation-delay:0.3s]", sizeClassName)} />
        <div className={cn("animate-falling rounded-full bg-current [animation-delay:0.2s]", sizeClassName)} />
        <div className={cn("animate-falling rounded-full bg-current [animation-delay:0.1s]", sizeClassName)} />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("loader", !rest.dark && "light")} />
      <p className={cn("text-muted-foreground text-sm", rest.dark && "text-white")}>
        {label ?? "Setting things up..."}
      </p>
    </div>
  )
}
