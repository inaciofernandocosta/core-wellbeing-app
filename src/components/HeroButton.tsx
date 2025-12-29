import { ArrowRight } from "lucide-react";

interface HeroButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const HeroButton = ({ onClick, children }: HeroButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all rounded-full flex items-center justify-between px-2 pl-8 shadow-neon-strong group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-foreground/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <span className="text-primary-foreground font-extrabold text-lg tracking-wide relative z-10">
        {children}
      </span>
      <div className="h-12 w-12 bg-foreground/10 rounded-full flex items-center justify-center relative z-10 group-hover:bg-foreground/20 transition-colors">
        <ArrowRight className="w-5 h-5 text-primary-foreground" />
      </div>
    </button>
  );
};

export default HeroButton;
