# Widget nativo Android — Balance App

Widget 2×2 en la **pantalla de inicio** del celular: restante gastable, gastos del mes y ahorro USD. Se actualiza solo (cada ~30 min) y al abrir la app.

## Qué hay en el repo

| Ruta | Qué es |
|---|---|
| `android/` | Proyecto Capacitor Android (APK) |
| `native/android-widget/` | Fuente del widget (Kotlin + layouts) |
| `scripts/integrate-android-widget.mjs` | Copia el widget al proyecto tras `cap sync` |
| `GET /api/widget/summary` | API que lee el widget |

## Requisitos

- Android Studio (con SDK 35)
- Node 20+
- App desplegada en Vercel (o dev server accesible desde el celular)
- `WIDGET_API_KEY` en Vercel **y** en `android/gradle.properties`

## 1. Variables de entorno

**Vercel** (`.env`):

```
WIDGET_API_KEY=una-clave-larga-secreta
```

**Android** (`android/gradle.properties` — descomentar y completar):

```properties
WIDGET_API_KEY=la-misma-clave-que-en-vercel
WIDGET_API_BASE=https://tu-app.vercel.app
```

**Capacitor** (al compilar, apuntar al server):

```bash
export CAPACITOR_SERVER_URL=https://tu-app.vercel.app
```

## 2. Compilar e instalar la APK

```bash
# Sync Capacitor + integrar widget
pnpm cap:sync

# Abrir Android Studio
pnpm android:open
```

En Android Studio:

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Instalá el APK en el celular (USB o archivo `android/app/build/outputs/apk/debug/app-debug.apk`)

## 3. Primera vez en el celular

1. Abrí **Balance App** (ícono de la APK, no la PWA de Chrome)
2. Iniciá sesión con Clerk (o dev)
3. La app guarda tu `userId` para el widget automáticamente
4. Salí a la pantalla de inicio → mantené presionado → **Widgets** → **Balance App**
5. Arrastrá el widget 2×2 al inicio

Si el widget dice «Abrí la app», abrí la APK una vez logueado y volvé al inicio.

## 4. Cómo funciona la auth

El widget **no** usa cookies. Llama a:

```
GET {WIDGET_API_BASE}/api/widget/summary?userId={clerkId}
Authorization: Bearer {WIDGET_API_KEY}
```

Tras login, el plugin Capacitor `WidgetConfig` guarda `userId` + URL base en `SharedPreferences` y refresca el widget.

## 5. Actualizaciones

- Automáticas cada ~30 min (límite de Android)
- Al abrir la app (sync de userId)
- Tap en el widget → abre la app

## 6. Re-sync tras cambios en el widget

```bash
pnpm cap:sync
```

Si solo editaste `native/android-widget/`:

```bash
pnpm android:integrate-widget
```

## API

```json
{
  "spendableRemaining": 3800,
  "totalSpent": 18000,
  "savingsUsd": 1200,
  "dailyAvailable": 4200,
  "monthRemaining": 85000,
  "savingsArs": 87500,
  "savingsEur": 0,
  "pendingFixedCount": 3,
  "updatedAt": "2026-05-30T..."
}
```

## iOS

WidgetKit (Swift) no está implementado. La PWA en iOS no puede registrar widgets del sistema.

## Troubleshooting

| Síntoma | Solución |
|---|---|
| «Sin conexión» | Revisá `WIDGET_API_BASE`, internet, y que Vercel tenga `WIDGET_API_KEY` |
| «Abrí la app» | Abrí la APK logueado; el plugin guarda el userId |
| 401 en API | `WIDGET_API_KEY` distinta entre Vercel y `gradle.properties` |
| Widget no aparece en la lista | Reinstalá la APK; widgets solo existen en la app nativa, no en la PWA |
