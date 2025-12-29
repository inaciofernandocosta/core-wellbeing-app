import { useState } from "react";
import { format, addMonths, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type EventCategory = "feriado" | "aniversario" | "ferias" | "evento" | "familia" | "trabalho";

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  category: EventCategory;
}

const categoryConfig: Record<EventCategory, { label: string; color: string; priority: number }> = {
  feriado: { label: "Feriado", color: "bg-red-500", priority: 1 },
  aniversario: { label: "Aniversário", color: "bg-pink-500", priority: 2 },
  ferias: { label: "Férias", color: "bg-amber-500", priority: 3 },
  evento: { label: "Evento Importante", color: "bg-purple-500", priority: 4 },
  familia: { label: "Família & Amigos", color: "bg-blue-500", priority: 5 },
  trabalho: { label: "Trabalho", color: "bg-muted-foreground/50", priority: 6 },
};

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "familia" as EventCategory,
  });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const event: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      category: newEvent.category,
    };

    setEvents([...events, event]);
    setNewEvent({ title: "", category: "familia" });
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => isSameDay(event.date, date))
      .sort((a, b) => categoryConfig[a.category].priority - categoryConfig[b.category].priority);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Pegar a categoria mais prioritária do dia para cor do indicador
  const getHighestPriorityCategory = (date: Date): EventCategory | null => {
    const dateEvents = getEventsForDate(date);
    return dateEvents.length > 0 ? dateEvents[0].category : null;
  };

  return (
    <>
      <div className="min-h-screen bg-background max-w-md mx-auto pb-28">
        {/* Header */}
        <header className="p-6 pt-12">
          <p className="text-muted-foreground text-sm mb-1">Open Schedule</p>
          <h1 className="text-2xl font-bold text-foreground">
            Vida primeiro, trabalho depois.
          </h1>
        </header>

        {/* Navegação do mês */}
        <div className="px-6 flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendário */}
        <div className="px-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={ptBR}
            className="rounded-xl border border-border bg-card p-3"
            components={{
              DayContent: ({ date }) => {
                const category = getHighestPriorityCategory(date);
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {date.getDate()}
                    {category && (
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${categoryConfig[category].color}`}
                      />
                    )}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Legenda de prioridades */}
        <div className="px-6 mt-6">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
            Ordem de Prioridade
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span className={`w-2 h-2 rounded-full ${config.color}`} />
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eventos do dia selecionado */}
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedDate
                ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                : "Selecione uma data"}
            </h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-4">
                <DialogHeader>
                  <DialogTitle>Novo Compromisso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="title">O que é?</Label>
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
                    <Label>Categoria</Label>
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
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                            newEvent.category === key
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:bg-muted"
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${config.color}`}
                          />
                          <span className="text-sm">{config.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddEvent} className="w-full">
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum compromisso neste dia.</p>
              <p className="text-xs mt-1">
                Proteja sua vida primeiro, depois adicione trabalho.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      categoryConfig[event.category].color
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categoryConfig[event.category].label}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default CalendarPage;
