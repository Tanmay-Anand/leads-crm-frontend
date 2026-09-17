/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string
  readonly VITE_DOMAIN: string
  readonly VITE_AWS_COGNITO_USER_POOL_ID: string
  readonly VITE_AWS_COGNITO_USER_POOL_CLIENT_ID: string
  readonly VITE_AWS_REGION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
