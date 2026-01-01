import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, loading, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  // Se o link de recuperação apontar para /login com hash de recovery, redireciona para a página de nova senha
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      navigate("/update-password", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Informe seu nome completo.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não conferem.");
        return;
      }
      if (!termsAccepted) {
        setError("É necessário aceitar os termos de uso.");
        return;
      }
    }

    setIsSubmitting(true);
    const action = mode === "login"
      ? signIn(email, password)
      : signUp({ email, password, fullName, termsAccepted, marketingOptIn });

    const { error } = await action;
    setIsSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Carregando...
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acesse sua conta para gerenciar seus pilares.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="fullName">
                Nome completo
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {mode === "signup" && (
            <div className="space-y-3 text-sm text-foreground">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <span>
                  Aceito os Termos de Uso e Política de Privacidade.
                </span>
              </label>
              <label className="flex items-start gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                />
                <span>
                  Desejo receber ofertas e comunicações por e-mail e WhatsApp.
                </span>
              </label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground text-center space-y-2">
          {mode === "login" ? (
            <p>
              Não tem conta?{" "}
              <button
                className="text-primary font-semibold hover:underline"
                onClick={() => setMode("signup")}
              >
                Criar conta
              </button>
            </p>
          ) : (
            <p>
              Já possui conta?{" "}
              <button
                className="text-primary font-semibold hover:underline"
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
            </p>
          )}
          <div className="flex flex-col items-center gap-2 pt-2">
            {mode === "login" && (
              <button
                type="button"
                className="text-xs text-primary font-semibold hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Esqueceu a senha?
              </button>
            )}
            <button
              className="text-xs text-primary/80 hover:underline"
              onClick={() => navigate("/")}
            >
              Voltar para início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
