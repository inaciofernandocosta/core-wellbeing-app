-- Criar tabela de eventos da agenda
CREATE TABLE IF NOT EXISTS schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  pillar TEXT NOT NULL CHECK (pillar IN ('vida', 'trabalho', 'saude', 'familia', 'objetivos')),
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  priority TEXT NOT NULL CHECK (priority IN ('alta', 'media', 'baixa')),
  has_time BOOLEAN DEFAULT false,
  start_time TEXT, -- Formato HH:mm
  end_time TEXT,   -- Formato HH:mm
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own schedule events"
  ON schedule_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedule events"
  ON schedule_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule events"
  ON schedule_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule events"
  ON schedule_events FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_user_id ON schedule_events(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(event_date);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_schedule_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schedule_events_updated_at
  BEFORE UPDATE ON schedule_events
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_events_updated_at();
