import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Recuperar senha</h1>
          <p className="text-muted-foreground text-sm">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSend}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email-reset">
              E-mail
            </label>
            <Input
              id="email-reset"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {sent && <p className="text-sm text-emerald-500">Link enviado! Verifique seu e-mail.</p>}

          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Enviando..." : "Enviar link"}
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

export default ForgotPassword;
