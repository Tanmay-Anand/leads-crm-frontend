import { cn } from "@/shared/lib/utils"

function Skeleton({
  dark = false,
  loading,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  dark?: boolean
  className?: React.ComponentProps<"div">["className"]
  loading: boolean
  children?: React.ReactNode
}) {
  if (!loading) return <>{children}</>

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer bg-muted rounded-md bg-[linear-gradient(-90deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.45)_50%,rgba(255,255,255,0)_60%)] bg-size-[300%] [background-position-x:100%]",
        dark && "brightness-75",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
