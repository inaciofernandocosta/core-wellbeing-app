-- ========================================
-- FIX: Permitir acesso PÚBLICO aos compartilhamentos
-- ========================================
-- O problema é que usuários não autenticados não conseguem
-- acessar a tabela pillar_shares por causa do RLS
-- ========================================

-- 1. Remover políticas antigas de pillar_shares
DROP POLICY IF EXISTS "Shared users can view shares with them" ON pillar_shares;
DROP POLICY IF EXISTS "Public can view shares by token" ON pillar_shares;

-- 2. CRÍTICO: Permitir acesso PÚBLICO por token (sem autenticação)
CREATE POLICY "Public can view shares by token"
  ON pillar_shares FOR SELECT
  USING (share_token IS NOT NULL);

-- 3. Manter política para usuários autenticados verem seus compartilhamentos
-- (já existe, não precisa recriar)

-- 4. Remover políticas antigas de pillars
DROP POLICY IF EXISTS "Users can view shared pillars" ON pillars;

-- 5. CRÍTICO: Permitir acesso PÚBLICO aos pilares compartilhados
CREATE POLICY "Users can view shared pillars"
  ON pillars FOR SELECT
  USING (
    -- Proprietário pode ver
    user_id = auth.uid() 
    OR
    -- OU pilar está compartilhado (acesso público via token)
    EXISTS (
      SELECT 1 FROM pillar_shares
      WHERE pillar_shares.pillar_id = pillars.id
      AND pillar_shares.share_token IS NOT NULL
    )
  );

-- ========================================
-- PRONTO! Agora usuários não autenticados podem:
-- 1. Buscar compartilhamento por token
-- 2. Ver o pilar compartilhado
-- ========================================
