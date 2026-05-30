export const hasValidDatabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder' &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')

export function assertDatabase(): void {
  if (!hasValidDatabase) {
    throw new Error(
      'Base de datos no configurada. Completá las variables de conexión en .env.local',
    )
  }
}
