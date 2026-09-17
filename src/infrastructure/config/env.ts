/**
 * Reads the environment and fails fast when something required is missing.
 *
 * Checked at module load rather than at first use, so a misconfigured build breaks immediately
 * with a named variable instead of surfacing later as an unexplained 401.
 */

/**
 * Cognito identifiers.
 *
 * Fatal in a production build, but only a warning in development: the app is usable before the
 * user pool is provisioned, and refusing to render would leave a blank page rather than the
 * sign-in screen that explains what is wrong.
 */
const REQUIRED_AUTH_ENV_VARS = ["VITE_AWS_COGNITO_USER_POOL_ID", "VITE_AWS_COGNITO_USER_POOL_CLIENT_ID"]

const missingAuthVars = REQUIRED_AUTH_ENV_VARS.filter(
  envVar => !import.meta.env[envVar as keyof ImportMetaEnv]
)

if (missingAuthVars.length > 0) {
  const message = `Cognito is not configured: ${missingAuthVars.join(", ")}. Sign-in will not work.`
  if (import.meta.env.PROD) {
    throw new Error(message)
  }
  console.warn(`[env] ${message}`)
}

export const env = {
  /**
   * Origin to prefix API calls with. Empty means same-origin, which is the normal case.
   *
   * In production the API is reached through a rewrite on the hosting platform, so the browser
   * talks to its own origin and the edge forwards to the backend. In development the Vite dev
   * server proxies the same path. Either way a relative URL is correct, and — more to the point —
   * it cannot be wrong: it always matches whatever domain is serving the page. Hard-coding the
   * deployment URL here is how three separate deploys broke.
   *
   * Set VITE_SERVER_URL only to point at a backend somewhere else, such as a colleague's machine
   * or a staging box. It is an override, not a requirement.
   */
  serverUrl: (import.meta.env.VITE_SERVER_URL ?? "").replace(/\/$/, ""),
  cognito: {
    userPoolId: String(import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID ?? ""),
    userPoolClientId: String(import.meta.env.VITE_AWS_COGNITO_USER_POOL_CLIENT_ID ?? ""),
    region: String(import.meta.env.VITE_AWS_REGION ?? "ap-south-1")
  },
  /** False until a pool is provisioned. The sign-in screen uses this to explain itself. */
  isAuthConfigured: missingAuthVars.length === 0
} as const
