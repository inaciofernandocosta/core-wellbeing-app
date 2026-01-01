import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!password || password.length < 6) {
      setError("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Definir nova senha</h1>
          <p className="text-muted-foreground text-sm">
            Crie uma nova senha para concluir a recuperação da conta.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleUpdate}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="new-password">
              Nova senha
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
              Confirmar nova senha
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-500">Senha atualizada! Redirecionando...</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Atualizando..." : "Salvar nova senha"}
          </Button>
        </form>

        <div className="flex justify-center">
          <button
            className="text-xs text-primary/80 hover:underline"
            onClick={() => navigate("/login")}
          >
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
