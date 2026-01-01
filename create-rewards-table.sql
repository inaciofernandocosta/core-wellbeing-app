-- Criar tabela de recompensas personalizadas por usuário
-- Permite que cada usuário configure suas próprias recompensas para resgate de pontos

-- 1. Criar tabela rewards
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  icon VARCHAR(10), -- Emoji ou ícone
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(user_id, is_active);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS - SELECT
CREATE POLICY "Users can view their own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Políticas RLS - INSERT
CREATE POLICY "Users can create their own rewards"
  ON rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Políticas RLS - UPDATE
CREATE POLICY "Users can update their own rewards"
  ON rewards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Políticas RLS - DELETE
CREATE POLICY "Users can delete their own rewards"
  ON rewards FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_rewards_updated_at();

-- 9. Inserir recompensas padrão para novos usuários (opcional)
-- Você pode descomentar e ajustar conforme necessário
-- INSERT INTO rewards (user_id, name, description, points_cost, icon)
-- VALUES 
--   (auth.uid(), 'Leite Ninho', 'Uma lata de Leite Ninho', 1, '🥛'),
--   (auth.uid(), 'Cabana', 'Uma barra de chocolate Cabana', 10, '🍫');

-- 10. Verificar resultado
SELECT 
  id, 
  name,
  points_cost,
  icon,
  is_active,
  created_at
FROM rewards
ORDER BY points_cost ASC
LIMIT 10;
