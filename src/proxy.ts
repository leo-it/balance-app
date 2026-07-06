import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'
import { hasValidClerkKey, isAuthDevBypass } from '@/lib/auth'
import { DEV_SESSION_COOKIE, hasDevSessionCookie, isDevAuthAllowed } from '@/lib/dev-session'

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks(.*)',
  '/api/widget(.*)',
])

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url)
  if (request.nextUrl.pathname !== '/') {
    loginUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
  }
  return NextResponse.redirect(loginUrl)
}

export const proxy = hasValidClerkKey
  ? clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        if (
          isDevAuthAllowed() &&
          hasDevSessionCookie(request.cookies.get(DEV_SESSION_COOKIE)?.value)
        ) {
          return NextResponse.next()
        }
        await auth.protect()
      }
      return NextResponse.next()
    })
  : isAuthDevBypass
    ? () => NextResponse.next()
    : (request: NextRequest) => {
        if (isPublicRoute(request)) return NextResponse.next()
        if (hasDevSessionCookie(request.cookies.get(DEV_SESSION_COOKIE)?.value)) {
          return NextResponse.next()
        }
        return redirectToLogin(request)
      }

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|sw\\.js|workbox-.*\\.js|manifest\\.webmanifest|icons/.*|favicon\\.ico).*)',
  ],
}
