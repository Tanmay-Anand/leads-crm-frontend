import { Amplify } from "aws-amplify"

import { env } from "@/infrastructure/config/env"

/**
 * Configures Amplify against the Cognito user pool.
 *
 * Imported once from main.tsx, before anything can call fetchAuthSession. The app client must be a
 * public client with no secret, since a browser cannot keep one.
 */
export const configureAmplify = () => {
  // Skipped entirely when no pool is configured: Amplify rejects an empty userPoolId at configure
  // time, which would take down the whole app rather than just sign-in.
  if (!env.isAuthConfigured) return

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: env.cognito.userPoolId,
        userPoolClientId: env.cognito.userPoolClientId
      }
    }
  })
}
