/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOMBA_ENV: 'sandbox' | 'production'
  readonly VITE_NOMBA_CLIENT_ID: string
  readonly VITE_NOMBA_CLIENT_SECRET: string
  readonly VITE_NOMBA_ACCOUNT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
