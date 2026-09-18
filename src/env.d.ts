/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override. Empty means same-origin, which is the normal case. */
  readonly VITE_SERVER_URL?: string
  readonly VITE_AWS_COGNITO_USER_POOL_ID: string
  readonly VITE_AWS_COGNITO_USER_POOL_CLIENT_ID: string
  readonly VITE_AWS_REGION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
