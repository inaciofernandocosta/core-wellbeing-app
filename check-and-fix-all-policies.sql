-- ========================================
-- DIAGNÓSTICO E FIX COMPLETO
-- ========================================
-- Este SQL vai remover TODAS as políticas conflitantes
-- e criar apenas as necessárias para compartilhamento público
-- ========================================

-- PASSO 1: Ver políticas atuais (copie o resultado e me envie)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('pillars', 'pillar_shares')
ORDER BY tablename, policyname;

-- ========================================
-- PASSO 2: REMOVER TODAS AS POLÍTICAS DE PILLARS
-- ========================================
-- Isso garante que não há conflitos

DROP POLICY IF EXISTS "Enable read access for all users" ON pillars;
DROP POLICY IF EXISTS "Users can view their own pillars" ON pillars;
DROP POLICY IF EXISTS "Users can insert their own pillars" ON pillars;
DROP POLICY IF EXISTS "Users can update their own pillars" ON pillars;
DROP POLICY IF EXISTS "Users can delete their own pillars" ON pillars;
DROP POLICY IF EXISTS "Users can view shared pillars" ON pillars;
DROP POLICY IF EXISTS "Users can edit shared pillars with edit permission" ON pillars;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON pillars;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON pillars;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON pillars;

-- ========================================
-- PASSO 3: CRIAR POLÍTICAS CORRETAS PARA PILLARS
-- ========================================

-- Permitir SELECT: proprietário OU pilar compartilhado OU acesso público
CREATE POLICY "pillars_select_policy" ON pillars
  FOR SELECT
  USING (
    -- Proprietário pode ver seus pilares
    user_id = auth.uid()
    OR
    -- Pilar está compartilhado (acesso público via share_token)
    EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
    )
  );

-- Permitir INSERT: apenas proprietário
CREATE POLICY "pillars_insert_policy" ON pillars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE: proprietário OU usuário com permissão de edição
CREATE POLICY "pillars_update_policy" ON pillars
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

-- Permitir DELETE: apenas proprietário
CREATE POLICY "pillars_delete_policy" ON pillars
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- PASSO 4: REMOVER TODAS AS POLÍTICAS DE PILLAR_SHARES
-- ========================================

DROP POLICY IF EXISTS "Users can view their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Users can create shares for their pillars" ON pillar_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON pillar_shares;
DROP POLICY IF EXISTS "Shared users can view shares with them" ON pillar_shares;
DROP POLICY IF EXISTS "Public can view shares by token" ON pillar_shares;

-- ========================================
-- PASSO 5: CRIAR POLÍTICAS CORRETAS PARA PILLAR_SHARES
-- ========================================

-- CRÍTICO: Permitir acesso PÚBLICO para buscar por token
CREATE POLICY "pillar_shares_public_select" ON pillar_shares
  FOR SELECT
  USING (true);  -- Permite acesso total para SELECT (necessário para compartilhamento público)

-- Permitir INSERT: apenas proprietário do pilar
CREATE POLICY "pillar_shares_insert_policy" ON pillar_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM pillars
      WHERE pillars.id = pillar_shares.pillar_id
      AND pillars.user_id = auth.uid()
    )
  );

-- Permitir UPDATE: apenas proprietário
CREATE POLICY "pillar_shares_update_policy" ON pillar_shares
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Permitir DELETE: apenas proprietário
CREATE POLICY "pillar_shares_delete_policy" ON pillar_shares
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ========================================
-- PRONTO! Agora deve funcionar
-- ========================================
-- Teste: https://lifosmvp.netlify.app
-- ========================================
