-- Dual currency savings + movement metadata

ALTER TABLE budget_state
  ADD COLUMN IF NOT EXISTS savings_ars_goal numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS savings_ars_current numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS savings_usd_goal numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS savings_usd_current numeric(12,2) NOT NULL DEFAULT 0;

UPDATE budget_state
SET
  savings_ars_goal = COALESCE(savings_goal, 0),
  savings_ars_current = COALESCE(current_savings, 0)
WHERE savings_ars_goal = 0 AND savings_ars_current = 0;

ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'ARS'
    CHECK (currency IN ('ARS', 'USD')),
  ADD COLUMN IF NOT EXISTS savings_target text NOT NULL DEFAULT 'none'
    CHECK (savings_target IN ('none', 'ars', 'usd'));
