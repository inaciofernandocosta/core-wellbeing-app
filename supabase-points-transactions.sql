-- Tabela de transações de pontos (extrato da conta corrente)
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  balance_after INTEGER NOT NULL,
  redeem_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(type);

-- RLS policies
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions"
  ON points_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias transações
CREATE POLICY "Users can insert own transactions"
  ON points_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adicionar campo de saldo de pontos na tabela de perfis (se não existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON TABLE points_transactions IS 'Extrato de movimentações de pontos do clube de fidelidade';
COMMENT ON COLUMN points_transactions.type IS 'Tipo de transação: credit (ganho) ou debit (resgate)';
COMMENT ON COLUMN points_transactions.amount IS 'Quantidade de pontos da transação';
COMMENT ON COLUMN points_transactions.description IS 'Descrição da transação (ex: Meta Bronze completada, Resgate de prêmio X)';
COMMENT ON COLUMN points_transactions.goal_id IS 'Referência à meta que gerou os pontos (se aplicável)';
COMMENT ON COLUMN points_transactions.balance_after IS 'Saldo após a transação';
COMMENT ON COLUMN points_transactions.redeem_date IS 'Data prevista para o resgate (apenas para débitos)';
