-- ========================================
-- REMOVER POLÍTICAS ANTIGAS E CONFLITANTES
-- ========================================

-- 1. Remover políticas antigas de pillars
DROP POLICY IF EXISTS "select own" ON pillars;
DROP POLICY IF EXISTS "insert own" ON pillars;
DROP POLICY IF EXISTS "update own" ON pillars;
DROP POLICY IF EXISTS "delete own" ON pillars;

-- 2. Remover políticas antigas de pillar_shares
DROP POLICY IF EXISTS "Public can view shares by token" ON pillar_shares;
DROP POLICY IF EXISTS "Users can view their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Users can create shares for their pillars" ON pillar_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON pillar_shares;

-- 3. Remover políticas de compartilhamento antigas
DROP POLICY IF EXISTS "Users can view shared pillars" ON pillars;
DROP POLICY IF EXISTS "Users can edit shared pillars with edit permission" ON pillars;

-- ========================================
-- CRIAR POLÍTICAS NOVAS E CORRETAS
-- ========================================

-- PILLAR_SHARES: Acesso público total para SELECT
CREATE POLICY "pillar_shares_public_select" ON pillar_shares
  FOR SELECT
  USING (true);

CREATE POLICY "pillar_shares_insert" ON pillar_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM pillars
      WHERE pillars.id = pillar_shares.pillar_id
      AND pillars.user_id = auth.uid()
    )
  );

CREATE POLICY "pillar_shares_update" ON pillar_shares
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "pillar_shares_delete" ON pillar_shares
  FOR DELETE
  USING (auth.uid() = owner_id);

-- PILLARS: Acesso para proprietário, pilares padrão e compartilhados
CREATE POLICY "pillars_select" ON pillars
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_default = true
    OR EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
    )
  );

CREATE POLICY "pillars_insert" ON pillars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pillars_update" ON pillars
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
      AND pillar_shares.shared_with_user_id = auth.uid()
      AND pillar_shares.permission = 'edit'
    )
  );

CREATE POLICY "pillars_delete" ON pillars
  FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- ========================================
-- PRONTO! Agora deve funcionar
-- ========================================
