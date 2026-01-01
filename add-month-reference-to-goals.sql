-- Adicionar campo de mês de referência nas metas
-- Permite que metas sejam organizadas por mês ou marcadas como fixas (recorrentes)

-- 1. Adicionar coluna month_reference (formato YYYY-MM ou NULL para metas fixas)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS month_reference VARCHAR(7);

-- 2. Criar índice para performance em consultas por mês
CREATE INDEX IF NOT EXISTS idx_goals_month_reference ON goals(month_reference);

-- 3. Comentário para documentação
COMMENT ON COLUMN goals.month_reference IS 'Mês de referência da meta (YYYY-MM) ou NULL para metas fixas/recorrentes';

-- 4. Verificar resultado
SELECT 
  id, 
  title, 
  month_reference,
  completed,
  created_at
FROM goals
ORDER BY month_reference DESC NULLS LAST, created_at DESC
LIMIT 10;
