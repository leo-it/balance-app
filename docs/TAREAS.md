# Tareas pendientes — Linkeweb

Lista de mejoras para llevar la app a producción con calidad. Priorizá según impacto y esfuerzo.

**Documentación relacionada:** [`docs/BUENAS-PRACTICAS.md`](./BUENAS-PRACTICAS.md) — convenciones que ya aplicamos y particularidades de Next.js 16.

---

## SEO

- [ ] Metadata por ruta (`title`, `description`, `openGraph`) en `layout.tsx` y páginas clave
- [ ] `robots.txt` y `sitemap.xml` (solo rutas públicas; el dashboard es privado)
- [ ] URLs semánticas y títulos únicos por pantalla (Ahorros, Analítica, Ajustes)
- [ ] Structured data mínimo si hay landing pública (Organization / WebApplication)
- [ ] Canonical URLs y locale `es-AR` consistente
- [ ] Preview social (og:image) — icono PWA o imagen de marca

---

## Accesibilidad (a11y)

- [ ] Contraste de texto secundario (`zinc-500` sobre `zinc-900`) — verificar WCAG AA
- [ ] Labels y `aria-label` en botones solo con ícono (editar, borrar, cerrar sheet)
- [ ] Focus visible en inputs y botones (no depender solo de color)
- [ ] Orden de tabulación lógico en formularios del sheet
- [ ] Anuncios de error en formularios (`role="alert"`, asociar error al campo)
- [ ] Tamaños táctiles mínimos 44×44 px en acciones móviles
- [ ] Soporte de `prefers-reduced-motion` para animaciones `motion/react`
- [ ] Prueba con lector de pantalla (VoiceOver) en flujo login → agregar movimiento

---

## Seguridad

- [ ] Revisar que `SUPABASE_SERVICE_ROLE_KEY` nunca llegue al cliente (solo server actions / RSC)
- [ ] Rate limiting en server actions sensibles (Clerk + middleware)
- [ ] Validación de inputs en servidor (montos, IDs UUID, enums) — ampliar donde falte
- [ ] Headers de seguridad (`Content-Security-Policy`, `X-Frame-Options`, etc.) en `next.config`
- [ ] RLS en Supabase por `user_id` si se expone anon key en algún path
- [ ] Sanitizar payloads a n8n (sin datos sensibles innecesarios)
- [ ] Rotación documentada de secrets (Clerk, Supabase, n8n)
- [ ] Dependencias: `pnpm audit` periódico y actualización de paquetes críticos

---

## Rendimiento — carga y render

- [ ] Medir LCP / INP / CLS con Lighthouse (mobile, throttling 4G)
- [ ] Reducir JS del cliente: mover lógica a RSC donde no haga falta `'use client'`
- [ ] Lazy load de sheets pesados (`AddExpenseSheet`, `EditMovementSheet`)
- [ ] Evitar re-fetch completo del dashboard tras cada mutación (optimistic UI ya parcial)
- [ ] Cache/revalidate granular (`revalidatePath` solo lo necesario)
- [ ] Imágenes e íconos: tree-shaking de `lucide-react` (imports nombrados ✓, revisar bundle)
- [ ] Font loading: `next/font` con `display: swap`

---

## Rendimiento — llamadas y datos

- [ ] Paralelizar queries en páginas que hoy hacen fetch en serie
- [ ] Índices Supabase: `movements(user_id, created_at)`, `fixed_expenses(user_id)`
- [ ] Evitar `getAllMovements` cuando solo hace falta `limit N` (paginación en DB)
- [ ] Timeout y retry en `sendToN8n` (hoy falla silencioso si no hay URL)
- [ ] Consolidar `syncBudgetSnapshot` + lecturas duplicadas en un solo round-trip donde sea posible
- [ ] Edge caching solo para assets estáticos; dashboard siempre dinámico (`force-dynamic` ✓)

---

## PWA y offline

