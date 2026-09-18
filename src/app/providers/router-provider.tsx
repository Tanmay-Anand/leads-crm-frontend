import { useQueryClient } from "@tanstack/react-query"
import { createRouter, RouterProvider as TanstackRouterProvider } from "@tanstack/react-router"

import { Loader } from "@/shared/ui/loader"

import { routeTree } from "../../routeTree.gen"

import { useAuth } from "./auth-provider"

import type { AuthContextType } from "./auth-provider"
import type { QueryClient } from "@tanstack/react-query"

export interface RouterContext {
  auth: AuthContextType | undefined
  queryClient: QueryClient
}

export const router = createRouter({
  routeTree,
  context: {
    // Injected below, once the providers above the router have resolved.
    auth: undefined!,
    queryClient: undefined!
  } as RouterContext
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export default function RouterWithAuthContext() {
  const auth = useAuth()
  const queryClient = useQueryClient()

  // Held back until the session check resolves: rendering first would let the protected route
  // redirect a signed-in user to /signin for one frame.
  if (auth.loading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader type="page" />
      </div>
    )
  }

  return <TanstackRouterProvider router={router} context={{ auth, queryClient }} />
}
