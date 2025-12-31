import { useState } from "react";
import { ChevronLeft, Plus, Check, Calendar, Repeat, Link2, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TimeHorizon = "today" | "week" | "month" | "year";
type TaskType = "task" | "habit";

interface Task {
  id: string;
  title: string;
  type: TaskType;
  horizon: TimeHorizon;
  completed: boolean;
  linkedTo?: string; // ID of parent task in larger horizon
  pillar?: string;
  time?: string;
  frequency?: string; // For habits: "daily", "weekly", etc.
}

const horizonLabels: Record<TimeHorizon, string> = {
  today: "Hoje",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

const horizonDescriptions: Record<TimeHorizon, string> = {
  today: "O que você vai fazer agora",
  week: "Suas prioridades da semana",
  month: "Metas de curto prazo",
  year: "Sua visão estratégica",
};

const pillarColors: Record<string, string> = {
  "Vida Pessoal": "from-rose-500 to-pink-500",
  "Trabalho": "from-blue-500 to-cyan-500",
  "Saúde": "from-primary to-emerald-400",
  "Família": "from-amber-500 to-orange-500",
  "Objetivos": "from-violet-500 to-purple-500",
};

const Tasks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TimeHorizon>("today");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([
    // Today
    { id: "1", title: "Meditar 10 minutos", type: "habit", horizon: "today", completed: true, pillar: "Saúde", frequency: "daily" },
    { id: "2", title: "Reunião de equipe", type: "task", horizon: "today", completed: false, pillar: "Trabalho", time: "14:00" },
    { id: "3", title: "Treino na academia", type: "habit", horizon: "today", completed: false, pillar: "Saúde", frequency: "daily" },
    { id: "4", title: "Estudar espanhol", type: "habit", horizon: "today", completed: false, pillar: "Vida Pessoal", frequency: "daily", linkedTo: "w1" },
    // Week
    { id: "w1", title: "Estudar espanhol 5x", type: "task", horizon: "week", completed: false, pillar: "Vida Pessoal", linkedTo: "m1" },
    { id: "w2", title: "Finalizar relatório", type: "task", horizon: "week", completed: false, pillar: "Trabalho" },
    { id: "w3", title: "3 treinos de força", type: "task", horizon: "week", completed: false, pillar: "Saúde" },
    // Month
    { id: "m1", title: "Completar módulo básico espanhol", type: "task", horizon: "month", completed: false, pillar: "Vida Pessoal", linkedTo: "y1" },
    { id: "m2", title: "Ler 2 livros", type: "task", horizon: "month", completed: false, pillar: "Vida Pessoal" },
    { id: "m3", title: "Economizar R$500", type: "task", horizon: "month", completed: false, pillar: "Objetivos" },
    // Year
    { id: "y1", title: "Aprender espanhol fluente", type: "task", horizon: "year", completed: false, pillar: "Vida Pessoal" },
    { id: "y2", title: "Ler 24 livros", type: "task", horizon: "year", completed: false, pillar: "Vida Pessoal" },
    { id: "y3", title: "Conseguir promoção", type: "task", horizon: "year", completed: false, pillar: "Trabalho" },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    type: "task" as TaskType,
    pillar: "",
    linkedTo: "",
  });

  const getTasksForHorizon = (horizon: TimeHorizon) => 
    tasks.filter(t => t.horizon === horizon);

  const getParentTasks = (currentHorizon: TimeHorizon): Task[] => {
    const horizonOrder: TimeHorizon[] = ["today", "week", "month", "year"];
    const currentIndex = horizonOrder.indexOf(currentHorizon);
    if (currentIndex >= horizonOrder.length - 1) return [];
    
    const parentHorizon = horizonOrder[currentIndex + 1];
    return tasks.filter(t => t.horizon === parentHorizon && !t.completed);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      type: newTask.type,
      horizon: activeTab,
      completed: false,
      pillar: newTask.pillar || undefined,
      linkedTo: newTask.linkedTo || undefined,
      frequency: newTask.type === "habit" ? "daily" : undefined,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", type: "task", pillar: "", linkedTo: "" });
    setIsDialogOpen(false);
    setShowLinkOptions(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getLinkedParent = (task: Task): Task | undefined => {
    if (!task.linkedTo) return undefined;
    return tasks.find(t => t.id === task.linkedTo);
  };

  const getCompletionStats = (horizon: TimeHorizon) => {
    const horizonTasks = getTasksForHorizon(horizon);
    const completed = horizonTasks.filter(t => t.completed).length;
    return { completed, total: horizonTasks.length };
  };

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-hidden max-w-md mx-auto bg-background">
        {/* Header */}
        <header className="px-6 pt-12 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="h-10 w-10 rounded-xl bg-card ring-1 ring-border/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
              <p className="text-muted-foreground text-sm">Organize sua rotina</p>
            </div>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-emerald-400 flex items-center justify-center shadow-neon hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TimeHorizon)} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <TabsList className="w-full bg-card ring-1 ring-border/50 p-1 rounded-xl">
              {(Object.keys(horizonLabels) as TimeHorizon[]).map((horizon) => {
                const stats = getCompletionStats(horizon);
                return (
                  <TabsTrigger 
                    key={horizon} 
                    value={horizon}
                    className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"
                  >
                    <span>{horizonLabels[horizon]}</span>
                    {stats.total > 0 && (
                      <span className="ml-1 opacity-70">
                        {stats.completed}/{stats.total}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {(Object.keys(horizonLabels) as TimeHorizon[]).map((horizon) => (
            <TabsContent 
              key={horizon} 
              value={horizon}
              className="flex-1 overflow-y-auto no-scrollbar px-6 pb-28 mt-4"
            >
              {/* Horizon Description */}
              <p className="text-muted-foreground text-sm mb-4">{horizonDescriptions[horizon]}</p>

              {/* Tasks List */}
              <div className="space-y-3">
                {getTasksForHorizon(horizon).length === 0 ? (
                  <div className="bg-card rounded-2xl p-8 ring-1 ring-border/50 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhuma tarefa</p>
                    <p className="text-muted-foreground/70 text-sm mt-1">Adicione sua primeira tarefa</p>
                  </div>
                ) : (
                  getTasksForHorizon(horizon).map((task) => {
                    const linkedParent = getLinkedParent(task);
                    return (
                      <div 
                        key={task.id}
                        className={`bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark transition-all ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className={`h-6 w-6 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              task.completed 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground/30 hover:border-primary'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {task.type === "habit" && (
                                <Repeat className="w-3.5 h-3.5 text-primary shrink-0" />
                              )}
                              <h3 className={`font-semibold text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.title}
                              </h3>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {task.pillar && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${pillarColors[task.pillar] || 'from-gray-500 to-gray-600'} text-white`}>
                                  {task.pillar}
                                </span>
                              )}
                              {task.time && (
                                <span className="text-xs text-muted-foreground">{task.time}</span>
                              )}
                              {linkedParent && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  {linkedParent.title}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Add Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[350px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Nova Tarefa - {horizonLabels[activeTab]}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="O que você precisa fazer?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />

              {/* Task Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setNewTask({ ...newTask, type: "task" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    newTask.type === "task" 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Tarefa
                </button>
                <button
                  onClick={() => setNewTask({ ...newTask, type: "habit" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    newTask.type === "habit" 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  Hábito
                </button>
              </div>

              {/* Pillar Selection */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Pilar (opcional)</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(pillarColors).map((pillar) => (
                    <button
                      key={pillar}
                      onClick={() => setNewTask({ ...newTask, pillar: newTask.pillar === pillar ? "" : pillar })}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        newTask.pillar === pillar
                          ? `bg-gradient-to-r ${pillarColors[pillar]} text-white`
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Parent Task */}
              {activeTab !== "year" && (
                <div>
                  <button
                    onClick={() => setShowLinkOptions(!showLinkOptions)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Vincular a tarefa maior</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLinkOptions ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showLinkOptions && (
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {getParentTasks(activeTab).length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">Nenhuma tarefa disponível para vincular</p>
                      ) : (
                        getParentTasks(activeTab).map((parent) => (
                          <button
                            key={parent.id}
                            onClick={() => setNewTask({ ...newTask, linkedTo: newTask.linkedTo === parent.id ? "" : parent.id })}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                              newTask.linkedTo === parent.id
                                ? 'bg-primary/20 text-foreground ring-1 ring-primary'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {parent.title}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleAddTask}
                className="w-full bg-gradient-to-r from-primary to-emerald-400 hover:from-primary/90 hover:to-emerald-400/90"
              >
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNav />
    </>
  );
};

export default Tasks;
