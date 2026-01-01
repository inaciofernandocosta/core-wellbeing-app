import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CalendarDays, Target, ChevronDown, Users, Zap, Briefcase, Award, Heart, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePillars, Pillar as DatabasePillar } from "@/hooks/usePillars";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  zap: Zap,
  briefcase: Briefcase,
  award: Award,
  heart: Heart,
};

const PillarIcon = ({ icon }: { icon?: string | null }) => {
  if (!icon) return <span className="text-sm">🎯</span>;
  
  // Check if it's a Lucide icon name first
  const IconComponent = iconMap[icon.toLowerCase()];
  if (IconComponent) {
    return <IconComponent className="w-4 h-4" />;
  }
  
  // Otherwise treat it as an emoji
  return <span className="text-sm">{icon}</span>;
};

export type Priority = "alta" | "media" | "baixa";

export interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  pillar_id: string;
  pillar?: DatabasePillar;
  goalId?: string;
  priority: Priority;
  hasTime?: boolean;
  startTime?: string;
  endTime?: string;
  recurring_group_id?: string;
}

export const priorityConfig: Record<Priority, { label: string; color: string; icon: string }> = {
  alta: { label: "Alta", color: "bg-red-500", icon: "🔴" },
  media: { label: "Média", color: "bg-amber-500", icon: "🟡" },
  baixa: { label: "Baixa", color: "bg-green-500", icon: "🟢" },
};

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: Omit<ScheduleEvent, "id">) => void;
  selectedDate?: Date;
  triggerButton?: React.ReactNode;
  eventToEdit?: ScheduleEvent | null;
}

