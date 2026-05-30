-- Budget state per user
CREATE TABLE IF NOT EXISTS budget_state (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL UNIQUE,
  daily_budget    numeric(12,2) NOT NULL DEFAULT 0,
  monthly_budget  numeric(12,2) NOT NULL DEFAULT 0,
  total_spent     numeric(12,2) NOT NULL DEFAULT 0,
  savings_goal    numeric(12,2) NOT NULL DEFAULT 0,
  current_savings numeric(12,2) NOT NULL DEFAULT 0,
  deviation_status text NOT NULL DEFAULT 'ok' CHECK (deviation_status IN ('ok','warning','alert')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Fixed monthly expenses
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

-- Movements (income + expenses)
CREATE TABLE IF NOT EXISTS movements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  description text NOT NULL,
  amount      numeric(12,2) NOT NULL,
  type        text NOT NULL CHECK (type IN ('income','expense')),
  category    text NOT NULL DEFAULT 'General',
  icon_name   text NOT NULL DEFAULT 'Receipt',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS movements_user_id_idx ON movements(user_id);
CREATE INDEX IF NOT EXISTS movements_created_at_idx ON movements(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_state_updated_at
  BEFORE UPDATE ON budget_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fixed_expenses_updated_at
  BEFORE UPDATE ON fixed_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE budget_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their budget" ON budget_state
  FOR ALL USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users own their expenses" ON fixed_expenses
  FOR ALL USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users own their movements" ON movements
  FOR ALL USING (user_id = current_setting('app.user_id', true));
