-- ATENÇÃO: Este script vai LIMPAR todas as transações e resetar o saldo
-- Execute apenas se quiser começar do zero

-- 1. Deletar todas as transações de pontos
DELETE FROM points_transactions;

-- 2. Resetar saldo de todos os usuários para 0
UPDATE profiles SET points_balance = 0;

-- 3. Verificar resultado
SELECT id, full_name, points_balance FROM profiles;

-- Após executar este script:
-- - Vá até o pilar de recompensas
-- - Desmarque todas as metas (clique no ✓ verde)
-- - Marque novamente as metas que deseja
-- - Os pontos serão creditados corretamente
