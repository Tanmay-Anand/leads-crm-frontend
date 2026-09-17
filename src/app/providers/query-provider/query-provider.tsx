import type React from "react"

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { handleErrorToast } from "@/shared/lib/utils"

/**
 * One place that reports a failed write.
 *
 * Mutations toast centrally so no screen has to remember to; reads do not, because a failed read
 * has a place to render its own empty or error state and a toast on top of that is noise.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  },
  mutationCache: new MutationCache({
    onError: error => handleErrorToast(error)
  })
})

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export { queryClient }
