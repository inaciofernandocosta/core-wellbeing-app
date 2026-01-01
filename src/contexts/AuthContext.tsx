import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    termsAccepted: boolean;
    marketingOptIn: boolean;
  }) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          void ensureProfile(data.session.user);
        }
      }
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        void ensureProfile(newSession.user);
      }
      setLoading(false);
    });

    void init();
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      void ensureProfile(data.user);
    }
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    // Em produção, usa a URL do site; em desenvolvimento, usa localhost
    const baseUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/update-password`
      : "https://lifosmvp.netlify.app/update-password";
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: baseUrl,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async ({
    email,
    password,
    fullName,
    termsAccepted,
    marketingOptIn,
  }: {
    email: string;
    password: string;
    fullName: string;
    termsAccepted: boolean;
    marketingOptIn: boolean;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          terms_accepted: termsAccepted,
          marketing_opt_in: marketingOptIn,
        },
      },
    });
    if (error) return { error: error.message };

    if (data.user) {
      void ensureProfile(data.user);
    }

    return {};
  };

  const ensureProfile = async (user: User | null) => {
    if (!user) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.access_token) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // se já existe ou erro de RLS, não tentar recriar
    if (data || error) {
      if (error) {
        // Log para depuração de 401/RLS sem quebrar a UI
        console.error("ensureProfile error", error.message);
      }
      return;
    }

    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null,
      terms_accepted: user.user_metadata?.terms_accepted ?? false,
      marketing_opt_in: user.user_metadata?.marketing_opt_in ?? false,
    });
  };

  const value: AuthContextValue = {
    session,
    user,
    loading,
    signIn,
    signUp,
    resetPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
