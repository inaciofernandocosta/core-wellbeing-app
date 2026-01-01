-- ========================================
-- SOLUÇÃO FINAL - Remove TODAS as políticas automaticamente
-- ========================================

-- Remover TODAS as políticas de pillar_shares e pillars dinamicamente
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remover todas as políticas de pillars
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pillars') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON pillars';
    END LOOP;
    
    -- Remover todas as políticas de pillar_shares
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pillar_shares') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON pillar_shares';
    END LOOP;
END $$;

-- ========================================
-- CRIAR POLÍTICAS NOVAS
-- ========================================

-- PILLAR_SHARES: Acesso público total para SELECT
CREATE POLICY "ps_select" ON pillar_shares
  FOR SELECT
  USING (true);

CREATE POLICY "ps_insert" ON pillar_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM pillars
      WHERE pillars.id = pillar_shares.pillar_id
      AND pillars.user_id = auth.uid()
    )
  );

CREATE POLICY "ps_update" ON pillar_shares
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "ps_delete" ON pillar_shares
  FOR DELETE
  USING (auth.uid() = owner_id);

-- PILLARS: Acesso para proprietário, pilares padrão e compartilhados
CREATE POLICY "p_select" ON pillars
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_default = true
    OR EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
    )
  );

CREATE POLICY "p_insert" ON pillars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "p_update" ON pillars
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

CREATE POLICY "p_delete" ON pillars
  FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- ========================================
-- PRONTO! Agora deve funcionar
-- ========================================