- [ ] Verificar Serwist en producción (deshabilitado en dev ✓)
- [ ] Estrategia offline clara: qué funciona sin red y qué muestra error
- [ ] `manifest.json`: nombre, colores, iconos maskable (parcial ✓)
- [x] Prompt de instalación (A2HS) en mobile — banner + `/instalar` + atajo PWA a `/resumen` ✓

---

## UX y producto

- [x] **Lista de compras** — `/compras`: ítems con nombre, cantidad opcional, categoría, marcar comprado, borrar y limpiar comprados; sync Supabase (`006_shopping_list.sql`); menú mobile/desktop ✓
- [ ] Metas de ahorro en cripto (hoy solo saldo, sin goal/progreso)
- [ ] Editar saldo cripto manual en Ajustes (como ARS/USD/EUR)
- [ ] Confirmación al borrar con mejor copy (accesible, no solo `window.confirm`)
- [ ] Empty states consistentes en todas las pantallas
- [ ] Toasts de éxito/error tras guardar (hoy solo cierra el sheet)
- [ ] Filtros o búsqueda en movimientos si la lista crece

---

## Calidad y mantenimiento

- [ ] **Pre-commit:** script que corra `tsc`, tests y build antes de cada commit (ver sección Git abajo)
- [ ] Tests E2E críticos (login, agregar movimiento, marcar gasto fijo pagado)
- [ ] CI: `tsc`, Vitest, build en cada PR (GitHub Actions)
- [ ] Migraciones SQL versionadas y documentadas (003–006 ✓)
- [ ] `.env.local.example` siempre al día (incl. `WIDGET_API_KEY`)
- [ ] Monitoreo de errores (Sentry o similar) en producción
- [ ] Logs estructurados en server actions (sin `console.log` en prod)

---

## Git — verificación pre-commit

Objetivo: no commitear código que no compila, rompe tests o no buildea.

- [ ] Script npm `verify`: `tsc --noEmit && vitest run && next build` (alias `pnpm verify`)
- [ ] Husky + hook `pre-commit` que ejecute `pnpm verify` (o subset rápido: `tsc` + `vitest` en commit; `build` en pre-push)
- [ ] Documentar en README: `pnpm prepare` instala hooks; `--no-verify` solo emergencias
- [ ] Opcional: `lint-staged` para ESLint solo en archivos staged (más rápido que verify completo)
- [ ] CI en remoto como red de seguridad (el hook local no reemplaza CI en PR)

**Propuesta de scripts en `package.json`:**

```json
"verify": "tsc --noEmit && vitest run && next build",
"verify:quick": "tsc --noEmit && vitest run"
```

---

## Loading y skeletons

**Estado actual (sin implementar skeleton global):**

| Qué hay hoy | Dónde |
|-------------|--------|
| Texto «Guardando…» en botones | Sheets, formulario Ajustes |
| `useTransition` / opacidad al borrar | `MovementList` |
| Spinner en card de gasto fijo | `FixedExpenseCard` (estado `loading`) |
| Placeholder «—» hasta mount | `DailyBudgetWidget`, `SavingsProgressWidget` (evitar hydration mismatch) |
| Página `/resumen` | Widget PWA simplificado (no home screen nativo) |

**No hay:** `loading.tsx`, componente `Skeleton`, `Suspense` con fallback en rutas del dashboard.

- [ ] `loading.tsx` en `(dashboard)/` con skeleton del layout (header + card presupuesto + lista)
- [ ] Componente reutilizable `Skeleton` en `src/components/ui/` (shimmer zinc, mobile-first)
- [ ] Skeleton en feed de movimientos mientras revalida (transición suave post-mutación)
- [ ] Skeleton en `/analytics` y `/savings` (cards de métricas)
- [ ] `Suspense` boundaries donde haya fetches lentos en paralelo
- [ ] Evitar flash: alinear skeleton con layout real (mismas alturas que cards)

---

## Animaciones (con sentido, no decorativas)

Regla del proyecto: solo animar interacción directa del usuario (`AGENTS.md`). Pendiente pulir y extender:

