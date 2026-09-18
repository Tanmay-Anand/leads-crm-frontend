/** Query keys for the authorization domain, kept separate from authenticationKeys so refetching
 *  the Cognito session does not refetch /me, and vice versa. */
export const authorizationKeys = {
  all: ["authorization"] as const,
  me: () => [...authorizationKeys.all, "me"] as const
}
