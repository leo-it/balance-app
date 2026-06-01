import type { CapacitorConfig } from '@capacitor/cli'

const defaultServerUrl = 'https://balance-app-git-main-leoits-projects.vercel.app'
const serverUrl = process.env.CAPACITOR_SERVER_URL ?? defaultServerUrl

const config: CapacitorConfig = {
  appId: 'com.leoit.balanceapp',
  appName: 'Balance App',
  webDir: 'out',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
