-- Balance App — ejecutar TODO este archivo en el SQL Editor de tu base de datos (una sola vez)

-- ─── Tablas ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_state (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text NOT NULL UNIQUE,
  daily_budget     numeric(12,2) NOT NULL DEFAULT 0,
  monthly_budget   numeric(12,2) NOT NULL DEFAULT 0,
  total_spent      numeric(12,2) NOT NULL DEFAULT 0,
  savings_goal     numeric(12,2) NOT NULL DEFAULT 0,
  current_savings  numeric(12,2) NOT NULL DEFAULT 0,
  savings_ars_goal    numeric(12,2) NOT NULL DEFAULT 0,
  savings_ars_current numeric(12,2) NOT NULL DEFAULT 0,
  savings_usd_goal    numeric(12,2) NOT NULL DEFAULT 0,
  savings_usd_current numeric(12,2) NOT NULL DEFAULT 0,
  savings_eur_goal    numeric(12,2) NOT NULL DEFAULT 0,
  savings_eur_current numeric(12,2) NOT NULL DEFAULT 0,
  savings_crypto      jsonb NOT NULL DEFAULT '{}'::jsonb,
  deviation_status text NOT NULL DEFAULT 'ok' CHECK (deviation_status IN ('ok','warning','alert')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fixed_expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  label       text NOT NULL,
  amount      numeric(12,2) NOT NULL,
  icon_name   text NOT NULL DEFAULT 'Receipt',
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fixed_expenses_user_id_idx ON fixed_expenses(user_id);

CREATE TABLE IF NOT EXISTS movements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  description text NOT NULL,
  amount      numeric(18,8) NOT NULL,
  type        text NOT NULL CHECK (type IN ('income','expense')),
  category    text NOT NULL DEFAULT 'General',
  icon_name   text NOT NULL DEFAULT 'Receipt',
  currency    text NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR', 'CRYPTO')),
  crypto_symbol text,
  savings_target text NOT NULL DEFAULT 'none' CHECK (savings_target IN ('none', 'ars', 'usd', 'eur', 'crypto')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS movements_user_id_idx ON movements(user_id);
CREATE INDEX IF NOT EXISTS movements_created_at_idx ON movements(created_at DESC);

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  name        text NOT NULL,
  quantity    text,
  category    text NOT NULL DEFAULT 'General',
  purchased   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shopping_list_items_user_id_idx ON shopping_list_items(user_id);

-- ─── Triggers updated_at ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS budget_state_updated_at ON budget_state;
CREATE TRIGGER budget_state_updated_at
  BEFORE UPDATE ON budget_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS fixed_expenses_updated_at ON fixed_expenses;
CREATE TRIGGER fixed_expenses_updated_at
  BEFORE UPDATE ON fixed_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS shopping_list_items_updated_at ON shopping_list_items;
CREATE TRIGGER shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL,
  title           text NOT NULL,
  body            text NOT NULL DEFAULT '',
  entity_type     text NOT NULL CHECK (entity_type IN ('fixed_expense', 'movement')),
  entity_id       uuid NOT NULL,
  notify_date     date NOT NULL,
  notify_time     time NOT NULL,
  repeat_interval text NOT NULL DEFAULT 'none'
    CHECK (repeat_interval IN ('none', 'daily', 'weekly', 'monthly')),
  enabled         boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_enabled_idx ON reminders(user_id, enabled);

DROP TRIGGER IF EXISTS reminders_updated_at ON reminders;
CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS (acceso solo desde servidor con service_role) ────────────────────

ALTER TABLE budget_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their budget" ON budget_state;
DROP POLICY IF EXISTS "Users own their expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "Users own their movements" ON movements;
DROP POLICY IF EXISTS "block_anon_budget" ON budget_state;
DROP POLICY IF EXISTS "block_anon_expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "block_anon_movements" ON movements;
DROP POLICY IF EXISTS "block_anon_shopping_list" ON shopping_list_items;
DROP POLICY IF EXISTS "block_anon_reminders" ON reminders;

CREATE POLICY "block_anon_budget" ON budget_state
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "block_anon_expenses" ON fixed_expenses
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "block_anon_movements" ON movements
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "block_anon_shopping_list" ON shopping_list_items
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "block_anon_reminders" ON reminders
  FOR ALL TO anon, authenticated USING (false);
