-- Montos de cripto (ej. 0.0001 BTC) requieren más decimales que numeric(12,2)

ALTER TABLE movements
  ALTER COLUMN amount TYPE numeric(18, 8) USING amount::numeric(18, 8);
