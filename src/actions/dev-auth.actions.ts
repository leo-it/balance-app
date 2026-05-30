'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEV_SESSION_COOKIE, isDevAuthAllowed } from '@/lib/dev-session'

export async function signInAsDevUser(): Promise<void> {
  if (!isDevAuthAllowed()) {
    throw new Error('Forbidden')
  }

  const cookieStore = await cookies()
  cookieStore.set(DEV_SESSION_COOKIE, 'dev-user', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/')
}
