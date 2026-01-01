-- ========================================
-- SOLUÇÃO DEFINITIVA - Execute este SQL completo
-- ========================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
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

-- 2. CRIAR POLÍTICAS PARA PILLAR_SHARES
-- CRÍTICO: Acesso público total para SELECT (necessário para compartilhamento)
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

-- 3. CRIAR POLÍTICAS PARA PILLARS
-- Permitir SELECT: proprietário OU pilar compartilhado
CREATE POLICY "pillars_select" ON pillars
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
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
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
      AND pillar_shares.shared_with_user_id = auth.uid()
      AND pillar_shares.permission = 'edit'
    )
  );

CREATE POLICY "pillars_delete" ON pillars
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- PRONTO! Execute e teste
-- ========================================
