import type React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Light and dark theming.
 *
 * class attribute rather than data-theme, because the Tailwind theme in index.css defines its dark
 * palette under a .dark class.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
