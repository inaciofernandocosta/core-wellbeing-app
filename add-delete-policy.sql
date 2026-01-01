-- Adicionar política de DELETE para permitir que usuários excluam suas próprias transações
CREATE POLICY "Users can delete own transactions"
  ON points_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'points_transactions';
