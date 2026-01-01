-- ========================================
-- EXECUTE ESTE SQL NO SUPABASE
-- ========================================
-- Copie todo este arquivo e cole no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ========================================

-- 1. Criar tabela pillar_shares
CREATE TABLE IF NOT EXISTS pillar_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  share_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pillar_id, shared_with_email)
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_pillar_shares_pillar_id ON pillar_shares(pillar_id);
CREATE INDEX IF NOT EXISTS idx_pillar_shares_owner_id ON pillar_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_pillar_shares_shared_with_email ON pillar_shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_pillar_shares_shared_with_user_id ON pillar_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_pillar_shares_share_token ON pillar_shares(share_token);

-- 3. Ativar RLS
ALTER TABLE pillar_shares ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
CREATE POLICY "Users can view their own shares"
  ON pillar_shares FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create shares for their pillars"
  ON pillar_shares FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM pillars
      WHERE pillars.id = pillar_shares.pillar_id
      AND pillars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own shares"
  ON pillar_shares FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shares"
  ON pillar_shares FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Shared users can view shares with them"
  ON pillar_shares FOR SELECT
  USING (
    auth.uid() = shared_with_user_id OR
    auth.email() = shared_with_email
  );

-- 5. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pillar_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger
CREATE TRIGGER update_pillar_shares_updated_at
  BEFORE UPDATE ON pillar_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_pillar_shares_updated_at();

-- 7. IMPORTANTE: Permitir acesso público aos pilares compartilhados
-- Remover política antiga se existir
DROP POLICY IF EXISTS "Users can view shared pillars" ON pillars;

-- Criar nova política que permite visualização de pilares compartilhados
CREATE POLICY "Users can view shared pillars"
  ON pillars FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
      AND pillar_shares.share_token IS NOT NULL
    )
  );

-- 8. Permitir edição de pilares compartilhados com permissão edit
DROP POLICY IF EXISTS "Users can edit shared pillars with edit permission" ON pillars;

CREATE POLICY "Users can edit shared pillars with edit permission"
  ON pillars FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
      AND pillar_shares.shared_with_user_id = auth.uid()
      AND pillar_shares.permission = 'edit'
    )
  );

-- ========================================
-- PRONTO! Agora teste o compartilhamento
-- ========================================
