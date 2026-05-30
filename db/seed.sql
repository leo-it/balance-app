-- Reemplazar 'tu-user-id' con el userId real de Clerk
-- Lo encontrás en dashboard.clerk.com → Users → tu usuario → User ID

DO $$
DECLARE
  uid TEXT := 'dev-user';     -- Clerk: usar tu userId real; dev sin Clerk: 'dev-user'
BEGIN

-- Presupuesto inicial
INSERT INTO budget_state (user_id, daily_budget, monthly_budget, total_spent, savings_goal, current_savings, deviation_status)
VALUES (uid, 4200, 130000, 48500, 200000, 87500, 'warning')
ON CONFLICT (user_id) DO NOTHING;

-- Gastos fijos mensuales
INSERT INTO fixed_expenses (user_id, label, amount, icon_name, status) VALUES
  (uid, 'Alquiler',     65000, 'Home',     'paid'),
  (uid, 'Internet',      8500, 'Wifi',     'pending'),
  (uid, 'Seguro Moto',  12000, 'Shield',   'pending'),
  (uid, 'Gimnasio',      9500, 'Dumbbell', 'pending'),
  (uid, 'Spotify',       1500, 'Music',    'paid');

-- Movimientos recientes
INSERT INTO movements (user_id, description, amount, type, category, icon_name, created_at) VALUES
  (uid, 'Supermercado Coto',    4800,   'expense', 'Comida',      'ShoppingCart',  now() - interval '30 minutes'),
  (uid, 'Sueldo Agosto',        130000, 'income',  'Ingresos',    'Banknote',      now() - interval '3 hours'),
  (uid, 'Nafta YPF',            6200,   'expense', 'Transporte',  'Fuel',          now() - interval '8 hours'),
  (uid, 'Farmacity',            3100,   'expense', 'Salud',       'Pill',          now() - interval '1 day'),
  (uid, 'Transferencia recibida', 15000, 'income', 'Ingresos',    'ArrowDownLeft', now() - interval '28 hours');

END $$;
