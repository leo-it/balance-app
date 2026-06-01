# Buenas prácticas — Balance App

Documento de referencia sobre **qué convenciones ya aplicamos** en el proyecto y **qué particularidades de Next.js 16** usamos. Complementa [`AGENTS.md`](../AGENTS.md) (reglas para agentes AI) y [`docs/TAREAS.md`](./TAREAS.md) (pendientes).

**Stack actual:** Next.js **16.2.6** · React **19.2** · TypeScript strict · Tailwind **v4** · Clerk · Supabase (solo DB) · Serwist (PWA)

---

## Arquitectura y separación de capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| UI | `src/components/`, `src/app/` | Presentación; sin lógica de negocio pesada |
| Dominio | `src/lib/domain/` | Cálculos puros (presupuesto, ahorros, fechas) — testeables sin DB |
| Datos | `src/lib/db/` | Lectura/escritura PostgreSQL (Supabase) |
| Orquestación | `src/lib/data.ts` | Ensambla dashboard (`getDashboardData`) |
| Mutaciones | `src/actions/` | Server Actions: auth + validación + dual-write |
| Tipos | `src/types/` | Contratos de dominio compartidos |

**Principios que seguimos:**

- **Server-first:** las páginas del dashboard son React Server Components; cargan datos en el servidor y pasan props al cliente.
- **Cliente mínimo:** `'use client'` solo donde hay estado, efectos, animaciones o eventos DOM.
- **Sin fetch manual a actions:** formularios con `useActionState`; toggles con `useOptimistic` + `useTransition`.
- **Lógica de negocio fuera de la UI:** `computeMonthlySummary`, `resolveCryptoSavingsBalances`, etc. viven en `lib/domain/` con tests Vitest.
- **Adaptador de DB:** la app no importa Supabase desde componentes; todo pasa por `@/lib/db`.

---

## Seguridad

- **Auth en el borde:** `src/proxy.ts` (middleware de Next 16) protege rutas con Clerk; excepciones explícitas para `/login`, webhooks y widget.
- **UserId en servidor:** toda mutación obtiene el usuario con `getUserId()` / `auth()` en Server Actions — nunca confiamos en IDs del cliente.
- **Service role solo en servidor:** `SUPABASE_SERVICE_ROLE_KEY` se usa en `createDbClient()` del servidor; no hay secrets en el bundle del browser.
- **Validación en actions:** montos, enums (`currency`, `savingsTarget`), UUIDs y metadatos cripto se validan antes de escribir.
- **Dual-write paralelo:** DB + n8n con `Promise.all` — si falla la DB, la action lanza error (no silenciamos fallos críticos salvo columnas legacy con fallback documentado).
- **Dev aislado:** bypass de auth (`AUTH_DEV_BYPASS`, cookie dev) solo cuando no hay Clerk real configurado.

---

## Datos y consistencia

- **Un usuario = un `budget_state`:** `initUserData` crea filas en ceros; seed demo es opt-in (`db/seed.sql`).
- **Migraciones SQL versionadas:** `db/migrations/` + `db/setup.sql` para installs nuevos; banner si el esquema está desactualizado.
- **Montos tipados:** `number` en TS; Postgres `numeric` con precisión según uso (movimientos cripto: `numeric(18,8)`).
- **Formateo centralizado:** `@/lib/formatters` evita `Intl` suelto en componentes (menos hydration mismatch).
- **Revalidación explícita:** tras mutaciones, `revalidatePath` en rutas afectadas (`/`, `/savings`, `/analytics`, etc.).

---

## UX y frontend

- **Mobile-first:** layout `max-w-md`, FAB, sheets desde abajo, tap targets en acciones.
- **Dark mode fijo:** paleta zinc + acentos emerald/amber/red; sin toggle `dark:` redundante.
- **Animaciones con propósito:** `motion/react` solo en interacción directa (`whileTap`, sheets, transiciones numéricas).
- **Optimistic UI:** marcar gasto fijo pagado / deshacer sin esperar round-trip completo.
- **PWA:** Serwist genera SW en producción; deshabilitado en dev para no interferir con HMR.

---

## Calidad de código

- **TypeScript strict:** sin `any`, sin non-null assertion salvo env validado.
- **Exportaciones nombradas** (excepto `page.tsx` / `layout.tsx` requeridos por Next).
- **Sin `console.log` en producción:** errores con `throw new Error(...)`.
- **Tests de dominio:** Vitest en `src/lib/domain/` y `src/lib/formatters.test.ts`.
- **ESLint:** `eslint-config-next@16.2.6` (no usamos `next lint`, eliminado en Next 16).

