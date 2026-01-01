import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type Pillar = {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  progress?: number | null;
  is_default?: boolean | null;
  user_id?: string | null;
};

export const usePillars = () => {
  const { user } = useAuth();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPillars = useCallback(async () => {
    if (!user) {
      setPillars([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1) Buscar pilares compartilhados para este usuário/email
    const sharedFilters = [
      `shared_with_user_id.eq.${user.id}`,
      user.email ? `shared_with_email.eq.${user.email}` : ""
    ]
      .filter(Boolean)
      .join(",");

    const { data: shared, error: sharedError } = await supabase
      .from("pillar_shares")
      .select("pillar_id")
      .or(sharedFilters || undefined);

    if (sharedError) {
      setError(sharedError.message);
      setLoading(false);
      return;
    }

    const sharedIds = (shared ?? []).map((s) => s.pillar_id);

    // 2) Buscar pilares do usuário, padrões e compartilhados (via id.in)
    const baseOrFilters = [
      `user_id.eq.${user.id}`,
      "is_default.eq.true",
      sharedIds.length ? `id.in.(${sharedIds.join(",")})` : ""
    ]
      .filter(Boolean)
      .join(",");

    const { data, error } = await supabase
      .from("pillars")
      .select("*")
      .or(baseOrFilters)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setPillars(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchPillars();
  }, [fetchPillars]);

  return { pillars, loading, error, refetch: fetchPillars };
};
