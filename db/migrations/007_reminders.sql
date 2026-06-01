-- Recordatorios nativos (gastos fijos y movimientos)

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

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "block_anon_reminders" ON reminders;
CREATE POLICY "block_anon_reminders" ON reminders
  FOR ALL TO anon, authenticated USING (false);
