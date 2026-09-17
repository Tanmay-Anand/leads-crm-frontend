/** Query keys for the auth domain, kept in one place so invalidation cannot drift from the reads. */
export const authenticationKeys = {
  all: ["authentication"] as const,
  state: () => [...authenticationKeys.all, "state"] as const
}
