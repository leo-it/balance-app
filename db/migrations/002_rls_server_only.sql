-- El acceso a la DB desde Next.js usa SUPABASE_SERVICE_ROLE_KEY (bypass RLS).
-- Estas políticas bloquean acceso directo con la anon key desde el browser.

DROP POLICY IF EXISTS "Users own their budget" ON budget_state;
DROP POLICY IF EXISTS "Users own their expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "Users own their movements" ON movements;

CREATE POLICY "block_anon_budget" ON budget_state
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "block_anon_expenses" ON fixed_expenses
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "block_anon_movements" ON movements
  FOR ALL TO anon, authenticated USING (false);
