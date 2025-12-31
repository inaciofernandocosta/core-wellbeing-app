import { useState } from "react";
import { ChevronLeft, Plus, Check, Target, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  milestones: { id: string; text: string; completed: boolean }[];
  createdAt: Date;
}

const PersonalLife = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Aprender um novo idioma",
      description: "Estudar espanhol 30 minutos por dia",
      progress: 40,
      milestones: [
        { id: "1", text: "Completar nível básico", completed: true },
        { id: "2", text: "Assistir série sem legenda", completed: false },
        { id: "3", text: "Conversar com nativo", completed: false },
      ],
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Ler 24 livros este ano",
      description: "2 livros por mês",
      progress: 25,
      milestones: [
        { id: "1", text: "6 livros lidos", completed: true },
        { id: "2", text: "12 livros lidos", completed: false },
        { id: "3", text: "24 livros lidos", completed: false },
      ],
      createdAt: new Date(),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      progress: 0,
      milestones: [],
      createdAt: new Date(),
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: "", description: "" });
    setIsDialogOpen(false);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = updatedMilestones.length > 0 
          ? Math.round((completedCount / updatedMilestones.length) * 100) 
          : 0;
        return { ...goal, milestones: updatedMilestones, progress };
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        {/* Header */}
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="h-10 w-10 rounded-xl bg-card ring-1 ring-border/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Vida Pessoal</h1>
              <p className="text-muted-foreground text-sm">Suas metas pessoais</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-card rounded-2xl p-5 ring-1 ring-border/50 shadow-card dark:shadow-card-dark">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Progresso geral</span>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                {goals.length > 0 
                  ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
                  : 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              {goals.length} {goals.length === 1 ? 'meta ativa' : 'metas ativas'}
            </p>
          </div>
        </header>

        {/* Goals List */}
        <main className="flex-1 px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Suas Metas</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Meta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Título da meta"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Descrição (opcional)"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddGoal}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                  >
                    Adicionar Meta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {goals.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 ring-1 ring-border/50 text-center">
              <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhuma meta ainda</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Adicione sua primeira meta pessoal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div 
                  key={goal.id}
                  className="bg-card rounded-2xl ring-1 ring-border/50 shadow-card dark:shadow-card-dark overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{goal.description}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500 shrink-0">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-3">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </button>

                  {expandedGoal === goal.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/50">
                      {goal.milestones.length > 0 ? (
                        <div className="space-y-2">
                          {goal.milestones.map((milestone) => (
                            <button
                              key={milestone.id}
                              onClick={() => toggleMilestone(goal.id, milestone.id)}
                              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                            >
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                milestone.completed 
                                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 border-transparent' 
                                  : 'border-muted-foreground/30'
                              }`}>
                                {milestone.completed && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {milestone.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-2">Sem marcos definidos</p>
                      )}
                      
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-destructive text-sm font-medium py-2 rounded-xl hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir meta
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </>
  );
};

export default PersonalLife;
