import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, X } from "lucide-react"
import { useTheme } from "next-themes"
import { createPortal } from "react-dom"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "../lib/utils"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Common classes for all toast types
  const commonClassName =
    "text-white! select-none! rounded-full! py-2.5! px-4! min-w-40! flex items-center justify-center [&_[data-description]]:text-white!"

  const toaster = (
    <Sonner
      position="bottom-center"
      theme={theme as ToasterProps["theme"]}
      expand={true}
      className="group z-9999 shadow-md"
      toastOptions={{
        duration: 5000,
        classNames: {
          error: cn("bg-red-500!", commonClassName),
          success: cn("bg-green-500!", commonClassName),
          info: cn("bg-blue-500!", commonClassName),
          warning: cn("bg-yellow-500!", commonClassName),
          loading: cn("bg-gray-500!", commonClassName)
        }
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <X className="size-4" />
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        } as React.CSSProperties
      }
      {...props}
    />
  )

  if (typeof document === "undefined") return toaster
  return createPortal(toaster, document.body)
}

export { Toaster }
