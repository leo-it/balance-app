-- Lista de compras por usuario

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

DROP TRIGGER IF EXISTS shopping_list_items_updated_at ON shopping_list_items;
CREATE TRIGGER shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
