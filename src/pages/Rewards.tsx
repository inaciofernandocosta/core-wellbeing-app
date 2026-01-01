import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Reward = {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  icon: string | null;
  is_active: boolean;
};

const Rewards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState("1");
  const [icon, setIcon] = useState("🎁");

  useEffect(() => {
    loadRewards();
  }, [user?.id]);

  const loadRewards = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id)
      .order("points_cost", { ascending: true });

    setLoading(false);

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setRewards(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setSaving(true);
    setError(null);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      points_cost: Number(pointsCost),
      icon: icon || null,
      is_active: true,
    };

    let dbError: any = null;

    if (editingId) {
      const { error: updateError } = await supabase
        .from("rewards")
        .update({
          name: payload.name,
          description: payload.description,
          points_cost: payload.points_cost,
          icon: payload.icon,
        })
        .eq("id", editingId)
        .eq("user_id", user.id);
      dbError = updateError;
    } else {
      const { error: insertError } = await supabase.from("rewards").insert(payload);
      dbError = insertError;
    }

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    // Reset form
    setName("");
    setDescription("");
    setPointsCost("1");
    setIcon("🎁");
    setShowForm(false);
    setEditingId(null);

    // Reload rewards
    loadRewards();
  };

  const handleEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setName(reward.name);
    setDescription(reward.description || "");
    setPointsCost(String(reward.points_cost));
    setIcon(reward.icon || "🎁");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);

    const { error: deleteError } = await supabase
      .from("rewards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    loadRewards();
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setPointsCost("1");
    setIcon("🎁");
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const commonEmojis = ["🎁", "🥛", "🍫", "🍕", "🎮", "📱", "🎬", "🎵", "⚽", "🏆", "💰", "🌟"];

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-card ring-1 ring-border/50 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Gerenciar</p>
              <h1 className="text-2xl font-bold text-foreground">Recompensas</h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure suas recompensas personalizadas para resgate de pontos
          </p>
        </header>

        <main className="flex-1 px-6 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Botão Nova Recompensa */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">
              Minhas Recompensas ({rewards.length})
            </h2>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {showForm ? "Fechar" : "Nova"}
            </Button>
          </div>

          {/* Formulário */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-3 bg-card/50 border border-border/60 rounded-2xl p-4">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Editar Recompensa" : "Nova Recompensa"}
              </h3>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Ícone</label>
                <div className="flex gap-2 flex-wrap">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${
                        icon === emoji
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Nome da recompensa</label>
                <Input
                  placeholder="Ex: Anel Diamante"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Descrição (opcional)</label>
                <textarea
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Ex: Um anel de diamante"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Custo em pontos</label>
                <Input
                  type="number"
                  min="1"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando recompensas...
            </div>
          )}

          {/* Lista de Recompensas */}
          {!loading && rewards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Você ainda não criou nenhuma recompensa.
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar primeira recompensa
              </Button>
            </div>
          )}

          {!loading && rewards.length > 0 && (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-card rounded-xl border border-border/60 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      {reward.icon || "🎁"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{reward.name}</h3>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground">{reward.description}</p>
                      )}
                      <p className="text-sm font-medium text-primary mt-1">
                        {reward.points_cost} {reward.points_cost === 1 ? "ponto" : "pontos"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(reward)}
                      className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      disabled={deletingId === reward.id}
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 flex items-center justify-center"
                    >
                      {deletingId === reward.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </>
  );
};

export default Rewards;
