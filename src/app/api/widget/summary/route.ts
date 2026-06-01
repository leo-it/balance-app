import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { hasValidClerkKey, isAuthDevBypass } from '@/lib/auth'
import { DEV_SESSION_COOKIE, hasDevSessionCookie } from '@/lib/dev-session'
import { assertDatabase } from '@/lib/env'
import { getBudgetState, getFixedExpenses, getMonthlySummary } from '@/lib/db'

async function resolveUserId(): Promise<string | null> {
  if (isAuthDevBypass) return 'dev-user'

  if (!hasValidClerkKey) {
    const cookieStore = await cookies()
    if (hasDevSessionCookie(cookieStore.get(DEV_SESSION_COOKIE)?.value)) {
      return 'dev-user'
    }
    return null
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  return userId
}

export async function GET(request: Request) {
  try {
    assertDatabase()

    const widgetKey = process.env.WIDGET_API_KEY
    const authHeader = request.headers.get('authorization')
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    let userId: string | null = null

    if (widgetKey && bearer === widgetKey) {
      const url = new URL(request.url)
      userId = url.searchParams.get('userId')
    } else {
      userId = await resolveUserId()
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [budget, summary, expenses] = await Promise.all([
      getBudgetState(userId),
      getMonthlySummary(userId),
      getFixedExpenses(userId),
    ])

    if (!budget || !summary) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const pendingFixedCount = expenses.filter((e) => e.status === 'pending').length
    const totalSpent = summary.fixedPaidTotal + summary.variableExpensesTotal

    return NextResponse.json({
      dailyAvailable: summary.dailyAvailable,
      spendableRemaining: summary.spendableRemaining,
      monthRemaining: summary.monthRemaining,
      totalSpent,
      savingsArs: budget.savings.arsCurrent,
      savingsUsd: budget.savings.usdCurrent,
      savingsEur: budget.savings.eurCurrent,
      pendingFixedCount,
      updatedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 },
    )
  }
}
