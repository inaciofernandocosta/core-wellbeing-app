-- Script para corrigir transações e usar target_points em vez de points

-- 1. Deletar todas as transações de crédito existentes
DELETE FROM points_transactions WHERE type = 'credit';

-- 2. Resetar saldo de pontos (será recalculado ao marcar as metas novamente)
UPDATE profiles SET points_balance = 0;

-- 3. Verificar resultado
SELECT 
  p.id,
  p.full_name,
  p.points_balance,
  COUNT(pt.id) as total_transacoes
FROM profiles p
LEFT JOIN points_transactions pt ON pt.user_id = p.id
GROUP BY p.id, p.full_name, p.points_balance;

-- Após executar este script:
-- 1. Vá até o pilar de recompensas
-- 2. Desmarque todas as metas (clique no ✓ verde)
-- 3. Marque novamente as metas que deseja
-- 4. Agora os pontos serão creditados com os valores de target_points corretos
