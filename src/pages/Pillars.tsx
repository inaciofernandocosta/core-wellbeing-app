import { useState } from "react";
import { ChevronLeft, Zap, Target, Heart, Users, Briefcase, Plus, Loader2, Award, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { usePillars } from "@/hooks/usePillars";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import SharePillarModal from "@/components/SharePillarModal";

const Pillars = () => {
  const navigate = useNavigate();
  const { pillars, loading, error, refetch } = usePillars();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("from-primary to-emerald-400");
  const [icon, setIcon] = useState("heart");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<{ id: string; name: string } | null>(null);

  const getPillarRoute = (pillar: { id: string; name: string }): string | null => {
    const routes: Record<string, string> = {
      "Vida Pessoal": "/personal-life",
    };
    return routes[pillar.name] || `/pillars/${pillar.id}`;
  };

  const getIcon = (name?: string | null) => {
    const map: Record<string, React.ComponentType<{ className?: string }>> = {
      heart: Heart,
      briefcase: Briefcase,
      zap: Zap,
      target: Target,
      users: Users,
      award: Award,
    };
    if (name && map[name]) return map[name];
    return Heart;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Informe um nome para o pilar.");
      return;
    }
    if (!user) {
      setFormError("É necessário estar logado.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const { data: createdPillar, error: insertError } = await supabase
      .from("pillars")
      .insert({
        name: name.trim(),
        color,
        icon,
        progress: 0,
        is_default: false,
        user_id: user.id,
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setFormError(insertError.message);
      return;
    }

    setName("");
    setShowForm(false);
    await refetch();
  };

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        {/* Header */}
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-card ring-1 ring-border/50 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Pilares</p>
              <h1 className="text-2xl font-bold text-foreground">Todos os pilares</h1>
            </div>
          </div>
        </header>

        {/* Pillars list */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-8 px-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">Gerencie seus pilares</p>
              {!loading && !error && (
                <p className="text-xs text-primary font-semibold">{pillars.length} pilares</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setShowForm((v) => !v)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo pilar
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mb-4 space-y-3 bg-card/60 border border-border/60 rounded-2xl p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Estudos, Finanças, Criatividade"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cor</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  >
                    <option value="from-primary to-emerald-400">Verde/Primary</option>
                    <option value="from-rose-500 to-pink-500">Rosa</option>
                    <option value="from-blue-500 to-cyan-500">Azul</option>
                    <option value="from-amber-500 to-orange-500">Laranja</option>
                    <option value="from-violet-500 to-purple-500">Roxo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ícone</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    <option value="heart">Coração</option>
                    <option value="briefcase">Trabalho</option>
                    <option value="zap">Energia</option>
                    <option value="target">Objetivo</option>
                    <option value="users">Pessoas</option>
                    <option value="award">Recompensas</option>
                  </select>
                </div>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar pilar"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {loading && (
            <p className="text-sm text-muted-foreground">Carregando pilares...</p>
          )}
          {error && (
            <p className="text-sm text-destructive">Erro ao carregar pilares: {error}</p>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pillars.map((pillar) => {
                const Icon = getIcon(pillar.icon || undefined);
                const progress = pillar.progress ?? 0;
                const color = pillar.color ?? "from-primary to-emerald-400";
                return (
                  <div 
                    key={pillar.id}
                    className="bg-card rounded-2xl p-4 ring-1 ring-border/50 shadow-card dark:shadow-card-dark transition-transform flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => {
                          const route = getPillarRoute(pillar);
                          if (route) navigate(route);
                        }}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base">{pillar.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {pillar.is_default ? "Pilar padrão" : "Pilar personalizado"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPillar({ id: pillar.id, name: pillar.name });
                          setShareModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${color} rounded-full`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Share Modal */}
      {selectedPillar && (
        <SharePillarModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedPillar(null);
          }}
          pillarId={selectedPillar.id}
          pillarName={selectedPillar.name}
        />
      )}
    </>
  );
};

export default Pillars;