- [ ] **Presupuesto diario:** transición numérica al cambiar monto (`DailyBudgetWidget` — ya usa `motion`; revisar suavidad)
- [ ] **Barra de ahorro:** animar `width` del progreso al actualizar meta/saldo (no saltos bruscos)
- [ ] **Sheets:** entrada/salida ya con spring — añadir `prefers-reduced-motion` (instant o fade corto)
- [ ] **Lista movimientos:** `AnimatePresence` al agregar/borrar ítem (altura + opacity, no solo revalidate)
- [ ] **FAB +:** micro-feedback al abrir sheet (`whileTap` ✓; opcional rotación ícono 45° → X)
- [ ] **Gasto fijo pagado:** transición Cargar → Cargado (`AnimatePresence` ✓ en card; unificar timing)
- [ ] **Toasts** (cuando existan): slide desde abajo, auto-dismiss — no competir con sheet
- [ ] **Nunca:** animaciones en métricas que el usuario no tocó; parallax; loops infinitos

---

## Widget nativo — pantalla de inicio (celular)

**Estado actual:**

- API lista: `GET /api/widget/summary` (`src/app/api/widget/summary/route.ts`)
- Ruta pública en `proxy.ts`: `/api/widget(.*)`
- **Android:** código base en `android/widget-src/` + guía en `android/README.md` (App Widget 2×2, Kotlin) — **falta integrar** en proyecto Capacitor generado (`npx cap add android` + copiar providers)
- **iOS:** no implementado — requiere extensión **WidgetKit** (Swift) separada del WebView Capacitor
- Capacitor config: `capacitor.config.ts` (`com.leoit.balanceapp`, `webDir: out`)

**Tareas:**

- [ ] Completar flujo Android: `cap add android`, copiar `widget-src`, registrar `LinkewebWidgetProvider` en `AndroidManifest.xml`
- [ ] UI widget Android: disponible hoy, restante mes, ahorro ARS/USD, tap → abrir app en `/` o `/resumen`
- [ ] Guardar en app `userId` + `WIDGET_API_KEY` en SharedPreferences (tras login Clerk) para refresh del widget
- [ ] `WorkManager` o `AlarmManager` para actualizar widget cada N horas (y al abrir app)
- [ ] **iOS WidgetKit:** target extensión en Xcode, TimelineProvider que llame a `/api/widget/summary` con Bearer + `userId`
- [ ] Widget iOS pequeño (systemSmall) y mediano — mismo JSON que Android
- [ ] Documentar en `docs/` flujo completo: env vars, build firmado, prueba en dispositivo
- [ ] Opcional: **Live Activity** / Dynamic Island (iOS) para «disponible hoy» — esfuerzo alto, fase 2
- [ ] Extender API widget: incluir cripto, EUR, `spendableRemaining` si hace falta en UI nativa

**Nota:** el widget de home screen **no es lo mismo** que la página `/resumen` (esa es una vista web dentro de la PWA). El nativo lee la API sin cargar Next.js.

---

## Legal / confianza (si hay usuarios reales)

- [ ] Política de privacidad (Clerk + Supabase + datos financieros)
- [ ] Términos de uso
- [ ] Banner de cookies si aplica analytics

---

## Orden sugerido para arrancar

1. ~~**Cripto en ahorros**~~ — saldo y aportes visibles ✓
2. **Git pre-commit** — `pnpm verify` + Husky (evitar commits rotos)
3. **Seguridad básica** — validación server + headers + audit deps
4. **Loading / skeleton** — `loading.tsx` dashboard + componente Skeleton
5. **Rendimiento DB** — paginación movimientos + índices
6. **Animaciones** — lista movimientos + reduced-motion
7. **Widget Android** — integrar `widget-src` en Capacitor; luego iOS WidgetKit
8. **Accesibilidad** — foco, labels, contraste en formularios
9. **SEO** — metadata y PWA manifest
10. **Monitoreo** — Sentry + CI en GitHub Actions
