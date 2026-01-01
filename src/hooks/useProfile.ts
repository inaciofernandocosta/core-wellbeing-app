import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  full_name?: string | null;
  terms_accepted?: boolean | null;
  marketing_opt_in?: boolean | null;
  created_at?: string | null;
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else {
      setProfile(data ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};
