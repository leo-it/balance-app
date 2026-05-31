export const hasValidClerkKey =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder'

import { DEV_SESSION_COOKIE, hasDevSessionCookie, isDevAuthAllowed } from '@/lib/dev-session'

export const isAuthDevBypass =
  process.env.AUTH_DEV_BYPASS === 'true' && !hasValidClerkKey

export async function hasDevSession(): Promise<boolean> {
  if (isAuthDevBypass) return true
  if (!isDevAuthAllowed()) return false

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return hasDevSessionCookie(cookieStore.get(DEV_SESSION_COOKIE)?.value)
}

export async function getUserId(): Promise<string> {
  if (await hasDevSession()) return 'dev-user'
  if (!hasValidClerkKey) throw new Error('Unauthorized')

  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function getCurrentUserInfo(): Promise<{ firstName: string; initial: string }> {
  if (await hasDevSession()) return { firstName: 'Dev', initial: 'D' }
  if (!hasValidClerkKey) throw new Error('Unauthorized')

  const { currentUser } = await import('@clerk/nextjs/server')
  const user = await currentUser()
  const firstName = resolveFirstName(user?.firstName, user?.fullName)
  return {
    firstName,
    initial: firstName[0]?.toUpperCase() ?? 'U',
  }
}

function resolveFirstName(first: string | null | undefined, full: string | null | undefined): string {
  const trimmed = first?.trim()
  if (trimmed) return trimmed.split(/\s+/)[0] ?? trimmed
  const fromFull = full?.trim().split(/\s+/)[0]
  return fromFull || 'Usuario'
}
