-- Adicionar campo recurring_group_id para identificar eventos da mesma série recorrente

ALTER TABLE schedule_events 
ADD COLUMN IF NOT EXISTS recurring_group_id UUID;

-- Criar índice para performance em consultas de eventos recorrentes
CREATE INDEX IF NOT EXISTS idx_schedule_events_recurring_group 
ON schedule_events(recurring_group_id) 
WHERE recurring_group_id IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN schedule_events.recurring_group_id IS 
'UUID que agrupa eventos da mesma série recorrente. Eventos criados juntos (ex: academia seg/qua/sex) compartilham o mesmo recurring_group_id';
