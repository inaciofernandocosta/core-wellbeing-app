-- Script para verificar e corrigir saldo de pontos

-- 1. Verificar estado atual
SELECT 
  p.id as user_id,
  p.full_name,
  p.points_balance as saldo_atual,
  COUNT(pt.id) as total_transacoes,
  SUM(CASE WHEN pt.type = 'credit' THEN pt.amount ELSE 0 END) as total_creditos,
  SUM(CASE WHEN pt.type = 'debit' THEN pt.amount ELSE 0 END) as total_debitos,
  (SUM(CASE WHEN pt.type = 'credit' THEN pt.amount ELSE 0 END) - 
   SUM(CASE WHEN pt.type = 'debit' THEN pt.amount ELSE 0 END)) as saldo_calculado
FROM profiles p
LEFT JOIN points_transactions pt ON pt.user_id = p.id
GROUP BY p.id, p.full_name, p.points_balance;

-- 2. Ver todas as transações para identificar duplicações
SELECT 
  pt.id,
  pt.type,
  pt.amount,
  pt.description,
  pt.goal_id,
  pt.balance_after,
  pt.created_at,
  g.title as meta_titulo,
  g.points as meta_pontos
FROM points_transactions pt
LEFT JOIN goals g ON g.id = pt.goal_id
ORDER BY pt.created_at DESC;

-- 3. Recalcular saldo correto baseado nas transações
UPDATE profiles p
SET points_balance = (
  SELECT COALESCE(
    SUM(CASE WHEN pt.type = 'credit' THEN pt.amount ELSE -pt.amount END),
    0
  )
  FROM points_transactions pt
  WHERE pt.user_id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM points_transactions pt WHERE pt.user_id = p.id
);

-- 4. Verificar resultado após correção
SELECT 
  p.id as user_id,
  p.full_name,
  p.points_balance as saldo_corrigido,
  COUNT(pt.id) as total_transacoes
FROM profiles p
LEFT JOIN points_transactions pt ON pt.user_id = p.id
GROUP BY p.id, p.full_name, p.points_balance;
