-- ========================================
-- FORÇA REMOÇÃO E RECRIAÇÃO DE TODAS AS POLÍTICAS
-- ========================================

-- 1. Remover TODAS as políticas de pillars
DROP POLICY IF EXISTS "select own" ON pillars;
DROP POLICY IF EXISTS "insert own" ON pillars;
DROP POLICY IF EXISTS "update own" ON pillars;
DROP POLICY IF EXISTS "delete own" ON pillars;
DROP POLICY IF EXISTS "Users can view shared pillars" ON pillars;
DROP POLICY IF EXISTS "Users can edit shared pillars with edit permission" ON pillars;
DROP POLICY IF EXISTS "pillars_select" ON pillars;
DROP POLICY IF EXISTS "pillars_insert" ON pillars;
DROP POLICY IF EXISTS "pillars_update" ON pillars;
DROP POLICY IF EXISTS "pillars_delete" ON pillars;

-- 2. Remover TODAS as políticas de pillar_shares
DROP POLICY IF EXISTS "Public can view shares by token" ON pillar_shares;
DROP POLICY IF EXISTS "Users can view their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Users can create shares for their pillars" ON pillar_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "pillar_shares_public_select" ON pillar_shares;
DROP POLICY IF EXISTS "pillar_shares_insert" ON pillar_shares;
DROP POLICY IF EXISTS "pillar_shares_update" ON pillar_shares;
DROP POLICY IF EXISTS "pillar_shares_delete" ON pillar_shares;

-- ========================================
-- CRIAR POLÍTICAS NOVAS
-- ========================================

-- PILLAR_SHARES: Acesso público total para SELECT
CREATE POLICY "share_public_select" ON pillar_shares
  FOR SELECT
  USING (true);

CREATE POLICY "share_insert" ON pillar_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM pillars
      WHERE pillars.id = pillar_shares.pillar_id
      AND pillars.user_id = auth.uid()
    )
  );

CREATE POLICY "share_update" ON pillar_shares
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "share_delete" ON pillar_shares
  FOR DELETE
  USING (auth.uid() = owner_id);

-- PILLARS: Acesso para proprietário, pilares padrão e compartilhados
CREATE POLICY "pillar_select" ON pillars
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_default = true
    OR EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
    )
  );

CREATE POLICY "pillar_insert" ON pillars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pillar_update" ON pillars
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

CREATE POLICY "pillar_delete" ON pillars
  FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- ========================================
-- PRONTO! Execute e teste
-- ========================================
