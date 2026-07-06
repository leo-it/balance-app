-- Estado de pago en movimientos (como gastos fijos)

ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid'));

ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Movimientos existentes: ya contaban en presupuesto → marcarlos como pagados
UPDATE movements
SET status = 'paid',
    paid_at = COALESCE(paid_at, created_at)
WHERE status = 'pending' AND paid_at IS NULL;

CREATE INDEX IF NOT EXISTS movements_user_status_idx ON movements(user_id, status);
