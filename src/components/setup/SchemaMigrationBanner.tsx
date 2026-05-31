export function SchemaMigrationBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <p className="text-sm text-amber-200">
        Tu base de datos usa un esquema anterior. Ejecutá en el SQL Editor de Supabase, en orden:
        {' '}<code className="text-amber-100">003_savings_dual_currency.sql</code>,{' '}
        <code className="text-amber-100">004_eur_crypto_savings.sql</code> y{' '}
        <code className="text-amber-100">005_movement_amount_precision.sql</code>,{' '}
        <code className="text-amber-100">006_shopping_list.sql</code>, luego recargá la app.
      </p>
    </div>
  )
}
