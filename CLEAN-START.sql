-- ========================================
-- LIMPAR TUDO E COMEÇAR DO ZERO
-- ========================================

-- Remover TODAS as políticas existentes dinamicamente
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pillars') LOOP
        EXECUTE 'DROP POLICY "' || r.policyname || '" ON pillars';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pillar_shares') LOOP
        EXECUTE 'DROP POLICY "' || r.policyname || '" ON pillar_shares';
    END LOOP;
END $$;

-- ========================================
-- CRIAR POLÍTICAS NOVAS (nomes únicos)
-- ========================================

-- PILLAR_SHARES
CREATE POLICY "pshare_sel" ON pillar_shares FOR SELECT USING (true);
CREATE POLICY "pshare_ins" ON pillar_shares FOR INSERT WITH CHECK (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM pillars WHERE pillars.id = pillar_shares.pillar_id AND pillars.user_id = auth.uid()));
CREATE POLICY "pshare_upd" ON pillar_shares FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "pshare_del" ON pillar_shares FOR DELETE USING (auth.uid() = owner_id);

-- PILLARS
CREATE POLICY "pill_sel" ON pillars FOR SELECT USING (auth.uid() = user_id OR is_default = true OR EXISTS (SELECT 1 FROM pillar_shares WHERE pillar_shares.pillar_id = pillars.id));
CREATE POLICY "pill_ins" ON pillars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pill_upd" ON pillars FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM pillar_shares WHERE pillar_shares.pillar_id = pillars.id AND pillar_shares.shared_with_user_id = auth.uid() AND pillar_shares.permission = 'edit'));
CREATE POLICY "pill_del" ON pillars FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- ========================================
-- PRONTO!
-- ========================================
