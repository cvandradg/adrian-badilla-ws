import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

export interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  tagColor: string;
  gradient: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: '1',
    title: 'Batido Proteico Tropical',
    subtitle: '35g de proteína · Solo 220 kcal',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&h=340&fit=crop',
    tag: 'Receta',
    tagColor: '#22d3ee',
    gradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(56, 189, 248, 0.05))',
  },
  {
    id: '2',
    title: 'Plan Premium -30%',
    subtitle: 'Desbloquea IA avanzada y planes personalizados',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=340&fit=crop',
    tag: 'Promo',
    tagColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.05))',
  },
  {
    id: '3',
    title: 'Bowl Mediterráneo',
    subtitle: 'Equilibrio perfecto de macros en un plato',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=340&fit=crop',
    tag: 'Receta',
    tagColor: '#22d3ee',
    gradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.05))',
  },
  {
    id: '4',
    title: 'Proteína Whey Isolate',
    subtitle: 'La mejor calidad para tus metas fitness',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=340&fit=crop',
    tag: 'Producto',
    tagColor: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(56, 189, 248, 0.05))',
  },
];

@Component({
  selector: 'lib-promo-carousel',
  standalone: true,
  imports: [CarouselModule, ButtonModule],
  templateUrl: './promo-carousel.component.html',
  styleUrl: './promo-carousel.component.scss',
})
export class PromoCarouselComponent {
  slides = PROMO_SLIDES;

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 },
  ];
}
