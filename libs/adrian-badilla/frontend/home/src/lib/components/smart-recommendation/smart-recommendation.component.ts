import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recommendation } from '../../models/home.model';

interface NutritionTip {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const TIPS: NutritionTip[] = [
  { icon: '🧠', title: 'Sabías que...', description: 'Tu cerebro consume el 20% de tus calorías diarias, aunque solo representa el 2% de tu peso corporal.', color: '#38bdf8' },
  { icon: '🥗', title: 'Sabías que...', description: 'Comer despacio mejora la digestión y te ayuda a reconocer cuándo estás satisfecho.', color: '#22d3ee' },
  { icon: '💪', title: 'Dato fitness', description: 'El músculo quema 3 veces más calorías en reposo que la grasa. Más músculo = más quema pasiva.', color: '#8b5cf6' },
  { icon: '🥚', title: 'Nutrición', description: 'Un huevo contiene todos los aminoácidos esenciales. Es una de las proteínas más completas que existen.', color: '#f59e0b' },
  { icon: '💧', title: 'Hidratación', description: 'Beber agua antes de comer puede reducir la ingesta calórica hasta un 13%.', color: '#22d3ee' },
  { icon: '🏃', title: 'Movimiento', description: 'Solo 10 minutos de caminata rápida mejoran tu humor y concentración por hasta 2 horas.', color: '#38bdf8' },
  { icon: '🍌', title: 'Sabías que...', description: 'Los plátanos tienen triptófano, un aminoácido que tu cuerpo convierte en serotonina (hormona de la felicidad).', color: '#f59e0b' },
  { icon: '😴', title: 'Descanso', description: 'Dormir menos de 7 horas aumenta la hormona del hambre (grelina) hasta un 28%.', color: '#8b5cf6' },
  { icon: '🫁', title: 'Dato fitness', description: 'La respiración profunda entre series reduce el cortisol y mejora la recuperación muscular.', color: '#22d3ee' },
  { icon: '🥑', title: 'Grasas buenas', description: 'Las grasas saludables del aguacate ayudan a absorber vitaminas A, D, E y K hasta 5 veces mejor.', color: '#38bdf8' },
  { icon: '🔥', title: 'Metabolismo', description: 'El efecto térmico de la proteína quema un 20-30% de sus calorías solo en la digestión.', color: '#f59e0b' },
  { icon: '🧘', title: 'Balance', description: 'Meditar 5 minutos al día reduce el cortisol, la hormona que promueve el almacenamiento de grasa abdominal.', color: '#8b5cf6' },
];

function getRandomTips(count: number): NutritionTip[] {
  const shuffled = [...TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

@Component({
  selector: 'lib-smart-recommendation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './smart-recommendation.component.html',
  styleUrl: './smart-recommendation.component.scss',
})
export class SmartRecommendationComponent {
  recommendation = input.required<Recommendation>();
  tips = getRandomTips(3);
}