const AddEventDialog = ({ 
  open, 
  onOpenChange, 
  onAddEvent,
  selectedDate,
  triggerButton,
  eventToEdit 
}: AddEventDialogProps) => {
  const { user } = useAuth();
  const { pillars } = usePillars();
  const [goals, setGoals] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    pillarId: "",
    goalId: "",
    priority: "media" as Priority,
    hasTime: false,
    startTime: "",
    endTime: "",
    hasDateRange: false,
    startDate: selectedDate || new Date(),
    endDate: undefined as Date | undefined,
    isRecurring: false,
    recurringDays: [] as number[], // 0=domingo, 1=segunda, etc
    recurringEndDate: undefined as Date | undefined,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [endRecurringDateOpen, setEndRecurringDateOpen] = useState(false);
  const [showGoalsList, setShowGoalsList] = useState(false);

  const weekDays = [
    { value: 1, label: "Seg", fullLabel: "Segunda" },
    { value: 2, label: "Ter", fullLabel: "Terça" },
    { value: 3, label: "Qua", fullLabel: "Quarta" },
    { value: 4, label: "Qui", fullLabel: "Quinta" },
    { value: 5, label: "Sex", fullLabel: "Sexta" },
    { value: 6, label: "Sáb", fullLabel: "Sábado" },
    { value: 0, label: "Dom", fullLabel: "Domingo" },
  ];

  // Set initial pillarId when pillars are loaded
  useEffect(() => {
    if (pillars.length > 0 && !newEvent.pillarId && open) {
      setNewEvent(prev => ({ ...prev, pillarId: pillars[0].id }));
    }
  }, [pillars, open]);

  // Update startDate when selectedDate prop changes
  useEffect(() => {
    if (selectedDate && open && !eventToEdit) {
      setNewEvent(prev => ({ ...prev, startDate: selectedDate }));
    }
  }, [selectedDate, open, eventToEdit]);

  // Populate fields when editing an event
  useEffect(() => {
    if (eventToEdit && open) {
      setNewEvent({
        title: eventToEdit.title,
        pillarId: eventToEdit.pillar_id,
        goalId: eventToEdit.goalId || "",
        priority: eventToEdit.priority,
        hasTime: eventToEdit.hasTime || false,
        startTime: eventToEdit.startTime || "",
        endTime: eventToEdit.endTime || "",
        hasDateRange: false,
        startDate: eventToEdit.date,
        endDate: eventToEdit.endDate,
        isRecurring: false,
        recurringDays: [],
        recurringEndDate: undefined,
      });
    } else if (!eventToEdit && open) {
      // Reset to default when not editing
      setNewEvent({
        title: "",
        pillarId: pillars[0]?.id || "",
        goalId: "",
        priority: "media",
        hasTime: false,
        startTime: "",
        endTime: "",
        hasDateRange: false,
        startDate: selectedDate || new Date(),
        endDate: undefined,
        isRecurring: false,
        recurringDays: [],
        recurringEndDate: undefined,
      });
    }
  }, [eventToEdit, open, pillars, selectedDate]);

  // Carregar metas do banco de dados
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user || !open) return;
      const { data } = await supabase
        .from("goals")
        .select("id, title, progress, pillar_id")
        .eq("user_id", user.id);
      
      if (data) {
        setGoals(data);
      }
    };
    fetchGoals();
  }, [user, open]);

  // Filtrar metas pelo pilar selecionado
  const pillarGoals = goals.filter(g => g.pillar_id === newEvent.pillarId);
  const selectedGoal = goals.find(g => g.id === newEvent.goalId);

  // Reset goalId when pillar changes
  useEffect(() => {
    if (newEvent.goalId) {
      const currentGoalBelongsToPillar = pillarGoals.some(g => g.id === newEvent.goalId);
      if (!currentGoalBelongsToPillar) {
        setNewEvent(prev => ({ ...prev, goalId: "" }));
      }
    }
  }, [newEvent.pillarId, pillarGoals]);

  // Gerar datas para eventos recorrentes
  const generateRecurringEvents = (): Date[] => {
    console.log('=== Gerando eventos recorrentes ===');
    console.log('Data início:', newEvent.startDate);
    console.log('Dias selecionados:', newEvent.recurringDays);
    console.log('Data fim:', newEvent.recurringEndDate || 'Sem data final (até fim do ano)');
    
    const dates: Date[] = [];
    const startDate = new Date(newEvent.startDate);
    
    // Se não tem data final, limitar ao final do ano atual
    const endDate = newEvent.recurringEndDate 
      ? new Date(newEvent.recurringEndDate)
      : new Date(startDate.getFullYear(), 11, 31); // 31 de dezembro do ano atual
    
    let currentDate = new Date(startDate);
    const finalEndDate = endDate;
    
    console.log('Data final calculada:', finalEndDate);
    
    // Iterar por cada dia até a data final
    while (currentDate <= finalEndDate) {
      const dayOfWeek = currentDate.getDay(); // 0=domingo, 1=segunda, etc
      
      // Se o dia da semana está nos dias selecionados, adicionar
      if (newEvent.recurringDays.includes(dayOfWeek)) {
        dates.push(new Date(currentDate));
      }
      
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Total de datas geradas: ${dates.length}`);
    return dates;
  };

  const handleAddEvent = () => {
    console.log('🔵 handleAddEvent chamado');
    console.log('Título:', newEvent.title);
    console.log('Pilar ID:', newEvent.pillarId);
    console.log('É recorrente?', newEvent.isRecurring);
    
    if (!newEvent.title.trim() || !newEvent.pillarId) {
      console.log('❌ Validação falhou: título ou pilar vazio');
      return;
    }

    // Se for evento recorrente, validar que pelo menos 1 dia foi selecionado
    if (newEvent.isRecurring && newEvent.recurringDays.length === 0) {
      console.log('❌ Validação falhou: nenhum dia selecionado');
      alert("Selecione pelo menos um dia da semana para repetir");
      return;
    }
    
    console.log('✅ Validações passaram, prosseguindo...');

    // Se não for recorrente, criar evento único (comportamento atual)
    if (!newEvent.isRecurring) {
      onAddEvent({
        title: newEvent.title,
        date: newEvent.startDate,
        endDate: newEvent.hasDateRange && newEvent.endDate ? newEvent.endDate : undefined,
        pillar_id: newEvent.pillarId,
        goalId: newEvent.goalId || undefined,
        priority: newEvent.priority,
        hasTime: newEvent.hasTime,
        startTime: newEvent.hasTime && newEvent.startTime ? newEvent.startTime : undefined,
        endTime: newEvent.hasTime && newEvent.endTime ? newEvent.endTime : undefined,
      });
    } else {
      // Criar eventos recorrentes
      const eventsToCreate = generateRecurringEvents();
      
      console.log(`Criando ${eventsToCreate.length} eventos recorrentes`);
      console.log('Primeiras 5 datas:', eventsToCreate.slice(0, 5));
      
      // Gerar UUID único para agrupar eventos da mesma série
      const recurringGroupId = crypto.randomUUID();
      console.log('Recurring Group ID:', recurringGroupId);
      
      // Criar cada evento de forma assíncrona e aguardar todos
      const createRecurringEvents = async () => {
        for (let i = 0; i < eventsToCreate.length; i++) {
          const eventDate = eventsToCreate[i];
          console.log(`Criando evento ${i + 1}/${eventsToCreate.length}:`, eventDate);
          
          try {
            await onAddEvent({
              title: newEvent.title,
              date: eventDate,
              endDate: undefined,
              pillar_id: newEvent.pillarId,
              goalId: newEvent.goalId || undefined,
              priority: newEvent.priority,
              hasTime: newEvent.hasTime,
              startTime: newEvent.hasTime && newEvent.startTime ? newEvent.startTime : undefined,
              endTime: newEvent.hasTime && newEvent.endTime ? newEvent.endTime : undefined,
              recurring_group_id: recurringGroupId,
            });
            console.log(`✅ Evento ${i + 1} criado com sucesso`);
          } catch (error) {
            console.error(`❌ Erro ao criar evento ${i + 1}:`, error);
          }
        }
        console.log('🎉 Todos os eventos foram processados');
      };
      
      createRecurringEvents();
    }

    setNewEvent({ 
      title: "", 
      pillarId: pillars[0]?.id || "", 
      goalId: "",
      priority: "media",
      hasTime: false, 
      startTime: "", 
      endTime: "",
      hasDateRange: false,
      startDate: selectedDate || new Date(),
      endDate: undefined,
      isRecurring: false,
      recurringDays: [],
      recurringEndDate: undefined,
    });
    setShowGoalsList(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="max-w-[340px] rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{eventToEdit ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4 pb-2 overflow-y-auto flex-1 pr-2 px-1">
          <div>
            <Label htmlFor="title" className="text-sm">O que é?</Label>
            <Input
              id="title"
              placeholder="Ex: Jantar com a família"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="mt-1.5 h-11 text-base"
            />
          </div>

          <div>
            <Label className="text-sm">Pilar da vida</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-36 overflow-y-auto pr-1">
              {pillars.map((pillar) => (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      pillarId: pillar.id,
                    })
                  }
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                    newEvent.pillarId === pillar.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <PillarIcon icon={pillar.icon} />
                  <span className="text-[11px] truncate">{pillar.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Selection */}
          <div>
            <Label className="text-sm flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Meta vinculada
            </Label>
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setShowGoalsList(!showGoalsList)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left",
                  selectedGoal 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                <span className="text-xs truncate">
                  {selectedGoal ? selectedGoal.title : "Selecionar meta..."}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  showGoalsList && "rotate-180"
                )} />
              </button>
              
              {showGoalsList && (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1.5 animate-fade-in">
                  {pillarGoals.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      Nenhuma meta neste pilar
                    </p>
                  ) : (
                    pillarGoals.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => {
                          setNewEvent({ ...newEvent, goalId: goal.id });
                          setShowGoalsList(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs transition-all",
                          newEvent.goalId === goal.id
                            ? "bg-primary/20 text-foreground ring-1 ring-primary"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className="font-medium">{goal.title}</span>
                        <span className="block text-[10px] opacity-70 mt-0.5">
                          {goal.progress}% concluído
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm">Prioridade</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.entries(priorityConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      priority: key as Priority,
                    })
                  }
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${
                    newEvent.priority === key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-xs">{config.icon}</span>
                  <span className="text-[11px]">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Período de dias</Label>
              </div>
              <Switch
                checked={newEvent.hasDateRange}
                onCheckedChange={(checked) =>
                  setNewEvent({ ...newEvent, hasDateRange: checked, endDate: undefined })
                }
              />
            </div>

            <div className={cn(
              "flex gap-3",
              newEvent.hasDateRange ? "animate-fade-in" : ""
            )}>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">
                  {newEvent.hasDateRange ? "Data início" : "Data"}
                </Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 h-9 justify-start text-left font-normal text-xs"
                    >
                      {format(newEvent.startDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEvent.startDate}
                      onSelect={(date) => {
                        if (date) {
                          setNewEvent({ ...newEvent, startDate: date });
                          setStartDateOpen(false);
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      classNames={{
                        day_today: "border-2 border-primary/50 font-semibold",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {newEvent.hasDateRange && (
                <div className="flex-1 animate-fade-in">
                  <Label className="text-xs text-muted-foreground">Data fim</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 h-9 justify-start text-left font-normal text-xs"
                      >
                        {newEvent.endDate 
                          ? format(newEvent.endDate, "dd/MM/yyyy", { locale: ptBR })
                          : "Selecionar"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newEvent.endDate}
                        onSelect={(date) => {
                          if (date) {
                            setNewEvent({ ...newEvent, endDate: date });
                            setEndDateOpen(false);
                          }
                        }}
                        disabled={(date) => date < newEvent.startDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        classNames={{
                          day_today: "border-2 border-primary/50 font-semibold",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Repetir semanalmente</Label>
              </div>
              <Switch
                checked={newEvent.isRecurring}
                onCheckedChange={(checked) =>
                  setNewEvent({ ...newEvent, isRecurring: checked, recurringDays: [], recurringEndDate: undefined })
                }
              />
            </div>

            {newEvent.isRecurring && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Dias da semana</Label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const isSelected = newEvent.recurringDays.includes(day.value);
                          setNewEvent({
                            ...newEvent,
                            recurringDays: isSelected
                              ? newEvent.recurringDays.filter(d => d !== day.value)
                              : [...newEvent.recurringDays, day.value].sort()
                          });
                        }}
                        className={cn(
                          "h-10 rounded-lg text-xs font-medium transition-all",
                          newEvent.recurringDays.includes(day.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        title={day.fullLabel}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {newEvent.recurringDays.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {newEvent.recurringDays.length} {newEvent.recurringDays.length === 1 ? 'dia selecionado' : 'dias selecionados'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Repetir até (opcional)</Label>
                  <Popover open={endRecurringDateOpen} onOpenChange={setEndRecurringDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 h-10 justify-start text-left font-normal text-xs"
                      >
                        {newEvent.recurringEndDate 
                          ? format(newEvent.recurringEndDate, "dd/MM/yyyy", { locale: ptBR })
                          : "Sem data final"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newEvent.recurringEndDate}
                        onSelect={(date) => {
                          setNewEvent({ ...newEvent, recurringEndDate: date });
                          setEndRecurringDateOpen(false);
                        }}
                        disabled={(date) => date < newEvent.startDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        classNames={{
                          day_today: "border-2 border-primary/50 font-semibold",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {newEvent.recurringEndDate && (
                    <button
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, recurringEndDate: undefined })}
                      className="text-[10px] text-muted-foreground hover:text-foreground mt-1 underline"
                    >
                      Remover data final
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Time Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Definir horário</Label>
              </div>
              <Switch
                checked={newEvent.hasTime}
                onCheckedChange={(checked) =>
                  setNewEvent({ ...newEvent, hasTime: checked, startTime: "", endTime: "" })
                }
              />
            </div>

            {newEvent.hasTime && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Início</Label>
                  <div className="relative mt-1">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="h-12 text-base font-medium cursor-pointer pr-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Fim (opcional)</Label>
                  <div className="relative mt-1">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="h-12 text-base font-medium cursor-pointer pr-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleAddEvent} className="w-full">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
