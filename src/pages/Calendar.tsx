import { useState, useMemo, useEffect } from "react";
import { format, addMonths, subMonths, isSameDay, isSameMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, Loader2, Pencil, Repeat } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AddEventDialog, { 
  ScheduleEvent, 
  Priority,
  priorityConfig
} from "@/components/AddEventDialog";
import type { DateRange } from "react-day-picker";
import { useSchedule } from "@/hooks/useSchedule";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const CalendarPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { events, loading, addEvent, updateEvent, deleteEvent, deleteRecurringEvents } = useSchedule();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null);
  const [deleteScope, setDeleteScope] = useState<"this" | "future" | "all" | null>(null);
  const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | null>(null);

  // Detect if event was passed from Dashboard
  useEffect(() => {
    const state = location.state as { selectedEvent?: ScheduleEvent };
    if (state?.selectedEvent) {
      setEventToEdit(state.selectedEvent);
      setIsDialogOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setDateRange(undefined);
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setDateRange(undefined);
  };

  const clearSelection = () => {
    setDateRange(undefined);
  };

  // Custom handler to fix single day selection UX
  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined);
      return;
    }

    // If only 'from' is set (single day click or start of range)
    if (range.from && !range.to) {
      // Check if clicking the same day that's already selected
      if (dateRange?.from && isSameDay(dateRange.from, range.from) && !dateRange.to) {
        // Clicking same day again - keep it selected
        return;
      }
      
      // If there's already a 'from' date without 'to', this might be completing a range
      if (dateRange?.from && !dateRange.to && !isSameDay(dateRange.from, range.from)) {
        // Second click on different day - complete the range
        setDateRange(range);
      } else {
        // New single day selection - force clear by setting undefined first
        setDateRange(undefined);
        // Use setTimeout to ensure state is cleared before setting new value
        setTimeout(() => {
          setDateRange({ from: range.from, to: undefined });
        }, 0);
      }
    } else {
      // Complete range with both from and to
      setDateRange(range);
    }
  };

  const handleAddEvent = async (eventData: Omit<ScheduleEvent, "id">) => {
    if (eventToEdit) {
      // Se estiver editando, atualizar o evento existente
      await updateEvent(eventToEdit.id, eventData);
    } else {
      // Se não, criar novo evento
      await addEvent(eventData);
    }
    setIsDialogOpen(false);
    setEventToEdit(null);
  };

  const handleDeleteEvent = async (event: ScheduleEvent) => {
    console.log('🗑️ Evento a deletar:', event);
    console.log('Tem recurring_group_id?', !!event.recurring_group_id);
    console.log('recurring_group_id:', event.recurring_group_id);
    setEventToDelete(event);
    setDeleteScope(null); // Reset scope
  };

  const handleSelectScope = (scope: "this" | "future" | "all") => {
    setDeleteScope(scope);
  };

  const confirmDelete = async () => {
    if (!eventToDelete || !deleteScope) return;

    if (eventToDelete.recurring_group_id && deleteScope !== "this") {
      await deleteRecurringEvents(
        eventToDelete.recurring_group_id,
        deleteScope,
        eventToDelete.date
      );
    } else {
      await deleteEvent(eventToDelete.id);
    }
    
    setEventToDelete(null);
    setDeleteScope(null);
  };

  const cancelDelete = () => {
    setEventToDelete(null);
    setDeleteScope(null);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEventToEdit(event);
    setIsDialogOpen(true);
  };

  const priorityOrder: Record<Priority, number> = { alta: 1, media: 2, baixa: 3 };

  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => isSameDay(event.date, date))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  // Get events for a date range
  const getEventsForRange = (from: Date, to: Date) => {
    return events
      .filter((event) => 
        isWithinInterval(startOfDay(event.date), { 
          start: startOfDay(from), 
          end: endOfDay(to) 
        })
      )
      .sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  // Get events for the current month
  const getEventsForMonth = (month: Date) => {
    return events
      .filter((event) => isSameMonth(event.date, month))
      .sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  // Determine which events to show based on selection
  const displayedEvents = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return getEventsForRange(dateRange.from, dateRange.to);
    }
    if (dateRange?.from) {
      return getEventsForDate(dateRange.from);
    }
    return getEventsForMonth(currentMonth);
  }, [dateRange, currentMonth, events]);

  // Title for the events section
  const eventsTitle = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "d MMM", { locale: ptBR })} - ${format(dateRange.to, "d MMM", { locale: ptBR })}`;
    }
    if (dateRange?.from) {
      return format(dateRange.from, "d 'de' MMMM", { locale: ptBR });
    }
    return format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
  }, [dateRange, currentMonth]);

  // Check if there's any selection
  const hasSelection = dateRange?.from !== undefined;

  // Get highest priority for a date (for calendar dots)
  const getHighestPriorityForDate = (date: Date): Priority | null => {
    const dateEvents = getEventsForDate(date);
    return dateEvents.length > 0 ? dateEvents[0].priority : null;
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground animate-pulse">Carregando sua agenda...</p>
        </div>
        <BottomNav />
      </>
    );
  }

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

        {/* Calendar - Range mode */}
        <div className="px-3">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={(month) => {
              setCurrentMonth(month);
              setDateRange(undefined);
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
              day_today: "border-2 border-primary/50 font-semibold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
              day_range_start: "bg-primary text-primary-foreground rounded-l-lg rounded-r-none",
              day_range_end: "bg-primary text-primary-foreground rounded-r-lg rounded-l-none",
              day_range_middle: "bg-primary/20 text-foreground rounded-none",
              nav: "hidden",
              caption: "hidden",
            }}
            components={{
              DayContent: ({ date }) => {
                const priority = getHighestPriorityForDate(date);
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {date.getDate()}
                    {priority && (
                      <span
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${priorityConfig[priority].color}`}
                      />
                    )}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Selection indicator & clear button */}
        {hasSelection && (
          <div className="px-6 mt-2">
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Limpar seleção
            </button>
          </div>
        )}

        {/* Priority Legend - Compact */}
        <div className="px-6 mt-3">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
            Legenda de Prioridade
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(priorityConfig).map(([key, config]) => (
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
              <p className="text-[10px] text-muted-foreground">
                {displayedEvents.length} {displayedEvents.length === 1 ? 'compromisso' : 'compromissos'}
              </p>
            </div>
            <AddEventDialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEventToEdit(null);
              }}
              onAddEvent={handleAddEvent}
              selectedDate={dateRange?.from || new Date()}
              eventToEdit={eventToEdit}
              triggerButton={
                <Button size="sm" className="bg-primary text-primary-foreground h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              }
            />
          </div>

          {/* Events List - Scrollable */}
          <div className="flex-1 overflow-y-auto no-scrollbar -mx-6 px-6">
            {displayedEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">
                  {hasSelection ? "Nenhum compromisso no período selecionado." : "Nenhum compromisso neste mês."}
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
                        priorityConfig[event.priority].color
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm truncate">
                          {event.title}
                        </p>
                        {event.recurring_group_id && (
                          <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                            <Repeat className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        {event.hasTime && event.startTime && (
                          <span className="text-[10px] text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                            {event.startTime}{event.endTime && ` - ${event.endTime}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        <span>{format(event.date, "d MMM", { locale: ptBR })}</span>
                        <span>•</span>
                        <span className={`font-medium bg-gradient-to-r ${event.pillar?.color || 'from-primary to-emerald-400'} bg-clip-text text-transparent`}>
                          {event.pillar?.name || 'Sem pilar'}
                        </span>
                        <span>•</span>
                        <span>{priorityConfig[event.priority].label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-border">
            {!deleteScope ? (
              // Etapa 1: Escolher tipo de exclusão
              eventToDelete.recurring_group_id ? (
                // Evento recorrente - mostrar opções
                <div className="flex flex-col">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold">Excluir Compromisso</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-13">{eventToDelete.title}</p>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Este compromisso se repete. O que deseja excluir?
                    </p>
                    
                    <div className="space-y-2">
                      <button
                        className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        onClick={() => handleSelectScope("this")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <span className="text-sm">📅</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Apenas este</p>
                            <p className="text-xs text-muted-foreground">
                              {format(eventToDelete.date, "d 'de' MMMM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        onClick={() => handleSelectScope("future")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <span className="text-sm">📆</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Este e próximos</p>
                            <p className="text-xs text-muted-foreground">
                              A partir de {format(eventToDelete.date, "d 'de' MMM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        className="w-full p-4 rounded-xl border-2 border-destructive/30 hover:border-destructive hover:bg-destructive/5 transition-all text-left group"
                        onClick={() => handleSelectScope("all")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center transition-colors">
                            <span className="text-sm">🗑️</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-destructive text-sm">Toda a série</p>
                            <p className="text-xs text-muted-foreground">
                              Todos os compromissos desta série
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full mt-4"
                      onClick={cancelDelete}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Evento único - confirmação direta
                <div className="flex flex-col">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold">Excluir Compromisso</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-13">{eventToDelete.title}</p>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-6 text-center">
                      Tem certeza que deseja excluir este compromisso?
                    </p>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={cancelDelete}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={async () => {
                          await deleteEvent(eventToDelete.id);
                          cancelDelete();
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Etapa 2: Confirmar ação
              <div className="flex flex-col">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold">Confirmar Exclusão</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-13">{eventToDelete.title}</p>
                </div>

                <div className="p-6">
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex gap-3">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {deleteScope === "this" && "Você está excluindo apenas este compromisso"}
                          {deleteScope === "future" && "Você está excluindo este e todos os próximos"}
                          {deleteScope === "all" && "Você está excluindo toda a série"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Esta ação não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDeleteScope(null)}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={confirmDelete}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
};

export default CalendarPage;
