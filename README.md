# Linkeweb — PWA Gestor de Gastos Inteligente

PWA mobile-first para gestión de gastos y ahorros con automatizaciones via n8n, construida sobre Next.js 16 con arquitectura limpia y dark mode estricto.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2 | Framework (App Router, Turbopack) |
| React | 19.2 | UI (`useOptimistic`, `useActionState`, `useTransition`) |
| TypeScript | 5 (strict) | Tipado |
| Tailwind CSS | v4 | Estilos (config CSS-first, sin `tailwind.config.ts`) |
| shadcn/ui | latest | Componentes base (zinc) |
| Lucide React | latest | Íconos |
| Clerk | latest | Auth (nativo Next.js 16, `proxy.ts`) |
| Supabase | latest | Base de datos PostgreSQL |
| motion/react | 12 | Animaciones y microinteracciones |
| Serwist | 9 | Service Worker (PWA offline) |
| n8n | — | Automatizaciones via webhooks (dual-write) |

> **Next.js 16:** `middleware.ts` fue reemplazado por `proxy.ts`. Todos los `params`, `cookies` y `headers` son asíncronos. Tailwind v4 no usa `tailwind.config.ts`; la configuración va en `globals.css` con `@theme`.

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# → Completar con keys de Clerk y Supabase

# 3. Conectar Supabase (ver sección abajo)

# 4. Levantar en desarrollo
npm run dev
```

Supabase es **obligatorio**: la app lee y escribe en PostgreSQL. Sin keys válidas en `.env.local` no arranca el dashboard.

### Conectar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com) → **Project Settings → API**
2. Copiar en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role (solo servidor, nunca en el browser)
3. En **SQL Editor**, ejecutar **todo** el archivo `db/setup.sql` (un solo Run)
4. (Opcional) Seed manual: `db/seed.sql` — cambiar `dev-user` por tu Clerk `userId` si usás auth real
5. Reiniciar `npm run dev`

En el **primer acceso**, la app crea una fila de `budget_state` en ceros. Para datos de ejemplo, ejecutá `db/seed.sql` en el SQL Editor.

---

## Variables de entorno

```env
# Clerk — https://dashboard.clerk.com (sin esto, / redirige a /login)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
# Solo dev local sin Clerk: AUTH_DEV_BYPASS=true
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase — solo DB (auth via Clerk)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # obligatorio en servidor

# n8n — opcional, si no se configura los actions ignoran el webhook
N8N_WEBHOOK_URL=https://your-n8n.app/webhook/xxxxx
N8N_WEBHOOK_SECRET=your-secret-here
```

---

## Estructura de archivos

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/[[...rest]]/page.tsx   # Clerk SignIn (catch-all route)
│   ├── (dashboard)/
│   │   └── page.tsx                     # Dashboard principal (RSC shell)
│   ├── layout.tsx                       # Root layout + ClerkProvider
│   ├── globals.css                      # Tailwind v4: @import + @theme (paleta zinc)
│   ├── manifest.ts                      # PWA manifest (MetadataRoute)
│   └── sw.ts                            # Service Worker (Serwist)
├── components/
│   ├── ui/                              # shadcn/ui (Button, Card, Badge, Progress)
│   ├── metrics/
│   │   ├── MetricsHeader.tsx            # RSC wrapper de las 3 tarjetas
│   │   ├── DailyBudgetWidget.tsx        # Client: motion animate() en número
│   │   ├── SavingsProgressWidget.tsx    # Client: barra de progreso animada
│   │   └── DeviationAlertBadge.tsx      # Client: badge verde/amarillo/rojo
│   ├── expenses/
│   │   ├── FixedExpenseList.tsx         # Client: useOptimistic + useTransition
│   │   └── FixedExpenseCard.tsx         # Card con motion whileTap + Pending/Paid
│   └── movements/
│       ├── MovementFeed.tsx             # RSC: lista de movimientos
│       └── MovementItem.tsx             # Item con ícono + monto SSR-safe
├── actions/
│   ├── expense.actions.ts               # "use server" — dual-write: Supabase + n8n
│   └── movement.actions.ts             # "use server" — dual-write: Supabase + n8n
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # createBrowserClient
│   │   └── server.ts                    # createServerClient (async cookies)
│   ├── n8n.ts                           # sendToN8n(payload) helper
│   ├── formatters.ts                    # Intl wrappers SSR-safe (locale explícito)
│   └── utils.ts                         # cn() para clsx + tailwind-merge
├── types/
│   ├── budget.ts                        # BudgetState, DeviationStatus
│   ├── expense.ts                       # FixedExpense, ExpenseStatus
│   └── movement.ts                      # Movement, MovementType
└── proxy.ts                             # Next.js 16: clerkMiddleware() → /login
supabase/
└── migrations/
    └── 001_initial_schema.sql           # Tablas: budget_state, fixed_expenses, movements
```

