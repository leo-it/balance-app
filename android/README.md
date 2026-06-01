# Android — Widget nativo

Linkeweb incluye un widget Android (2x2) que muestra métricas desde `GET /api/widget/summary`.

## Requisitos

- Android Studio
- Node 20+
- Proyecto Next.js desplegado (o `CAPACITOR_SERVER_URL` apuntando al dev server)

## Setup inicial

```bash
# 1. Instalar Capacitor (ya en package.json tras npm install)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build estático o usar server URL en capacitor.config.ts
# Para desarrollo con server remoto:
export CAPACITOR_SERVER_URL=https://tu-dominio.vercel.app

# 3. Agregar plataforma Android
npx cap add android

# 4. Copiar archivos del widget (después de cap add)
# Los providers están en android/widget-src/ — copiarlos al módulo app generado.

# 5. Sync y abrir Android Studio
npx cap sync android
npx cap open android
```

## Autenticación del widget

Opciones:

1. **Dev:** cookie de sesión dev (`linkeweb_dev_session`) — el WebView debe haber iniciado sesión antes.
2. **Producción:** definir `WIDGET_API_KEY` en `.env` y pasarlo como `Authorization: Bearer <key>?userId=<clerkId>` desde el widget Kotlin.

## API

```
GET /api/widget/summary
Authorization: Bearer <WIDGET_API_KEY>   # opcional en prod
?userId=dev-user                           # requerido con API key

Response:
{
  "dailyAvailable": 4200,
  "spendableRemaining": 3800,
  "monthRemaining": 85000,
  "totalSpent": 18000,
  "savingsArs": 87500,
  "savingsUsd": 1200,
  "savingsEur": 0,
  "pendingFixedCount": 3,
  "updatedAt": "2026-05-30T..."
}
```

Widget nativo (por defecto): restante gastable, gastos del mes, ahorro USD.
Vista PWA `/resumen`: mismos defaults + personalizable con ⚙ en el celular.

## Build APK (internal testing)

En Android Studio: **Build → Generate Signed Bundle / APK**.

Para Play Internal Testing, subí el AAB firmado.

## Tap en widget

Configurar `PendingIntent` para abrir `MainActivity` (WebView Capacitor) en la URL `/resumen` o `/`.
