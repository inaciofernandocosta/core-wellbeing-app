import { useState } from "react";

interface PrincipleCardProps {
  image: string;
  icon: string;
  title: string;
  description: string;
  progress?: number;
}

const PrincipleCard = ({ image, icon, title, description, progress = 33 }: PrincipleCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div 
      className={`snap-center shrink-0 w-[280px] flex flex-col rounded-3xl bg-card shadow-card dark:shadow-card-dark overflow-hidden ring-1 ring-foreground/5 transition-transform duration-150 ${isPressed ? 'scale-[0.98]' : ''}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div 
        className="h-40 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-foreground/10 dark:bg-foreground/5" />
        <div className="absolute -bottom-6 right-6 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg z-10 border-4 border-card">
          <span className="material-symbols-outlined text-2xl text-primary-foreground font-bold">
            {icon}
          </span>
        </div>
      </div>
      <div className="p-6 pt-8 flex flex-col gap-3">
        <h3 className="font-bold text-xl text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          {description}
        </p>
      </div>
      <div className="h-1.5 w-full bg-primary/10">
        <div 
          className="h-full bg-primary rounded-r-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PrincipleCard;
