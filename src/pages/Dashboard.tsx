import { ChevronRight, Zap, Target, Heart, Users, Briefcase, Wallet, Loader2, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { usePillars } from "@/hooks/usePillars";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSchedule } from "@/hooks/useSchedule";
import { isSameDay } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { pillars, loading: loadingPillars, error: errorPillars } = usePillars();
  const { events, loading: loadingSchedule } = useSchedule();
  const [targetPointsTotal, setTargetPointsTotal] = useState(0);
  const hasCustomPillar = pillars.some((p) => !p.is_default);
  const today = new Date();
  
  // Filtrar tarefas de hoje
  const todayTasks = events
    .filter(event => isSameDay(event.date, today))
    .sort((a, b) => {
      if (a.hasTime && b.hasTime) {
        return (a.startTime || "").localeCompare(b.startTime || "");
      }
      if (a.hasTime) return -1;
      if (b.hasTime) return 1;
      return 0;
    });

  const dayName = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const displayedPillars = pillars.filter((p) => p.is_default).slice(0, 4);

  useEffect(() => {
    const loadTargetPoints = async () => {
      if (!user) return;
      
      const { data: goalsData } = await supabase
        .from("goals")
        .select("target_points, completed")
        .eq("user_id", user.id)
        .eq("completed", true);
      
      const totalCredits = (goalsData ?? []).reduce((sum, goal) => sum + (goal.target_points ?? 0), 0);
      
      const { data: transactionsData } = await supabase
        .from("points_transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("type", "debit");
      
      const totalDebits = (transactionsData ?? []).reduce((sum, t) => sum + t.amount, 0);
      
      const balance = totalCredits - totalDebits;
      setTargetPointsTotal(balance);
    };
    loadTargetPoints();
  }, [user?.id]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "FI";

  const getPillarRoute = (pillarId: string, pillarName: string) => {
    const routes: Record<string, string> = {
      "Vida Pessoal": "/personal-life",
    };
    // If there's a specific route, use it; otherwise go to generic pillar page
    return routes[pillarName] || `/pillars/${pillarId}`;
  };

  const getIcon = (name?: string | null) => {
    const map: Record<string, React.ComponentType<{ className?: string }>> = {
      heart: Heart,
      briefcase: Briefcase,
      zap: Zap,
      target: Target,
      users: Users,
    };
    if (name && map[name.toLowerCase()]) return map[name.toLowerCase()];
    return Heart;
  };

  const getPillarIcon = (icon?: string | null) => {
    if (!icon) return "🎯";
    
    // Check if it's a Lucide icon name
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      heart: Heart,
      briefcase: Briefcase,
      zap: Zap,
      target: Target,
      users: Users,
    };
    
    const IconComponent = iconMap[icon.toLowerCase()];
    if (IconComponent) {
      return IconComponent;
    }
    
    // Otherwise treat it as an emoji
    return icon;
  };

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-muted-foreground text-sm font-medium capitalize">{dayName}</p>
            <h1 className="text-2xl font-bold text-foreground">{dateFormatted}</h1>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-neon">
            <span className="text-primary-foreground font-bold text-lg">
              {initials}
            </span>
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

        {/* Points Balance Card */}
        {hasCustomPillar && (
          <div 
            onClick={() => navigate('/points')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 mb-6 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90 font-medium">Clube de Fidelidade</p>
                  <p className="text-2xl font-bold">{targetPointsTotal.toLocaleString("pt-BR")} pts</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Pillars Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground">Pilares</h2>
              {!loadingPillars && !errorPillars && (
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {pillars.length} no total
                </span>
              )}
            </div>
            <button 
              onClick={() => navigate('/pillars')}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {loadingPillars && (
            <p className="text-sm text-muted-foreground">Carregando pilares...</p>
          )}
          {errorPillars && (
            <p className="text-sm text-destructive">Erro ao carregar pilares: {errorPillars}</p>
          )}
          {!loadingPillars && !errorPillars && (
            <div className="grid grid-cols-2 gap-3">
              {pillars.filter(pillar => pillar.is_default).map((pillar) => {
                const Icon = getIcon(pillar.icon);
                const color = pillar.color || "from-primary to-emerald-400";
                const progress = pillar.progress || 0;
                const route = getPillarRoute(pillar.id, pillar.name);
                
                return (
                  <div 
                    key={pillar.id}
                    onClick={() => navigate(route)}
                    className="bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{pillar.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${color} rounded-full`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Tarefas de Hoje</h2>
            <button 
              onClick={() => navigate('/calendar')}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {loadingSchedule ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="bg-card rounded-2xl p-6 ring-1 ring-border/50 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>
              <button 
                onClick={() => navigate('/calendar')}
                className="text-xs text-primary font-medium hover:underline"
              >
                Adicionar compromisso
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => {
                const pillarColor = task.pillar?.color || "from-primary to-emerald-400";
                const pillarIconRaw = task.pillar?.icon || "🎯";
                const PillarIconComponent = getPillarIcon(pillarIconRaw);
                const pillarName = task.pillar?.name || "Sem pilar";
                const isIconComponent = typeof PillarIconComponent !== 'string';
                const priorityColor = task.priority === 'alta' ? 'bg-red-500' : task.priority === 'media' ? 'bg-amber-500' : 'bg-green-500';
                
                return (
                  <div 
                    key={task.id}
                    onClick={() => navigate('/calendar', { state: { selectedEvent: task } })}
                    className="bg-card rounded-xl p-3 ring-1 ring-border/50 hover:ring-primary/50 transition-all cursor-pointer flex items-center gap-3"
                  >
                    {/* Priority Indicator */}
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priorityColor}`} />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {task.title}
                        </h3>
                        {task.recurring_group_id && (
                          <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center shrink-0">
                            <Repeat className="w-2.5 h-2.5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        <span className={`font-medium bg-gradient-to-r ${pillarColor} bg-clip-text text-transparent`}>
                          {pillarName}
                        </span>
                        {task.hasTime && task.startTime && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-primary">
                              {task.startTime}{task.endTime && ` - ${task.endTime}`}
                            </span>
                          </>
                        )}
                        {!task.hasTime && (
                          <>
                            <span>•</span>
                            <span>Dia todo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
};

export default Dashboard;
