import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, Edit, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PillarShare {
  id: string;
  pillar_id: string;
  permission: "view" | "edit";
  shared_with_email: string;
  pillars: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    user_id: string;
  };
}

export default function SharedPillar() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [share, setShare] = useState<PillarShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedPillar();
  }, [token]);

  const loadSharedPillar = async () => {
    if (!token) {
      setError("Token inválido");
      setLoading(false);
      return;
    }

    try {
      // Buscar compartilhamento usando service role para bypass RLS
      const { data, error } = await supabase
        .from("pillar_shares")
        .select(`
          *,
          pillars (
            id,
            name,
            description,
            icon,
            color,
            user_id
          )
        `)
        .eq("share_token", token)
        .single();

      if (error) {
        console.error("Erro detalhado:", error);
        throw error;
      }

      if (!data) {
        setError("Compartilhamento não encontrado");
      } else {
        setShare(data as any);
      }
    } catch (err: any) {
      console.error("Erro ao carregar compartilhamento:", err);
      
      // Mensagens de erro mais específicas
      if (err.code === "PGRST116") {
        setError("Compartilhamento não encontrado. Verifique se o link está correto.");
      } else if (err.message?.includes("relation") || err.message?.includes("does not exist")) {
        setError("Sistema de compartilhamento ainda não configurado. Execute o SQL no Supabase.");
      } else {
        setError(`Erro ao carregar pilar compartilhado: ${err.message || "Erro desconhecido"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!user) {
      // Redirecionar para login
      navigate("/login", { state: { returnTo: `/shared/pillar/${token}` } });
    } else if (share?.permission === "edit") {
      // Redirecionar para página de edição do pilar
      navigate(`/pillars/${share.pillar_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {error || "Compartilhamento não encontrado"}
          </h1>
          <p className="text-muted-foreground">
            Este link pode ter expirado ou sido removido.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const pillar = share.pillars;
  const canEdit = share.permission === "edit" && user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center`}>
                <span className="text-2xl">{pillar.icon}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{pillar.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {share.permission === "view" ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Visualização</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-3 h-3" />
                      <span>Edição</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {share.permission === "edit" && (
              <Button onClick={handleEditClick} size="sm">
                {user ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Fazer login para editar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Descrição</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {pillar.description || "Sem descrição"}
          </p>
        </div>

        {/* Informações de compartilhamento */}
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>ℹ️ Pilar compartilhado</strong>
            <br />
            {share.permission === "view" ? (
              <>
                Você tem permissão de <strong>visualização</strong> deste pilar.
              </>
            ) : (
              <>
                Você tem permissão de <strong>edição</strong> deste pilar.
                {!user && (
                  <>
                    {" "}
                    <strong>Faça login</strong> para poder editar.
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* CTA para criar conta */}
        {!user && (
          <div className="mt-6 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Crie sua conta gratuita</h3>
            <p className="text-white/90 mb-4">
              Organize sua vida com pilares personalizados, metas e muito mais!
            </p>
            <Button
              onClick={() => navigate("/login")}
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Criar conta grátis
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
