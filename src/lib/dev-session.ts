import { APP_STORAGE_PREFIX } from '@/lib/app-config'

export const DEV_SESSION_COOKIE = `${APP_STORAGE_PREFIX}_dev_session`

export function isDevAuthAllowed(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function hasDevSessionCookie(value: string | undefined): boolean {
  return isDevAuthAllowed() && value === 'dev-user'
}
