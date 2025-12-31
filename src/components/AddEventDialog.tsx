import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type Pillar = "vida" | "trabalho" | "saude" | "familia" | "objetivos";
export type Priority = "alta" | "media" | "baixa";

export interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  pillar: Pillar;
  priority: Priority;
  hasTime?: boolean;
  startTime?: string;
  endTime?: string;
}

export const pillarConfig: Record<Pillar, { label: string; color: string; bgColor: string; icon: string }> = {
  vida: { label: "Vida Pessoal", color: "from-rose-500 to-pink-500", bgColor: "bg-rose-500", icon: "❤️" },
  trabalho: { label: "Trabalho", color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500", icon: "💼" },
  saude: { label: "Saúde", color: "from-primary to-emerald-400", bgColor: "bg-emerald-500", icon: "⚡" },
  familia: { label: "Família", color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500", icon: "👨‍👩‍👧‍👦" },
  objetivos: { label: "Objetivos", color: "from-violet-500 to-purple-500", bgColor: "bg-violet-500", icon: "🎯" },
};

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
  defaultPillar?: Pillar;
  triggerButton?: React.ReactNode;
}

const AddEventDialog = ({ 
  open, 
  onOpenChange, 
  onAddEvent,
  selectedDate,
  defaultPillar = "vida",
  triggerButton 
}: AddEventDialogProps) => {
  const [newEvent, setNewEvent] = useState({
    title: "",
    pillar: defaultPillar,
    priority: "media" as Priority,
    hasTime: false,
    startTime: "",
    endTime: "",
    hasDateRange: false,
    startDate: selectedDate || new Date(),
    endDate: undefined as Date | undefined,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    onAddEvent({
      title: newEvent.title,
      date: newEvent.startDate,
      endDate: newEvent.hasDateRange && newEvent.endDate ? newEvent.endDate : undefined,
      pillar: newEvent.pillar,
      priority: newEvent.priority,
      hasTime: newEvent.hasTime,
      startTime: newEvent.hasTime && newEvent.startTime ? newEvent.startTime : undefined,
      endTime: newEvent.hasTime && newEvent.endTime ? newEvent.endTime : undefined,
    });

    setNewEvent({ 
      title: "", 
      pillar: defaultPillar, 
      priority: "media",
      hasTime: false, 
      startTime: "", 
      endTime: "",
      hasDateRange: false,
      startDate: selectedDate || new Date(),
      endDate: undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="max-w-[340px] rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Compromisso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="title" className="text-sm">O que é?</Label>
            <Input
              id="title"
              placeholder="Ex: Jantar com a família"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm">Pilar da vida</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(pillarConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      pillar: key as Pillar,
                    })
                  }
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                    newEvent.pillar === key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-[11px]">{config.label}</span>
                </button>
              ))}
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
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
                  <Input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startTime: e.target.value })
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Fim (opcional)</Label>
                  <Input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endTime: e.target.value })
                    }
                    className="mt-1 h-9"
                  />
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
