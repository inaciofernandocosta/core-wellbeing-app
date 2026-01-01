-- Script para creditar pontos de metas já completadas
-- Execute este script UMA ÚNICA VEZ após criar a tabela points_transactions

-- 1. Criar função para processar metas completadas
CREATE OR REPLACE FUNCTION migrate_completed_goals_points()
RETURNS void AS $$
DECLARE
  goal_record RECORD;
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Para cada meta completada que tem pontos
  FOR goal_record IN 
    SELECT g.id, g.user_id, g.title, g.category, g.points, g.completed
    FROM goals g
    WHERE g.completed = true 
      AND g.points IS NOT NULL 
      AND g.points > 0
      AND NOT EXISTS (
        -- Verificar se já não foi creditada
        SELECT 1 FROM points_transactions pt 
        WHERE pt.goal_id = g.id AND pt.type = 'credit'
      )
  LOOP
    -- Buscar saldo atual do usuário
    SELECT COALESCE(points_balance, 0) INTO current_balance
    FROM profiles
    WHERE id = goal_record.user_id;
    
    -- Calcular novo saldo
    new_balance := current_balance + goal_record.points;
    
    -- Inserir transação de crédito
    INSERT INTO points_transactions (
      user_id,
      type,
      amount,
      description,
      goal_id,
      balance_after,
      created_at
    ) VALUES (
      goal_record.user_id,
      'credit',
      goal_record.points,
      'Meta ' || goal_record.category || ' completada: ' || goal_record.title,
      goal_record.id,
      new_balance,
      NOW()
    );
    
    -- Atualizar saldo no perfil
    UPDATE profiles
    SET points_balance = new_balance
    WHERE id = goal_record.user_id;
    
    RAISE NOTICE 'Creditado % pontos para usuário % (meta: %)', 
      goal_record.points, goal_record.user_id, goal_record.title;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Executar a migração
SELECT migrate_completed_goals_points();

-- 3. Remover a função (opcional, para limpeza)
DROP FUNCTION IF EXISTS migrate_completed_goals_points();

-- 4. Verificar resultado
SELECT 
  p.id as user_id,
  p.points_balance,
  COUNT(pt.id) as total_transactions,
  SUM(CASE WHEN pt.type = 'credit' THEN pt.amount ELSE 0 END) as total_credits,
  SUM(CASE WHEN pt.type = 'debit' THEN pt.amount ELSE 0 END) as total_debits
FROM profiles p
LEFT JOIN points_transactions pt ON pt.user_id = p.id
GROUP BY p.id, p.points_balance;
