import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Loader2, Target, Award, Pencil, Check, Trash2, Share2 } from "lucide-react";
import SharePillarModal from "@/components/SharePillarModal";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  category: string;
  points: number;
  target_points: number;
  completed: boolean;
  user_id: string;
}

interface Pillar {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  user_id: string;
  is_default: boolean;
  progress?: number;
}

export default function PillarDetail() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Form states
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("pessoal");
  const [newGoalTargetPoints, setNewGoalTargetPoints] = useState(100);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingPillarName, setEditingPillarName] = useState(false);
  const [pillarName, setPillarName] = useState("");

  const load = async () => {
    if (!pillarId) return;
    setLoading(true);
    setError(null);

    const { data: pillarData, error: pillarError } = await supabase
      .from("pillars")
      .select("*")
      .eq("id", pillarId)
      .single();

    if (pillarError) {
      setError(pillarError.message);
      setLoading(false);
      return;
    }

    setPillar(pillarData);
    setPillarName(pillarData?.name || "");

    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("id,title,description,progress,category,points,target_points,completed,user_id")
      .eq("pillar_id", pillarId);

    if (!goalsError && goalsData) setGoals(goalsData);
    if (!goalsError && goalsData) {
      void updatePillarProgress(goalsData);
    }
    setLoading(false);
  };

  const updatePillarProgress = async (goalsData: Goal[]) => {
    if (!pillarId || goalsData.length === 0) return;
    const totalProgress = goalsData.reduce((sum, goal) => sum + goal.progress, 0);
    const avgProgress = Math.round(totalProgress / goalsData.length);
    const { error } = await supabase
      .from("pillars")
      .update({ progress: avgProgress })
      .eq("id", pillarId);
    if (error) console.error("Error updating pillar progress:", error);
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim() || !pillarId || !user) return;

    const { error } = await supabase.from("goals").insert({
      title: newGoalTitle,
      description: newGoalDescription,
      category: newGoalCategory,
      target_points: newGoalTargetPoints,
      pillar_id: pillarId,
      user_id: user.id,
      progress: 0,
      completed: false,
      points: 0,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalCategory("pessoal");
    setNewGoalTargetPoints(100);
    setShowAddGoal(false);
    await load();
  };

  const handleUpdateGoal = async (goalId: string, progress: number) => {
    const { error } = await supabase
      .from("goals")
      .update({ progress, completed: progress >= 100 })
      .eq("id", goalId);

    if (error) {
      setError(error.message);
      return;
    }

    await load();
  };

  const handleDeleteGoal = async (goalId: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
  };

  const handleDeletePillar = async () => {
    if (!pillarId) return;
    const { error } = await supabase.from("pillars").delete().eq("id", pillarId);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/pillars");
  };

  const handleUpdatePillarName = async () => {
    if (!pillarName.trim() || !pillarId) return;
    const { error } = await supabase
      .from("pillars")
      .update({ name: pillarName })
      .eq("id", pillarId);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingPillarName(false);
    await load();
  };

  useEffect(() => {
    void load();
  }, [pillarId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pessoal":
        return <Target className="w-5 h-5 text-blue-500" />;
      case "profissional":
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-background">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erro: {error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-card ring-1 ring-border/50 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground text-sm font-medium">Pilar</p>
              <div className="flex items-center gap-2">
                {editingPillarName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pillarName}
                      onChange={(e) => setPillarName(e.target.value)}
                      className="text-2xl font-bold text-foreground bg-transparent border-b border-border focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdatePillarName}
                      className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {pillar?.name || "Carregando..."}
                    </h1>
                    {pillar && !pillar.is_default && (
                      <>
                        <button
                          onClick={() => setShareModalOpen(true)}
                          className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                          aria-label="Compartilhar pilar"
                        >
                          <Share2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setEditingPillarName(true)}
                          className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                          aria-label="Editar nome do pilar"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="h-8 w-8 rounded-full hover:bg-destructive/10 flex items-center justify-center"
                          aria-label="Excluir pilar"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {pillar?.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {pillar.description}
            </p>
          )}
        </header>

        <main className="flex-1 px-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Progresso</h2>
              <span className="text-sm text-muted-foreground">
                {pillar?.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${pillar?.progress || 0}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Metas</h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                Adicionar Meta
              </button>
            </div>

            {showAddGoal && (
              <div className="mb-4 p-4 bg-card rounded-lg border border-border">
                <input
                  type="text"
                  placeholder="Título da meta"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-3 focus:outline-none focus:border-primary"
                />
                <textarea
                  placeholder="Descrição (opcional)"
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-3 focus:outline-none focus:border-primary resize-none"
                  rows={3}
                />
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-3 focus:outline-none focus:border-primary"
                >
                  <option value="pessoal">Pessoal</option>
                  <option value="profissional">Profissional</option>
                </select>
                <input
                  type="number"
                  placeholder="Pontos alvo"
                  value={newGoalTargetPoints}
                  onChange={(e) => setNewGoalTargetPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-3 focus:outline-none focus:border-primary"
                  min="1"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddGoal}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setShowAddGoal(false);
                      setNewGoalTitle("");
                      setNewGoalDescription("");
                      setNewGoalCategory("pessoal");
                      setNewGoalTargetPoints(100);
                    }}
                    className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="mt-1">{getCategoryIcon(goal.category)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 flex items-center justify-center flex-shrink-0"
                      aria-label="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Progresso
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          goal.completed ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateGoal(goal.id, Math.max(0, goal.progress - 10))}
                        className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90 transition-colors"
                      >
                        -10%
                      </button>
                      <button
                        onClick={() => handleUpdateGoal(goal.id, Math.min(100, goal.progress + 10))}
                        className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => handleUpdateGoal(goal.id, 100)}
                        className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Completo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {goals.length === 0 && !showAddGoal && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma meta ainda</p>
                <p className="text-sm text-muted-foreground">
                  Adicione sua primeira meta para começar
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav />

      {pillar && (
        <SharePillarModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          pillarId={pillar.id}
          pillarName={pillar.name}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Excluir Pilar
            </h3>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja excluir este pilar? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePillar}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
