/**
 * Reads the environment and fails fast when something required is missing.
 *
 * Checked at module load rather than at first use, so a misconfigured build breaks immediately
 * with a named variable instead of surfacing later as an unexplained 401.
 */

/** Without these the app cannot address the API at all, so a missing one is fatal everywhere. */
const REQUIRED_ENV_VARS = ["VITE_SERVER_URL", "VITE_DOMAIN"]

/**
 * Cognito identifiers.
 *
 * Fatal in a production build, but only a warning in development: the app is usable before the
 * user pool is provisioned, and refusing to render would leave a blank page rather than the
 * sign-in screen that explains what is wrong.
 */
const REQUIRED_AUTH_ENV_VARS = ["VITE_AWS_COGNITO_USER_POOL_ID", "VITE_AWS_COGNITO_USER_POOL_CLIENT_ID"]

REQUIRED_ENV_VARS.forEach(envVar => {
  if (!import.meta.env[envVar as keyof ImportMetaEnv]) {
    throw new Error(`Missing required environment variable: ${envVar}. Copy .env.example to .env and fill it in.`)
  }
})

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
  /** API gateway origin, without a trailing slash. */
  serverUrl: String(import.meta.env.VITE_SERVER_URL).replace(/\/$/, ""),
  domain: String(import.meta.env.VITE_DOMAIN),
  cognito: {
    userPoolId: String(import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID ?? ""),
    userPoolClientId: String(import.meta.env.VITE_AWS_COGNITO_USER_POOL_CLIENT_ID ?? ""),
    region: String(import.meta.env.VITE_AWS_REGION ?? "ap-south-1")
  },
  /** False until a pool is provisioned. The sign-in screen uses this to explain itself. */
  isAuthConfigured: missingAuthVars.length === 0
} as const
