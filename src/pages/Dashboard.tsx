import { ChevronRight, Zap, Target, Heart, Users, Briefcase } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const pillars = [
  { 
    id: 1, 
    name: "Vida Pessoal", 
    icon: Heart, 
    progress: 72, 
    color: "from-rose-500 to-pink-500",
    tasks: 3 
  },
  { 
    id: 2, 
    name: "Trabalho", 
    icon: Briefcase, 
    progress: 85, 
    color: "from-blue-500 to-cyan-500",
    tasks: 5 
  },
  { 
    id: 3, 
    name: "Saúde", 
    icon: Zap, 
    progress: 60, 
    color: "from-primary to-emerald-400",
    tasks: 2 
  },
  { 
    id: 4, 
    name: "Família", 
    icon: Users, 
    progress: 90, 
    color: "from-amber-500 to-orange-500",
    tasks: 1 
  },
  { 
    id: 5, 
    name: "Objetivos", 
    icon: Target, 
    progress: 45, 
    color: "from-violet-500 to-purple-500",
    tasks: 4 
  },
];

const todayTasks = [
  { id: 1, title: "Reunião de equipe", time: "09:00", pillar: "Trabalho", completed: true },
  { id: 2, title: "Treino na academia", time: "12:00", pillar: "Saúde", completed: false },
  { id: 3, title: "Ligar para os pais", time: "18:00", pillar: "Família", completed: false },
  { id: 4, title: "Revisar metas semanais", time: "20:00", pillar: "Objetivos", completed: false },
];

const Dashboard = () => {
  const today = new Date();
  const dayName = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    <>
      <div className="relative flex flex-col h-[100dvh] w-full overflow-hidden max-w-md mx-auto bg-background pb-28">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-muted-foreground text-sm font-medium capitalize">{dayName}</p>
            <h1 className="text-2xl font-bold text-foreground">{dateFormatted}</h1>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-neon">
            <span className="text-primary-foreground font-bold text-lg">JD</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-8 px-6">
        {/* Overall Progress */}
        <div className="bg-card rounded-3xl p-5 mb-6 ring-1 ring-border/50 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Progresso Geral</h2>
            <span className="text-2xl font-black text-primary">70%</span>
          </div>
          <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: '70%' }}
            />
          </div>
          <p className="text-muted-foreground text-sm mt-3 font-medium">
            Você completou 14 de 20 tarefas esta semana
          </p>
        </div>

        {/* Pillars Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Os 5 Pilares</h2>
            <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity">
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {pillars.slice(0, 4).map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.id}
                  className="bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{pillar.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${pillar.color} rounded-full`}
                        style={{ width: `${pillar.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{pillar.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Fifth pillar - full width */}
          <div className="mt-3">
            {pillars.slice(4).map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.id}
                  className="bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark hover:scale-[1.02] transition-transform cursor-pointer flex items-center gap-4"
                >
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm mb-1">{pillar.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${pillar.color} rounded-full`}
                          style={{ width: `${pillar.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{pillar.progress}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {pillar.tasks} tarefas
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Tarefas de Hoje</h2>
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div 
                key={task.id}
                className={`bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark flex items-center gap-4 transition-all ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <button 
                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    task.completed 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground/30 hover:border-primary'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{task.pillar}</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground shrink-0">{task.time}</span>
              </div>
            ))}
          </div>
        </div>
        </main>
      </div>

      {/* Bottom Navigation - Outside container for true fixed positioning */}
      <BottomNav />
    </>
  );
};

export default Dashboard;
