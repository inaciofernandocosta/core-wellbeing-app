import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Eye, Edit, Trash2, Copy, Check, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface PillarShare {
  id: string;
  shared_with_email: string;
  permission: "view" | "edit";
  share_token: string;
  created_at: string;
}

interface SharePillarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillarId: string;
  pillarName: string;
}

export default function SharePillarModal({ isOpen, onClose, pillarId, pillarName }: SharePillarModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [shares, setShares] = useState<PillarShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carregar compartilhamentos existentes
  const loadShares = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("pillar_shares")
      .select("*")
      .eq("pillar_id", pillarId)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setShares(data);
    }
  };

  // Compartilhar pilar
  const handleShare = async () => {
    if (!user || !email) return;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("pillar_shares")
        .insert([
          {
            pillar_id: pillarId,
            owner_id: user.id,
            shared_with_email: email.toLowerCase(),
            permission: permission,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          setError("Este email já tem acesso a este pilar");
        } else {
          throw error;
        }
      } else {
        // Enviar email de notificação
        try {
          // Usar URL de produção se estiver em localhost
          const baseUrl = window.location.hostname === 'localhost' 
            ? 'https://lifosmvp.netlify.app' 
            : window.location.origin;
          const shareUrl = `${baseUrl}/shared/pillar/${data.share_token}`;
          
          // Buscar nome do usuário
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          const ownerName = profileData?.full_name || user.email?.split("@")[0] || "Um usuário";

          // Chamar Edge Function para enviar email
          await supabase.functions.invoke("send-share-notification", {
            body: {
              owner_name: ownerName,
              owner_email: user.email,
              shared_with_email: email.toLowerCase(),
              pillar_name: pillarName,
              permission: permission,
              share_url: shareUrl,
            },
          });

          setError(null);
        } catch (emailError) {
          console.error("Erro ao enviar email:", emailError);
          // Não falhar o compartilhamento se o email falhar
          setError(`Pilar compartilhado. Envie o link manualmente para ${email}.`);
        }

        setEmail("");
        setPermission("view");
        await loadShares();
      }
    } catch (err: any) {
      console.error("Erro ao compartilhar:", err);
      setError("Erro ao compartilhar pilar");
    } finally {
      setLoading(false);
    }
  };

  // Remover compartilhamento
  const handleRemoveShare = async (shareId: string) => {
    if (!confirm("Deseja remover este compartilhamento?")) return;

    const { error } = await supabase
      .from("pillar_shares")
      .delete()
      .eq("id", shareId);

    if (!error) {
      await loadShares();
    }
  };

  // Copiar link de compartilhamento
  const handleCopyLink = async (token: string) => {
    // Usar URL de produção se estiver em localhost
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://lifosmvp.netlify.app' 
      : window.location.origin;
    const shareUrl = `${baseUrl}/shared/pillar/${token}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Carregar compartilhamentos ao abrir modal
  useEffect(() => {
    if (isOpen) {
      loadShares();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar: {pillarName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Envie por email e defina a permissão.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Email</p>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Permissão</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPermission("view")}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    permission === "view"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Pode apenas ver o pilar</p>
                </button>
                <button
                  onClick={() => setPermission("edit")}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    permission === "edit"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Edit className="w-4 h-4" />
                    Editar
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Pode editar (requer conta)</p>
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleShare}
              disabled={loading || !email}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? "Compartilhando..." : "Compartilhar"}
            </Button>
          </div>

          {shares.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Compartilhado com</h3>
                <span className="text-xs text-muted-foreground">{shares.length} pessoas</span>
              </div>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="rounded-lg border border-border/80 bg-card px-3 py-2 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {share.shared_with_email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {share.permission === "view" ? <Eye className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                        <span>{share.permission === "view" ? "Visualização" : "Edição"}</span>
                        <span>•</span>
                        <span>{new Date(share.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(share.share_token)}
                        className="h-8 w-8 p-0"
                        title="Copiar link"
                      >
                        {copiedToken === share.share_token ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveShare(share.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3" />
              <span>Visualizar: apenas leitura.</span>
            </div>
            <div className="flex items-center gap-2">
              <Edit className="w-3 h-3" />
              <span>Editar: requer conta, pode alterar o pilar.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
