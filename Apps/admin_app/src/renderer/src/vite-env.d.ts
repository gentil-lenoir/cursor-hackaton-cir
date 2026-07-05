export {}

declare global {
  interface Window {
    electron: {
      platform: NodeJS.Platform
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