---

## Next.js 16 — prácticas y convenciones que usamos

Next 16 introduce cambios respecto a versiones anteriores. Este proyecto ya los adoptó.

### 1. Proxy en lugar de middleware

| Antes (≤15) | Ahora (16) |
|-------------|------------|
| `middleware.ts` | **`src/proxy.ts`** |
| `export function middleware` | **`export const proxy`** |

Archivo: [`src/proxy.ts`](../src/proxy.ts) — Clerk, matcher de rutas estáticas/PWA, redirect a login.

### 2. APIs dinámicas asíncronas

Siempre `await` en servidor:

```typescript
const cookieStore = await cookies()
const headersList = await headers()
const { id } = await params
```

Usado en auth, DB SSR y layouts.

### 3. Turbopack por defecto

[`next.config.ts`](../next.config.ts) declara `turbopack: {}`. Desarrollo con `next dev` usa Turbopack (más rápido que Webpack en dev).

### 4. App Router + RSC

- Rutas en `src/app/` con route groups: `(dashboard)`, `(auth)`.
- Layouts anidados comparten shell (sidebar, header, FAB).
- Dashboard con **`export const dynamic = 'force-dynamic'`** porque los datos son por usuario y mutables en tiempo real.

### 5. Server Actions como capa de mutación

- Archivos en `src/actions/*.actions.ts` con `'use server'` al inicio.
- Formularios: `useActionState(action, initialState)`.
- Sin Route Handlers REST propios para CRUD interno — actions son el contrato cliente↔servidor.

### 6. Tailwind CSS v4 sin `tailwind.config.ts`

Estilos globales y tokens en [`src/app/globals.css`](../src/app/globals.css) con `@import "tailwindcss"` y bloque `@theme { }`.

### 7. Linting

- **No existe `next lint`** en Next 16.
- Usamos **`pnpm lint`** → `eslint` con `eslint-config-next`.

### 8. PWA con Serwist

Integración vía `@serwist/next` en `next.config.ts`:

- `swSrc: src/app/sw.ts` → `public/sw.js`
- **`disable` en development** — evita cache agresivo mientras desarrollás.

### 9. React 19 en el stack de Next 16

- React **19.2** con Server Components estables.
- Hooks modernos: `useActionState`, `useOptimistic`, `useTransition` en client components acotados.

### 10. Metadata y SEO (parcial — ver TAREAS)

- Metadata base en root layout; pendiente metadata por ruta (listado en TAREAS).
- Dashboard privado: no indexar rutas autenticadas en sitemap futuro.

---

## Patrones concretos en el repo

### Cargar el dashboard (RSC)

```
page.tsx → getDashboardData(userId) → lib/db + lib/domain
         → props a MovementFeed, MetricsHeader, FixedExpenseList
```

### Agregar un movimiento

```
AddExpenseSheet (client, useActionState)
  → addMovement (server action)
    → validar + insertMovementRow
    → Promise.all([n8n, syncBudgetSnapshot, applySavingsFromMovement])
    → revalidatePath(...)
```

### Proteger una ruta

```
Request → proxy.ts (Clerk protect)
       → layout dashboard (force-dynamic, user + schema check)
       → page (getUserId implícito vía data layer)
```

---

## Qué NO hacemos (anti-patrones evitados)

- Client components que hacen `fetch('/api/...')` para datos del dashboard.
- Lógica de presupuesto duplicada en actions y componentes.
- `useEffect` + fetch para mutaciones que deberían ser Server Actions.
- Formatear moneda/fecha con `Intl` inline en JSX.
- Exponer service role o lógica de negocio en el service worker.
- Commitear `.env.local`, `.pnpm-store/` o secrets.

---

## Mantener este documento al día

Actualizá este archivo cuando:

- Subamos de versión mayor de Next (revisar `node_modules/next/dist/docs/`).
- Cambie el patrón de auth, DB o mutaciones.
- Adoptemos una práctica nueva (p. ej. RLS, Sentry, paginación en DB).

Referencias internas: [`AGENTS.md`](../AGENTS.md) · [`docs/TAREAS.md`](./TAREAS.md) · [`db/setup.sql`](../db/setup.sql)
