export interface ElectronAPI {
  getAppVersion: () => string
  getPlatform: () => NodeJS.Platform
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
