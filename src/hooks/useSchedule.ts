import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleEvent, Priority } from "@/components/AddEventDialog";

export const useSchedule = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schedule_events")
        .select(`
          *,
          pillars (
            id,
            name,
            icon,
            color
          )
        `)
        .eq("user_id", user.id)
        .order("event_date", { ascending: true });

      if (error) throw error;

      const formattedEvents: any[] = (data || []).map((e) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.event_date),
        endDate: e.end_date ? new Date(e.end_date) : undefined,
        pillar_id: e.pillar_id,
        pillar: e.pillars, // Informações do pilar vindas do join
        goalId: e.goal_id,
        priority: e.priority as Priority,
        hasTime: e.has_time,
        startTime: e.start_time,
        endTime: e.end_time,
        recurring_group_id: e.recurring_group_id,
      }));

      setEvents(formattedEvents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?.id]);

  const addEvent = async (eventData: Omit<ScheduleEvent, "id">) => {
    if (!user) return { error: "Usuário não autenticado" };

    try {
      const { data, error } = await supabase
        .from("schedule_events")
        .insert([
          {
            user_id: user.id,
            title: eventData.title,
            event_date: eventData.date.toISOString(),
            end_date: eventData.endDate?.toISOString(),
            pillar_id: eventData.pillar_id,
            goal_id: eventData.goalId,
            priority: eventData.priority,
            has_time: eventData.hasTime,
            start_time: eventData.startTime,
            end_time: eventData.endTime,
            recurring_group_id: eventData.recurring_group_id,
          },
        ])
        .select(`
          *,
          pillars (
            id,
            name,
            icon,
            color
          )
        `)
        .single();

      if (error) throw error;

      const newEvent: any = {
        id: data.id,
        title: data.title,
        date: new Date(data.event_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        pillar_id: data.pillar_id,
        pillar: data.pillars,
        goalId: data.goal_id,
        priority: data.priority as Priority,
        hasTime: data.has_time,
        startTime: data.start_time,
        endTime: data.end_time,
      };

      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
      return { data: newEvent };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateEvent = async (id: string, eventData: Omit<ScheduleEvent, "id">) => {
    if (!user) return { error: "Usuário não autenticado" };

    try {
      const { data, error } = await supabase
        .from("schedule_events")
        .update({
          title: eventData.title,
          event_date: eventData.date.toISOString(),
          end_date: eventData.endDate?.toISOString(),
          pillar_id: eventData.pillar_id,
          goal_id: eventData.goalId,
          priority: eventData.priority,
          has_time: eventData.hasTime,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          *,
          pillars (
            id,
            name,
            icon,
            color
          )
        `)
        .single();

      if (error) throw error;

      const updatedEvent: any = {
        id: data.id,
        title: data.title,
        date: new Date(data.event_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        pillar_id: data.pillar_id,
        pillar: data.pillars,
        goalId: data.goal_id,
        priority: data.priority as Priority,
        hasTime: data.has_time,
        startTime: data.start_time,
        endTime: data.end_time,
      };

      setEvents((prev) => 
        prev.map((e) => (e.id === id ? updatedEvent : e))
          .sort((a, b) => a.date.getTime() - b.date.getTime())
      );
      return { data: updatedEvent };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return { error: "Usuário não autenticado" };

    try {
      const { error } = await supabase
        .from("schedule_events")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteRecurringEvents = async (
    recurringGroupId: string,
    scope: "this" | "future" | "all",
    currentEventDate?: Date
  ) => {
    if (!user) return { error: "Usuário não autenticado" };

    try {
      let query = supabase
        .from("schedule_events")
        .delete()
        .eq("recurring_group_id", recurringGroupId)
        .eq("user_id", user.id);

      // Aplicar filtro baseado no escopo
      if (scope === "future" && currentEventDate) {
        // Deletar eventos >= data atual
        query = query.gte("event_date", currentEventDate.toISOString());
      }
      // Se scope === "all", não precisa de filtro adicional (deleta todos)

      const { error } = await query;

      if (error) throw error;

      // Atualizar estado local
      setEvents((prev) => {
        if (scope === "future" && currentEventDate) {
          return prev.filter(
            (e) =>
              e.recurring_group_id !== recurringGroupId ||
              e.date < currentEventDate
          );
        }
        // scope === "all"
        return prev.filter((e) => e.recurring_group_id !== recurringGroupId);
      });

      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    deleteRecurringEvents,
    refresh: fetchEvents,
  };
};
