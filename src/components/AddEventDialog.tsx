import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Clock } from "lucide-react";

export type EventCategory = "feriado" | "aniversario" | "ferias" | "evento" | "familia" | "trabalho";
export type Pillar = "vida" | "trabalho" | "saude" | "familia" | "objetivos";

export interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  category: EventCategory;
  pillar?: Pillar;
  hasTime?: boolean;
  startTime?: string;
  endTime?: string;
}

export const pillarConfig: Record<Pillar, { label: string; color: string; icon: string }> = {
  vida: { label: "Vida Pessoal", color: "from-rose-500 to-pink-500", icon: "❤️" },
  trabalho: { label: "Trabalho", color: "from-blue-500 to-cyan-500", icon: "💼" },
  saude: { label: "Saúde", color: "from-primary to-emerald-400", icon: "⚡" },
  familia: { label: "Família", color: "from-amber-500 to-orange-500", icon: "👨‍👩‍👧‍👦" },
  objetivos: { label: "Objetivos", color: "from-violet-500 to-purple-500", icon: "🎯" },
};

export const categoryConfig: Record<EventCategory, { label: string; color: string; priority: number }> = {
  feriado: { label: "Feriado", color: "bg-red-500", priority: 1 },
  aniversario: { label: "Aniversário", color: "bg-pink-500", priority: 2 },
  ferias: { label: "Férias", color: "bg-amber-500", priority: 3 },
  evento: { label: "Evento Importante", color: "bg-purple-500", priority: 4 },
  familia: { label: "Família & Amigos", color: "bg-blue-500", priority: 5 },
  trabalho: { label: "Trabalho", color: "bg-muted-foreground/50", priority: 6 },
};

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: Omit<ScheduleEvent, "id" | "date">) => void;
  defaultPillar?: Pillar;
  triggerButton?: React.ReactNode;
}

const AddEventDialog = ({ 
  open, 
  onOpenChange, 
  onAddEvent, 
  defaultPillar = "vida",
  triggerButton 
}: AddEventDialogProps) => {
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "familia" as EventCategory,
    pillar: defaultPillar,
    hasTime: false,
    startTime: "",
    endTime: "",
  });

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    onAddEvent({
      title: newEvent.title,
      category: newEvent.category,
      pillar: newEvent.pillar,
      hasTime: newEvent.hasTime,
      startTime: newEvent.hasTime && newEvent.startTime ? newEvent.startTime : undefined,
      endTime: newEvent.hasTime && newEvent.endTime ? newEvent.endTime : undefined,
    });

    setNewEvent({ title: "", category: "familia", pillar: defaultPillar, hasTime: false, startTime: "", endTime: "" });
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
            <Label className="text-sm">Categoria (prioridade)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      category: key as EventCategory,
                    })
                  }
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                    newEvent.category === key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${config.color}`}
                  />
                  <span className="text-[11px]">{config.label}</span>
                </button>
              ))}
            </div>
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
