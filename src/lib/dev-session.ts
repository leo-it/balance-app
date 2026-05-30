export const DEV_SESSION_COOKIE = 'linkeweb_dev_session'

export function isDevAuthAllowed(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function hasDevSessionCookie(value: string | undefined): boolean {
  return isDevAuthAllowed() && value === 'dev-user'
}
