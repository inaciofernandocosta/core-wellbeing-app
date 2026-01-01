-- ========================================
-- Compartilhamento apenas para usuários autenticados (por email/ID)
-- ========================================
-- Executar este script no Supabase SQL Editor
-- ========================================

-- 1) Remover todas as políticas existentes
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pillar_shares') LOOP
    EXECUTE 'DROP POLICY "' || r.policyname || '" ON pillar_shares';
  END LOOP;
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pillars') LOOP
    EXECUTE 'DROP POLICY "' || r.policyname || '" ON pillars';
  END LOOP;
END $$;

-- 2) Policies pillar_shares (somente autenticados)
-- Leitura: owner OU usuário compartilhado (id) OU email compartilhado
CREATE POLICY "ps_auth_select" ON pillar_shares
FOR SELECT
USING (
  auth.uid() = owner_id OR
  auth.uid() = shared_with_user_id OR
  auth.email() = shared_with_email
);

CREATE POLICY "ps_auth_insert" ON pillar_shares
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (SELECT 1 FROM pillars WHERE pillars.id = pillar_shares.pillar_id AND pillars.user_id = auth.uid())
);

CREATE POLICY "ps_auth_update" ON pillar_shares
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "ps_auth_delete" ON pillar_shares
FOR DELETE
USING (auth.uid() = owner_id);

-- 3) Policies pillars
-- Leitura: dono OU pilar padrão OU compartilhado com usuário/email
CREATE POLICY "p_auth_select" ON pillars
FOR SELECT
USING (
  auth.uid() = user_id OR
  is_default = true OR
  EXISTS (
    SELECT 1 FROM pillar_shares
    WHERE pillar_shares.pillar_id = pillars.id
    AND (
      pillar_shares.owner_id = auth.uid() OR
      pillar_shares.shared_with_user_id = auth.uid() OR
      pillar_shares.shared_with_email = auth.email()
    )
  )
);

CREATE POLICY "p_auth_insert" ON pillars
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "p_auth_update" ON pillars
FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM pillar_shares
    WHERE pillar_shares.pillar_id = pillars.id
    AND pillar_shares.shared_with_user_id = auth.uid()
    AND pillar_shares.permission = 'edit'
  )
);

CREATE POLICY "p_auth_delete" ON pillars
FOR DELETE
USING (auth.uid() = user_id AND is_default = false);

-- 4) Grants: apenas authenticated
GRANT SELECT ON pillar_shares TO authenticated;
GRANT INSERT, UPDATE, DELETE ON pillar_shares TO authenticated;
GRANT SELECT ON pillars TO authenticated;

-- Se quiser permitir anon (não recomendado neste modo), remova os GRANTs para anon e mantenha apenas authenticated.
-- ========================================
-- Após executar, gere um novo compartilhamento e teste logando com o email compartilhado.
-- ========================================
