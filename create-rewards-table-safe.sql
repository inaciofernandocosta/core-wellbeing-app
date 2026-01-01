-- Criar tabela de recompensas personalizadas por usuário (versão segura)
-- Permite que cada usuário configure suas próprias recompensas para resgate de pontos
-- Esta versão remove políticas existentes antes de criar novas

-- 1. Criar tabela rewards (se não existir)
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

-- 2. Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(user_id, is_active);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes (se existirem)
DROP POLICY IF EXISTS "Users can view their own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can create their own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can delete their own rewards" ON rewards;

-- 5. Criar políticas RLS - SELECT
CREATE POLICY "Users can view their own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Criar políticas RLS - INSERT
CREATE POLICY "Users can create their own rewards"
  ON rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Criar políticas RLS - UPDATE
CREATE POLICY "Users can update their own rewards"
  ON rewards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Criar políticas RLS - DELETE
CREATE POLICY "Users can delete their own rewards"
  ON rewards FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Criar ou substituir função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Remover trigger existente (se existir) e criar novo
DROP TRIGGER IF EXISTS rewards_updated_at ON rewards;
CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_rewards_updated_at();

-- 11. Verificar resultado
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
