import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Target, CheckCircle2, Clock, Ruler, Star, FileText } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import BottomNav from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  pillar: string;
  // MARTE criteria
  mensuravel: string;
  alcancavel: string;
  relevante: string;
  temporal: string;
  especifica: string;
  completed: boolean;
}

const pillars = [
  { id: "vida", name: "Vida Pessoal", color: "from-rose-500 to-pink-500" },
  { id: "trabalho", name: "Trabalho", color: "from-blue-500 to-cyan-500" },
  { id: "saude", name: "Saúde", color: "from-primary to-emerald-400" },
  { id: "familia", name: "Família", color: "from-amber-500 to-orange-500" },
  { id: "objetivos", name: "Objetivos", color: "from-violet-500 to-purple-500" },
];

const marteFields = [
  { key: "mensuravel", label: "Mensurável", icon: Ruler, placeholder: "Como você vai medir o progresso?" },
  { key: "alcancavel", label: "Alcançável", icon: Target, placeholder: "É realista com seus recursos atuais?" },
  { key: "relevante", label: "Relevante", icon: Star, placeholder: "Por que essa meta é importante para você?" },
  { key: "temporal", label: "Temporal", icon: Clock, placeholder: "Qual o prazo para alcançar?" },
  { key: "especifica", label: "Específica", icon: FileText, placeholder: "Defina exatamente o que quer alcançar" },
];

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    pillar: "vida",
    mensuravel: "",
    alcancavel: "",
    relevante: "",
    temporal: "",
    especifica: "",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = getDay(monthStart);

  const handleAddGoal = () => {
    if (!newGoal.title || !selectedDate) {
      toast.error("Preencha pelo menos o título e selecione uma data");
      return;
    }

    // Validate MARTE criteria
    const marteFilled = marteFields.every(field => newGoal[field.key as keyof typeof newGoal]);
    if (!marteFilled) {
      toast.error("Preencha todos os critérios MARTE para uma meta eficaz");
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      dueDate: selectedDate,
      pillar: newGoal.pillar,
      mensuravel: newGoal.mensuravel,
      alcancavel: newGoal.alcancavel,
      relevante: newGoal.relevante,
      temporal: newGoal.temporal,
      especifica: newGoal.especifica,
      completed: false,
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: "",
      description: "",
      pillar: "vida",
      mensuravel: "",
      alcancavel: "",
      relevante: "",
      temporal: "",
      especifica: "",
    });
    setIsDialogOpen(false);
    toast.success("Meta MARTE criada com sucesso!");
  };

  const getGoalsForDate = (date: Date) => {
    return goals.filter(goal => isSameDay(goal.dueDate, date));
  };

  const toggleGoalComplete = (goalId: string) => {
    setGoals(goals.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    ));
  };

  const selectedPillar = pillars.find(p => p.id === newGoal.pillar);

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        {/* Header */}
        <header className="px-6 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Agenda</p>
              <h1 className="text-2xl font-bold text-foreground">Metas MARTE</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-neon"
                  onClick={() => {
                    if (!selectedDate) setSelectedDate(new Date());
                  }}
                >
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Nova Meta MARTE
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  {/* MARTE Info Banner */}
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-2">Regra MARTE</p>
                    <p className="text-xs text-muted-foreground">
                      "Se não dá pra medir, não é meta, é desejo."
                    </p>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Meta</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Correr 5km em 30 minutos"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>

                  {/* Pillar Selection */}
                  <div className="space-y-2">
                    <Label>Pilar</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {pillars.map((pillar) => (
                        <button
                          key={pillar.id}
                          onClick={() => setNewGoal({ ...newGoal, pillar: pillar.id })}
                          className={`p-2 rounded-xl text-center transition-all ${
                            newGoal.pillar === pillar.id
                              ? `bg-gradient-to-br ${pillar.color} text-white ring-2 ring-offset-2 ring-offset-background ring-primary`
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          <span className="text-xs font-medium truncate block">
                            {pillar.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Display */}
                  <div className="space-y-2">
                    <Label>Data de Conclusão</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione no calendário"}
                      </span>
                    </div>
                  </div>

                  {/* MARTE Fields */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Critérios MARTE</Label>
                    {marteFields.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <Label className="text-sm">{field.label}</Label>
                          </div>
                          <Textarea
                            placeholder={field.placeholder}
                            value={newGoal[field.key as keyof typeof newGoal]}
                            onChange={(e) => setNewGoal({ ...newGoal, [field.key]: e.target.value })}
                            className="min-h-[60px] resize-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <Button 
                    onClick={handleAddGoal}
                    className="w-full bg-gradient-to-r from-primary to-emerald-400 hover:opacity-90"
                  >
                    Criar Meta MARTE
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-8 px-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl bg-card hover:bg-muted transition-colors"
            >
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl bg-card hover:bg-muted transition-colors"
            >
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card rounded-3xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark mb-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: startingDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {days.map((day) => {
                const dayGoals = getGoalsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground'
                        : isToday
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    {dayGoals.length > 0 && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {dayGoals.slice(0, 3).map((goal, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-primary-foreground' : 'bg-primary'
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Goals */}
          {selectedDate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {getGoalsForDate(selectedDate).length} metas
                </span>
              </div>

              {getGoalsForDate(selectedDate).length === 0 ? (
                <div className="bg-card rounded-2xl p-6 ring-1 ring-border/50 text-center">
                  <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Nenhuma meta para este dia</p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Meta MARTE
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getGoalsForDate(selectedDate).map((goal) => {
                    const pillar = pillars.find(p => p.id === goal.pillar);
                    return (
                      <div 
                        key={goal.id}
                        className={`bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark transition-all ${
                          goal.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleGoalComplete(goal.id)}
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                              goal.completed
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground/30 hover:border-primary'
                            }`}
                          >
                            {goal.completed && (
                              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${pillar?.color} text-white`}>
                                {pillar?.name}
                              </span>
                            </div>
                            <h4 className={`font-semibold ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {goal.title}
                            </h4>
                            
                            {/* MARTE Criteria Summary */}
                            <div className="mt-3 space-y-1.5">
                              {marteFields.map((field) => {
                                const Icon = field.icon;
                                return (
                                  <div key={field.key} className="flex items-start gap-2">
                                    <Icon className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                    <p className="text-xs text-muted-foreground">
                                      <span className="font-medium text-foreground">{field.label}:</span>{" "}
                                      {goal[field.key as keyof Goal] as string}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </>
  );
};

export default CalendarPage;
