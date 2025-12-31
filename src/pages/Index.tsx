import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import PrincipleCard from "@/components/PrincipleCard";
import HeroButton from "@/components/HeroButton";
import heroWorkspace from "@/assets/hero-workspace.jpg";
import cardSchedule from "@/assets/card-schedule.jpg";
import cardPillars from "@/assets/card-pillars.jpg";
import cardHabits from "@/assets/card-habits.jpg";

const principles = [
  {
    id: 1,
    image: cardSchedule,
    icon: "schedule",
    title: "Open Schedule",
    description: "Planejamento que respira. Adapte seu dia sem quebrar sua sequência de vitórias.",
    progress: 33,
  },
  {
    id: 2,
    image: cardPillars,
    icon: "pentagon",
    title: "Os 5 Pilares",
    description: "Equilibre Vida, Trabalho, Saúde, Família e Hábitos em uma visão unificada.",
    progress: 33,
  },
  {
    id: 3,
    image: cardHabits,
    icon: "track_changes",
    title: "Hábitos Atômicos",
    description: "Construa disciplina com pequenas ações consistentes rastreadas automaticamente.",
    progress: 33,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 280 + 20; // card width + gap
    const newActiveSlide = Math.round(scrollLeft / cardWidth);
    setActiveSlide(Math.min(newActiveSlide, principles.length - 1));
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden max-w-md mx-auto shadow-2xl bg-background">
      {/* Status bar spacer */}
      <div className="flex items-center h-12 justify-end px-4 opacity-50" />

      {/* Main content */}
      <div className="flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-8 px-6 pt-4 pb-8">
          {/* Hero Image */}
          <div 
            className={`w-full aspect-[4/3] rounded-4xl bg-center bg-cover relative overflow-hidden group shadow-neon ring-1 ring-foreground/20 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ backgroundImage: `url(${heroWorkspace})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-90" />
            <div className="absolute top-4 right-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">Life OS 2.0</span>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div 
            className={`flex flex-col gap-4 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h1 className="text-2xl font-black leading-[1.1] tracking-tight text-foreground">
              Organize o caos, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">domine sua vida.</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Equilibre seus objetivos e seu bem-estar, sem perder a flexibilidade do dia a dia.
            </p>
          </div>
        </div>

        {/* Principles Section */}
        <div 
          className={`flex flex-col gap-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-baseline justify-between px-6">
            <h2 className="text-xl font-bold text-foreground">Princípios Fundamentais</h2>
            <span className="text-xs font-bold text-primary uppercase tracking-wider opacity-80">Deslize</span>
          </div>
          
          <div 
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 gap-5 pb-8"
            onScroll={handleScroll}
          >
            {principles.map((principle) => (
              <PrincipleCard
                key={principle.id}
                image={principle.image}
                icon={principle.icon}
                title={principle.title}
                description={principle.description}
                progress={principle.progress}
              />
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex w-full flex-row items-center justify-center gap-2 py-0">
            {principles.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-6 left-0 w-full p-6 pt-24 bg-gradient-to-t from-background via-background/95 to-transparent z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <HeroButton onClick={() => navigate('/dashboard')}>Começar Jornada</HeroButton>
        </div>
        <div className="h-1.5 w-32 bg-muted-foreground/20 rounded-full mx-auto mt-6" />
      </div>
    </div>
  );
};

export default Index;
