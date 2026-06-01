export type WidgetMetricId =
  | 'dailyBudget'
  | 'spendableRemaining'
  | 'totalSpent'
  | 'monthRemaining'
  | 'savingsUsd'
  | 'savingsArs'
  | 'savingsEur'
  | 'recentMovements'

export const WIDGET_METRIC_OPTIONS: { id: WidgetMetricId; label: string; hint?: string }[] = [
  { id: 'spendableRemaining', label: 'Restante gastable', hint: 'Lo que podés gastar hoy en el mes' },
  { id: 'totalSpent', label: 'Gastos del mes', hint: 'Fijos pagados + variables' },
  { id: 'savingsUsd', label: 'Ahorro USD' },
  { id: 'dailyBudget', label: 'Disponible hoy', hint: 'Restante ÷ días del mes' },
  { id: 'monthRemaining', label: 'Restante del mes' },
  { id: 'savingsArs', label: 'Ahorro ARS' },
  { id: 'savingsEur', label: 'Ahorro EUR' },
  { id: 'recentMovements', label: 'Últimos movimientos' },
]

export const DEFAULT_WIDGET_METRICS: WidgetMetricId[] = [
  'spendableRemaining',
  'totalSpent',
  'savingsUsd',
]

export const WIDGET_METRICS_STORAGE_KEY = 'linkeweb_widget_metrics'

export function parseWidgetMetrics(raw: string | null): WidgetMetricId[] {
  if (!raw) return DEFAULT_WIDGET_METRICS
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return DEFAULT_WIDGET_METRICS
    const valid = new Set(WIDGET_METRIC_OPTIONS.map((o) => o.id))
    const filtered = parsed.filter(
      (id): id is WidgetMetricId => typeof id === 'string' && valid.has(id as WidgetMetricId),
    )
    return filtered.length > 0 ? filtered : DEFAULT_WIDGET_METRICS
  } catch {
    return DEFAULT_WIDGET_METRICS
  }
}
