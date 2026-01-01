import { LogOut, Gift, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="relative flex flex-col min-h-screen w-full overflow-y-auto max-w-md mx-auto bg-background pb-28">
        <header className="px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm">Gerencie sua conta</p>
        </header>

        <main className="flex-1 px-6 space-y-4">
          <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Usuário</p>
            <p className="text-base font-semibold text-foreground break-all">{user?.email}</p>
          </div>

          {/* Menu de Opções */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-2">Gerenciar</h2>
            
            <button
              onClick={() => navigate("/rewards")}
              className="w-full bg-card rounded-2xl border border-border/60 p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Recompensas</p>
                  <p className="text-sm text-muted-foreground">Configure suas recompensas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </main>
      </div>

      <BottomNav />
    </>
  );
};

export default Settings;
