-- Corrigir tabela schedule_events para usar pillar_id em vez de pillar TEXT

-- 1. Adicionar nova coluna pillar_id
ALTER TABLE schedule_events 
ADD COLUMN IF NOT EXISTS pillar_id UUID REFERENCES pillars(id) ON DELETE SET NULL;

-- 2. Remover constraint antiga da coluna pillar (se existir)
ALTER TABLE schedule_events 
DROP CONSTRAINT IF EXISTS schedule_events_pillar_check;

-- 3. Tornar pillar nullable (para migração)
ALTER TABLE schedule_events 
ALTER COLUMN pillar DROP NOT NULL;

-- 4. Migrar dados existentes (se houver)
-- Mapear valores antigos para IDs dos pilares default
UPDATE schedule_events 
SET pillar_id = (
  SELECT id FROM pillars 
  WHERE LOWER(name) = CASE 
    WHEN pillar = 'vida' THEN 'vida pessoal'
    WHEN pillar = 'trabalho' THEN 'trabalho'
    WHEN pillar = 'saude' THEN 'saúde'
    WHEN pillar = 'familia' THEN 'família'
    WHEN pillar = 'objetivos' THEN 'objetivos'
  END
  AND is_default = true
  LIMIT 1
)
WHERE pillar IS NOT NULL AND pillar_id IS NULL;

-- 5. Remover coluna pillar antiga (opcional - comentado para segurança)
-- ALTER TABLE schedule_events DROP COLUMN pillar;

-- 6. Tornar pillar_id obrigatório
ALTER TABLE schedule_events 
ALTER COLUMN pillar_id SET NOT NULL;

-- 7. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_pillar_id ON schedule_events(pillar_id);
