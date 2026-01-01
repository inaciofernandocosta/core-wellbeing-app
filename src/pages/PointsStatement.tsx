import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Loader2, Plus, Minus, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePillars } from "@/hooks/usePillars";

type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  balance_after: number;
  created_at: string;
  goal_id?: string | null;
  redeem_date?: string | null;
};

const PointsStatement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pillars, loading: loadingPillars, error: pillarsError } = usePillars();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemDescription, setRedeemDescription] = useState("");
  const [redeemDate, setRedeemDate] = useState(() => {
    // Definir data atual como padrão no formato YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [redeeming, setRedeeming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRedeemAmount, setPendingRedeemAmount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Buscar soma dos target_points das metas completadas (créditos)
    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("target_points, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

    if (goalsError) {
      setError(goalsError.message);
      setLoading(false);
      return;
    }

    const totalCredits = (goalsData ?? []).reduce((sum, goal) => sum + (goal.target_points ?? 0), 0);

    // Buscar transações
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (transactionsError) {
      setError(transactionsError.message);
      setLoading(false);
      return;
    }

    setTransactions(transactionsData || []);

    // Buscar recompensas do usuário
    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("points_cost", { ascending: true });

    setRewards(rewardsData || []);

    // Calcular resgates
    const totalDebits = (transactionsData ?? [])
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    // Saldo = Créditos - Resgates
    const currentBalance = totalCredits - totalDebits;
    setBalance(currentBalance);

    setLoading(false);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = Number(redeemAmount);
    if (!amount || amount <= 0) {
      setError("Informe um valor válido");
      return;
    }

    if (!redeemDescription.trim()) {
      setError("Informe a descrição do resgate");
      return;
    }

    if (!redeemDate) {
      setError("Informe a data do resgate");
      return;
    }

    // Se o resgate resultar em saldo negativo, mostrar modal de confirmação
    if (amount > balance) {
      setPendingRedeemAmount(amount);
      setShowConfirmModal(true);
      return;
    }

    // Processar resgate normalmente
    await processRedeem(amount);
  };

  const processRedeem = async (amount: number) => {
    if (!user) return;

    setRedeeming(true);
    setError(null);

    const newBalance = balance - amount;

    // Inserir transação de débito
    const { error: transactionError } = await supabase
      .from("points_transactions")
      .insert({
        user_id: user.id,
        type: "debit",
        amount,
        description: redeemDescription.trim(),
        balance_after: newBalance,
        redeem_date: redeemDate,
      });

    if (transactionError) {
      setError(transactionError.message);
      setRedeeming(false);
      return;
    }

    // Atualizar saldo no perfil
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("id", user.id);

    setRedeeming(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRedeemAmount("");
    setRedeemDescription("");
    setRedeemDate(new Date().toISOString().split('T')[0]);
    setShowRedeemForm(false);
    setShowConfirmModal(false);
    await loadData();
  };

  const confirmNegativeBalance = async () => {
    await processRedeem(pendingRedeemAmount);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    
    setDeletingId(transactionId);
    
    const { error: deleteError } = await supabase
      .from("points_transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", user.id);
    
    setDeletingId(null);
    
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    
    // Recarregar dados após exclusão
    await loadData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMonthYear = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  // Gerar lista de meses disponíveis baseado nas transações
  const availableMonths = Array.from(
    new Set(
      transactions.map((t) => {
        const date = new Date(t.created_at);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // Mais recente primeiro

  // Adicionar mês atual se não existir na lista
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  if (!availableMonths.includes(currentMonth)) {
    availableMonths.unshift(currentMonth);
  }

  // Filtrar transações pelo mês selecionado
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.created_at);
    const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    return transactionMonth === selectedMonth;
  });

  // Créditos = soma dos target_points das metas completadas
  const totalCredits = balance;

  // Resgates = soma das transações de débito do mês selecionado
  const totalDebits = filteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const hasCustomPillar = pillars.some((p) => !p.is_default);

  const formatMonth = (value: string) => {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Você precisa estar logado para ver o extrato.</p>
      </div>
    );
  }

  if (loading || loadingPillars) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Carregando...
      </div>
    );
  }

  if (!hasCustomPillar) {
    return (
      <>
        <div className="min-h-screen w-full max-w-md mx-auto bg-background text-foreground flex flex-col">
          <header className="flex items-center gap-3 px-4 py-4 border-b border-border/60">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">Clube de Fidelidade</p>
              <h1 className="text-lg font-semibold">Extrato de Pontos</h1>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 text-center space-y-2">
              <p className="font-semibold">Nenhum pilar personalizado ainda</p>
              <p className="text-sm text-muted-foreground">
                Crie seu primeiro pilar para habilitar o Clube de Fidelidade e acompanhar seu extrato de pontos.
              </p>
              <Button onClick={() => navigate("/pillars")} className="w-full mt-2">
                Criar pilar
              </Button>
            </div>
          </main>
        </div>
        <BottomNav />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive px-6 text-center">
        <div>
          <p className="font-semibold">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-card ring-1 ring-border/50 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Clube de Fidelidade</p>
              <h1 className="text-2xl font-bold text-foreground">Extrato de Pontos</h1>
            </div>
          </div>

          {/* Card de Saldo */}
          <div className="bg-gradient-to-br from-primary to-primary-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <p className="text-sm opacity-90">Saldo Atual</p>
            </div>
            <p className="text-4xl font-bold mb-4">{balance.toLocaleString("pt-BR")} pts</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 opacity-90 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Créditos</span>
                </div>
                <p className="font-semibold">{totalCredits.toLocaleString("pt-BR")} pts</p>
              </div>
              <div>
                <div className="flex items-center gap-1 opacity-90 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>Resgates</span>
                </div>
                <p className="font-semibold">{totalDebits.toLocaleString("pt-BR")} pts</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 space-y-6">
          {/* Botão de Resgate */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowRedeemForm((v) => !v)}
            >
              {showRedeemForm ? "Fechar" : "Resgatar Pontos"}
            </Button>
          </div>

          {/* Formulário de Resgate */}
          {showRedeemForm && (
            <form onSubmit={handleRedeem} className="space-y-3 bg-card/50 border border-border/60 rounded-2xl p-4">
              <h3 className="font-semibold text-foreground">Resgatar Pontos</h3>
              
              {rewards.length === 0 ? (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Você ainda não configurou suas recompensas.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => navigate("/rewards")}
                    className="gap-2"
                  >
                    Configurar Recompensas
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Escolha sua recompensa</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    onChange={(e) => {
                      const rewardId = e.target.value;
                      if (rewardId) {
                        const reward = rewards.find(r => r.id === rewardId);
                        if (reward) {
                          setRedeemAmount(String(reward.points_cost));
                          setRedeemDescription(`${reward.icon || ''} ${reward.name}`.trim());
                        }
                      } else {
                        setRedeemAmount("");
                        setRedeemDescription("");
                      }
                    }}
                    required
                  >
                    <option value="">Selecione uma recompensa</option>
                    {rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.icon} {reward.name} ({reward.points_cost} {reward.points_cost === 1 ? 'ponto' : 'pontos'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Quantidade de pontos</label>
                <Input
                  type="number"
                  min="1"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  required
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Descrição do resgate</label>
                <Input
                  type="text"
                  placeholder="Ex: Prêmio especial"
                  value={redeemDescription}
                  onChange={(e) => setRedeemDescription(e.target.value)}
                  required
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Data do resgate</label>
                <Input
                  type="date"
                  value={redeemDate}
                  onChange={(e) => setRedeemDate(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={redeeming} className="w-full">
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Resgate"}
              </Button>
            </form>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando extrato...
            </div>
          )}

          {/* Extrato */}
          {!loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Movimentações</h2>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {formatMonthYear(month)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação registrada. Complete metas para ganhar pontos!
                </p>
              )}

              {filteredTransactions.length === 0 && transactions.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação neste mês.
                </p>
              )}

              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-card rounded-xl border border-border/60 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <Plus className="w-5 h-5" />
                          ) : (
                            <Minus className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </p>
                          {transaction.type === "debit" && transaction.redeem_date && (
                            <p className="text-xs text-amber-600 font-medium mt-1">
                              📅 Resgate: {new Date(transaction.redeem_date).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === "credit" ? "text-green-600" : "text-rose-500"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {transaction.amount.toLocaleString("pt-BR")} pts
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {transaction.balance_after.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        {transaction.type === "debit" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Excluir resgate"
                          >
                            {deletingId === transaction.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav />

      {/* Modal de Confirmação de Saldo Negativo */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Saldo Insuficiente</h3>
                <p className="text-sm text-muted-foreground">Confirme para continuar</p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo atual:</span>
                <span className="font-semibold text-foreground">{balance.toLocaleString("pt-BR")} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor do resgate:</span>
                <span className="font-semibold text-rose-500">-{pendingRedeemAmount.toLocaleString("pt-BR")} pts</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Novo saldo:</span>
                <span className="font-bold text-rose-500">
                  {(balance - pendingRedeemAmount).toLocaleString("pt-BR")} pts
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Este resgate resultará em um <strong className="text-foreground">saldo negativo</strong>. 
              Tem certeza que deseja continuar?
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
                disabled={redeeming}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmNegativeBalance}
                disabled={redeeming}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Resgate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PointsStatement;
