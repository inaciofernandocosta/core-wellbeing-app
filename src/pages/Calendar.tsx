import { useState, useMemo } from "react";
import { format, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<ScheduleEvent[]>([
    // Sample events
    { id: "1", title: "Viagem", date: new Date(2026, 0, 31), category: "familia" },
    { id: "2", title: "Carnaval", date: new Date(2026, 1, 16), category: "feriado" },
    { id: "3", title: "Aniversário da Mãe", date: new Date(2026, 1, 20), category: "aniversario" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "familia" as EventCategory,
  });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(undefined); // Clear selection when navigating
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(undefined); // Clear selection when navigating
  };

  const handleAddEvent = () => {
    const dateToUse = selectedDate || new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    if (!newEvent.title.trim()) return;

    const event: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: dateToUse,
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

  // Get events for the current month
  const getEventsForMonth = (month: Date) => {
    return events
      .filter((event) => isSameMonth(event.date, month))
      .sort((a, b) => {
        // Sort by date first, then by priority
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return categoryConfig[a.category].priority - categoryConfig[b.category].priority;
      });
  };

  // Determine which events to show based on selection
  const displayedEvents = useMemo(() => {
    if (selectedDate) {
      return getEventsForDate(selectedDate);
    }
    return getEventsForMonth(currentMonth);
  }, [selectedDate, currentMonth, events]);

  // Title for the events section
  const eventsTitle = useMemo(() => {
    if (selectedDate) {
      return format(selectedDate, "d 'de' MMMM", { locale: ptBR });
    }
    return format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
  }, [selectedDate, currentMonth]);

  // Get highest priority category for a date (for calendar dots)
  const getHighestPriorityCategory = (date: Date): EventCategory | null => {
    const dateEvents = getEventsForDate(date);
    return dateEvents.length > 0 ? dateEvents[0].category : null;
  };

  return (
    <>
      <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col pb-28">
        {/* Header - Compact */}
        <header className="px-6 pt-10 pb-2">
          <p className="text-muted-foreground text-xs mb-0.5">Open Schedule</p>
          <h1 className="text-lg font-bold text-foreground">
            Vida primeiro, trabalho depois.
          </h1>
        </header>

        {/* Month Navigation */}
        <div className="px-6 flex items-center justify-between py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar - Full width and responsive */}
        <div className="px-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={(month) => {
              setCurrentMonth(month);
              setSelectedDate(undefined);
            }}
            locale={ptBR}
            className="rounded-xl border border-border bg-card p-2 w-full"
            classNames={{
              months: "w-full",
              month: "w-full space-y-2",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-xs text-center",
              row: "flex w-full mt-1",
              cell: "flex-1 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: "h-10 w-full rounded-lg font-normal hover:bg-muted transition-colors",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
              nav: "hidden", // Hide default nav since we have custom one
              caption: "hidden", // Hide default caption since we have custom one
            }}
            components={{
              DayContent: ({ date }) => {
                const category = getHighestPriorityCategory(date);
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {date.getDate()}
                    {category && (
                      <span
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${categoryConfig[category].color}`}
                      />
                    )}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Priority Legend - Compact */}
        <div className="px-6 mt-3">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
            Ordem de Prioridade
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <div
                key={key}
                className="flex items-center gap-1 text-[10px] text-muted-foreground"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section - Scrollable */}
        <div className="px-6 mt-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold capitalize">{eventsTitle}</h3>
              {!selectedDate && (
                <p className="text-[10px] text-muted-foreground">
                  {displayedEvents.length} {displayedEvents.length === 1 ? 'compromisso' : 'compromissos'}
                </p>
              )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[340px] rounded-2xl">
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
                    <Label className="text-sm">Categoria</Label>
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
                          className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left ${
                            newEvent.category === key
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:bg-muted"
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${config.color}`}
                          />
                          <span className="text-xs">{config.label}</span>
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

          {/* Events List - Scrollable */}
          <div className="flex-1 overflow-y-auto no-scrollbar -mx-6 px-6">
            {displayedEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">
                  {selectedDate ? "Nenhum compromisso neste dia." : "Nenhum compromisso neste mês."}
                </p>
                <p className="text-xs mt-1">
                  Proteja sua vida primeiro, depois adicione trabalho.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {displayedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        categoryConfig[event.category].color
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {!selectedDate && (
                          <span className="mr-2">{format(event.date, "d MMM", { locale: ptBR })}</span>
                        )}
                        {categoryConfig[event.category].label}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default CalendarPage;
