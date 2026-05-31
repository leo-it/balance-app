<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Linkeweb — Pautas para agentes AI

## Contexto del proyecto

PWA mobile-first de gestión de gastos y ahorros. Stack: **Next.js 16.2**, **React 19.2**, **TypeScript strict**, **Tailwind CSS v4**, **Clerk**, **Supabase** (solo DB), **motion/react**, **Serwist** (PWA), **n8n** (webhooks).

---

## Reglas de arquitectura

### RSC vs Client Components

- Por defecto, todos los componentes son **React Server Components** (RSC).
- Agregar `'use client'` **solo** cuando el componente use: hooks de estado/efecto, animaciones (`motion/react`), `useOptimistic`, `useTransition`, o manejadores de eventos del DOM.
- Los RSC reciben datos como props desde `(dashboard)/page.tsx` — nunca hacen fetch propio del lado cliente.
- `MetricsHeader`, `MovementFeed`, `MovementItem` son RSC. `DailyBudgetWidget`, `SavingsProgressWidget`, `FixedExpenseList`, `FixedExpenseCard` son Client Components.

### Server Actions

- Todos los actions van en `src/actions/` con la directiva `'use server'` al tope del archivo.
- **Siempre** obtener `userId` desde Clerk al inicio: `const { userId } = await auth()`.
- **Siempre** lanzar `throw new Error('Unauthorized')` si `userId` es null.
- **Siempre** usar `Promise.all([db..., sendToN8n(...)])` para el dual-write — nunca en serie.
- Terminar con `revalidatePath('/')` para refrescar los datos del dashboard.

```typescript
// Patrón correcto para todos los actions
export async function miAction(input: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const db = await createDbClient()
  await Promise.all([
    db.from('tabla').update({...}),
    sendToN8n({ userId, action: 'mi_action', payload: { input } }),
  ])
  revalidatePath('/')
}
```

### Mutaciones en el cliente

- Usar `useOptimistic` + `useTransition` para mutaciones sin formulario (marcar gasto pagado, deshacer).
- Usar `useActionState` para formularios con validación de errores.
- **Nunca** usar `useState` + `fetch` manual para llamar a server actions.

---

## Next.js 16 — Cambios críticos

- El middleware se llama `proxy.ts` (no `middleware.ts`). La función exportada se llama `proxy`.
- `cookies()`, `headers()` y `params` son **asíncronos**: siempre `await cookies()`, `await params`.
- No hay `tailwind.config.ts` — Tailwind v4 se configura en `globals.css` con `@theme {}`.
- `next lint` fue eliminado — no intentar ejecutarlo.
- Turbopack es el bundler por defecto. Serwist está deshabilitado en dev (`disable: process.env.NODE_ENV !== 'production'`).

---

## Base de datos

- Capa de acceso en `@/lib/db` — repositorio de dominio (`queries.ts`, `createDbClient`). No acoplar UI ni actions al proveedor.
- El adaptador actual está en `lib/db/client.ts` y `server.ts` (PostgreSQL). Cambiar de proveedor = solo esos archivos.
- Nunca exponer la service key al browser.
- Datos del dashboard: `getDashboardData(userId)` en `@/lib/data.ts` — `assertDatabase()`.
- Primer login sin filas: `initUserData(userId)` crea solo `budget_state` en ceros (sin datos demo).
- Datos demo opcionales: ejecutar `db/seed.sql` manualmente en SQL Editor.
- Tablas: `budget_state`, `fixed_expenses`, `movements`. Auth: Clerk (`user_id` = Clerk userId o `dev-user` en dev).
- Si `hasValidDatabase` es false, la app lanza error — no hay fallback mock.

---

## Clerk

- `proxy.ts` usa `clerkMiddleware` para proteger todas las rutas excepto `/login(.*)` y `/api/webhooks(.*)`.
- Sin keys reales de Clerk, las rutas redirigen a `/login`. Bypass solo con `AUTH_DEV_BYPASS=true` (userId `dev-user`).
- En RSC y Server Actions: `import { auth, currentUser } from '@clerk/nextjs/server'`.
- En Client Components: `import { useUser } from '@clerk/nextjs'`.
- La página de login está en `src/app/(auth)/login/[[...rest]]/page.tsx`.

---

## Estilos — Tailwind v4 + zinc

- Dark mode forzado globalmente. No agregar clases `dark:`.
- Paleta de la app: `zinc-950` (fondo), `zinc-900` (cards), `zinc-800` (bordes), `zinc-50` (texto), `zinc-400` (texto secundario).
- Acentos: `emerald-500` (éxito/pagado), `amber-400` (alerta leve), `red-500` (alerta alta).
- No usar colores fuera de la paleta zinc/emerald/amber/red sin justificación.
- Usar `cn()` de `@/lib/utils` para combinar clases condicionales.
- Mobile-first: la app tiene `max-w-md mx-auto` — no diseñar para desktop.

---

## Animaciones

- Usar `motion/react` (no `framer-motion`).
- `whileTap={{ scale: 0.97 }}` en cards interactivas.
- `animate()` + `useMotionValue` para transiciones numéricas (presupuesto diario).
- `AnimatePresence` para cambios de estado con entrada/salida (botón Cargar → Cargado).
- No agregar animaciones a elementos que no tienen interacción directa del usuario.

---

## Formateo de moneda y fechas (SSR-safe)

- **Siempre** usar las funciones de `@/lib/formatters` (`formatCurrency`, `formatTime`, `formatDate`).
- **Nunca** usar `new Intl...` directamente en componentes — puede causar hydration errors.
- En Client Components que muestran valores que cambian dinámicamente, usar `useState(false)` + `useEffect` para el flag `mounted` antes de renderizar valores formateados.
- Los montos se almacenan como `number` en TypeScript y `numeric(12,2)` en la DB.

---

## Convenciones de código

- Sin `console.log` — usar `throw new Error()` para errores, nunca loggear al servidor.
- Sin comentarios que expliquen qué hace el código — solo comentarios que expliquen *por qué*.
- Tipado estricto: sin `any`, sin `as unknown as X`, sin `!` (non-null assertion) salvo en las variables de entorno ya validadas.
- Nombres de funciones en camelCase, componentes en PascalCase, tipos en PascalCase.
- Los archivos de tipos van en `src/types/`. Los tipos de utilidades (no de dominio) van inline o en el archivo donde se usan.
- Exportaciones nombradas en todo el proyecto — sin `export default` salvo en `page.tsx` y `layout.tsx` (requerido por Next.js).
- Documentación humana en `docs/BUENAS-PRACTICAS.md` y pendientes en `docs/TAREAS.md`.

---

## Estructura de carpetas — dónde poner cada cosa

| Qué | Dónde |
|---|---|
| Componentes de dominio | `src/components/{metrics,expenses,movements}/` |
| Componentes base shadcn | `src/components/ui/` |
| Lógica servidor (DB, webhooks) | `src/actions/` |
| Clientes y helpers | `src/lib/` |
| Tipos de dominio | `src/types/` |
| Páginas | `src/app/(dashboard)/` o `src/app/(auth)/` |

---

## n8n

- La función `sendToN8n` está en `@/lib/n8n.ts` — usarla siempre, no hacer `fetch` directo.
- Si `N8N_WEBHOOK_URL` no está definida, la función retorna silenciosamente (no lanza error).
- El payload siempre debe incluir `userId`, `action` (snake_case) y `payload` (objeto con detalles).
- Acciones conocidas: `mark_expense_paid`, `undo_expense_paid`, `add_movement`.
