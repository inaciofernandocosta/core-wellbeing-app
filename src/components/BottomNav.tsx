import { Home, Calendar, BarChart3, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, path: "/dashboard", label: "Início" },
  { icon: Calendar, path: "/calendar", label: "Agenda" },
  { icon: BarChart3, path: "/stats", label: "Estatísticas" },
  { icon: Settings, path: "/settings", label: "Configurações" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="bg-card border-t border-border px-4 pb-6 pt-3 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} 
                  />
                  {isActive && (
                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg -z-10" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-1.5 w-32 bg-muted-foreground/20 rounded-full mx-auto absolute bottom-2 left-1/2 -translate-x-1/2" />
    </nav>
  );
};

export default BottomNav;
