import { Pillar } from "@/components/AddEventDialog";

export interface Goal {
  id: string;
  title: string;
  description: string;
  pillar: Pillar;
  progress: number;
  milestones: { id: string; text: string; completed: boolean }[];
  createdAt: Date;
}

// Sample goals organized by pillar
export const defaultGoals: Goal[] = [
  // Vida Pessoal
  {
    id: "goal-vida-1",
    title: "Aprender um novo idioma",
    description: "Estudar espanhol 30 minutos por dia",
    pillar: "vida",
    progress: 40,
    milestones: [
      { id: "1", text: "Completar nível básico", completed: true },
      { id: "2", text: "Assistir série sem legenda", completed: false },
    ],
    createdAt: new Date(),
  },
  {
    id: "goal-vida-2",
    title: "Ler 24 livros este ano",
    description: "2 livros por mês",
    pillar: "vida",
    progress: 25,
    milestones: [
      { id: "1", text: "6 livros lidos", completed: true },
      { id: "2", text: "12 livros lidos", completed: false },
    ],
    createdAt: new Date(),
  },
  // Trabalho
  {
    id: "goal-trabalho-1",
    title: "Promoção para sênior",
    description: "Alcançar nível sênior até dezembro",
    pillar: "trabalho",
    progress: 60,
    milestones: [
      { id: "1", text: "Liderar projeto", completed: true },
      { id: "2", text: "Apresentar resultados", completed: false },
    ],
    createdAt: new Date(),
  },
  {
    id: "goal-trabalho-2",
    title: "Certificação AWS",
    description: "Passar no exame de Solutions Architect",
    pillar: "trabalho",
    progress: 30,
    milestones: [
      { id: "1", text: "Completar curso", completed: true },
      { id: "2", text: "Simulados", completed: false },
    ],
    createdAt: new Date(),
  },
  // Saúde
  {
    id: "goal-saude-1",
    title: "Correr 5km sem parar",
    description: "Treino progressivo de corrida",
    pillar: "saude",
    progress: 50,
    milestones: [
      { id: "1", text: "Correr 2km", completed: true },
      { id: "2", text: "Correr 5km", completed: false },
    ],
    createdAt: new Date(),
  },
  {
    id: "goal-saude-2",
    title: "Perder 5kg",
    description: "Alimentação saudável e exercícios",
    pillar: "saude",
    progress: 40,
    milestones: [
      { id: "1", text: "Perder 2kg", completed: true },
      { id: "2", text: "Perder 5kg", completed: false },
    ],
    createdAt: new Date(),
  },
  // Família
  {
    id: "goal-familia-1",
    title: "Jantar em família toda semana",
    description: "Pelo menos um jantar especial por semana",
    pillar: "familia",
    progress: 80,
    milestones: [
      { id: "1", text: "4 jantares no mês", completed: true },
    ],
    createdAt: new Date(),
  },
  {
    id: "goal-familia-2",
    title: "Viagem em família",
    description: "Planejar e fazer uma viagem juntos",
    pillar: "familia",
    progress: 20,
    milestones: [
      { id: "1", text: "Escolher destino", completed: true },
      { id: "2", text: "Reservar", completed: false },
    ],
    createdAt: new Date(),
  },
  // Objetivos
  {
    id: "goal-objetivos-1",
    title: "Economizar R$ 10.000",
    description: "Reserva de emergência",
    pillar: "objetivos",
    progress: 35,
    milestones: [
      { id: "1", text: "R$ 5.000", completed: true },
      { id: "2", text: "R$ 10.000", completed: false },
    ],
    createdAt: new Date(),
  },
  {
    id: "goal-objetivos-2",
    title: "Iniciar projeto paralelo",
    description: "Desenvolver um side project",
    pillar: "objetivos",
    progress: 15,
    milestones: [
      { id: "1", text: "Definir ideia", completed: true },
      { id: "2", text: "MVP", completed: false },
    ],
    createdAt: new Date(),
  },
];

// Helper to get goals by pillar
export const getGoalsByPillar = (goals: Goal[], pillar: Pillar): Goal[] => {
  return goals.filter(goal => goal.pillar === pillar);
};
