-- EUR savings + crypto (símbolo editable) + ampliar monedas de movimientos

ALTER TABLE budget_state
  ADD COLUMN IF NOT EXISTS savings_eur_goal numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS savings_eur_current numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS savings_crypto jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS crypto_symbol text;

ALTER TABLE movements DROP CONSTRAINT IF EXISTS movements_currency_check;
ALTER TABLE movements ADD CONSTRAINT movements_currency_check
  CHECK (currency IN ('ARS', 'USD', 'EUR', 'CRYPTO'));

ALTER TABLE movements DROP CONSTRAINT IF EXISTS movements_savings_target_check;
ALTER TABLE movements ADD CONSTRAINT movements_savings_target_check
  CHECK (savings_target IN ('none', 'ars', 'usd', 'eur', 'crypto'));