---

## Flujo de datos

```
RSC (servidor)          Client Components         Server Actions
─────────────           ─────────────────         ──────────────
(dashboard)/page.tsx
  ├─ MetricsHeader       DailyBudgetWidget
  ├─ FixedExpenseList ──► useOptimistic ──────────► markAsPaid()
  │                        useTransition              ├─ Supabase UPDATE  ← Promise.all
  └─ MovementFeed                                     ├─ n8n webhook      ← simultáneo
                                                      └─ revalidatePath('/')
```

### Patrón optimista (React 19)

```typescript
// useOptimistic actualiza la UI antes de que el servidor responda
const [optimisticExpenses, applyOptimistic] = useOptimistic(
  expenses,
  (state, update: { id: string; status: ExpenseStatus }) =>
    state.map(e => e.id === update.id ? { ...e, ...update } : e)
)

startTransition(async () => {
  applyOptimistic({ id, status: 'paid' })  // UI instantánea
  await markAsPaid(id)                      // Server Action en background
})
```

### Dual-write en Server Actions

```typescript
// Supabase y n8n se notifican en paralelo — sin latencia extra
await Promise.all([
  supabase.from('fixed_expenses').update({ status: 'paid' }).eq('id', expenseId),
  sendToN8n({ userId, action: 'mark_expense_paid', payload: { expenseId } }),
])
```

---

## Diseño — Paleta dark mode zinc

```css
/* globals.css — Tailwind v4 CSS-first */
@theme {
  --color-background: #09090b;  /* zinc-950 — fondo general */
  --color-surface:    #18181b;  /* zinc-900 — cards */
  --color-border:     #27272a;  /* zinc-800 — bordes */
  --color-text:       #fafafa;  /* zinc-50  — texto primario */
  --color-muted:      #a1a1aa;  /* zinc-400 — texto secundario */
  --color-success:    #10b981;  /* emerald-500 — pagado, ingresos */
  --color-warning:    #fbbf24;  /* amber-400 — desvío leve */
  --color-danger:     #ef4444;  /* red-500   — desvío alto */
}
```

---

## Auth con Clerk (proxy.ts — Next.js 16)

```typescript
// proxy.ts reemplaza middleware.ts en Next.js 16
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/login(.*)', '/api/webhooks(.*)'])

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})
```

El `userId` se obtiene en cada Server Action directamente desde Clerk:

```typescript
const { userId } = await auth()
if (!userId) throw new Error('Unauthorized')
```

---

## PWA

- **Instalable** en Android/iOS via `app/manifest.ts` (standalone, tema zinc-950)
- **Offline** via Serwist Service Worker (`src/app/sw.ts`)
- Service Worker solo activo en producción (`npm run build && npm start`)
- En desarrollo usa Turbopack sin restricciones de SW

---

## Base de datos (Supabase)

Tres tablas con Row Level Security habilitado:

| Tabla | Descripción |
|---|---|
| `budget_state` | Estado presupuestal por usuario (1 fila por `user_id`) |
| `fixed_expenses` | Gastos fijos mensuales (alquiler, servicios, etc.) |
| `movements` | Historial de ingresos y egresos |

Migración completa en [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

---

## Scripts

```bash
npm run dev      # Desarrollo con Turbopack (SW deshabilitado)
npm run build    # Build de producción (compila SW con webpack)
npm run start    # Servidor de producción
```
