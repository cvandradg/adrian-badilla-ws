import { ChangeDetectionStrategy, Component } from '@angular/core';

type Review = { quote: string; name: string; role: string; initials: string };

@Component({
  selector: 'adrian-badilla-reviews-section',
  templateUrl: './reviews-section.component.html',
  styleUrl: './reviews-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsSectionComponent {
  protected readonly reviews: readonly Review[] = [
    { quote: 'Adrián me preparó para mi primer Nacional y subí al podio. Su nivel de detalle en dieta y posing es de otro mundo.', name: 'Kevin Mora', role: 'Competidor Men’s Physique', initials: 'KM' },
    { quote: 'Bajé 18 kg en 6 meses sin perder músculo. Por primera vez entendí cómo comer de verdad. Me cambió la vida.', name: 'Daniela Rojas', role: 'Clienta online', initials: 'DR' },
    { quote: 'Más que un entrenador, un mentor. Su experiencia como juez se nota en cada corrección que te da.', name: 'José Castro', role: 'Campeón Nacional', initials: 'JC' },
    { quote: 'Empecé desde cero a los 45 y hoy compito. Adrián cree en vos más de lo que vos crees en vos mismo.', name: 'Marvin Vargas', role: 'Classic Physique', initials: 'MV' },
    { quote: 'El plan online es impecable: rutinas claras, ajustes cada semana y respuesta a todas mis dudas. Resultados reales.', name: 'Andrea Solís', role: 'Clienta online', initials: 'AS' },
    { quote: 'Gané 9 kg de masa limpia en una temporada. La progresión de cargas y la técnica que me enseñó marcaron la diferencia.', name: 'Esteban Quirós', role: 'Fuerza y volumen', initials: 'EQ' },
    { quote: 'Llegué a mi boda en la mejor forma de mi vida. Profesional, exigente y siempre pendiente de cada detalle.', name: 'Laura Méndez', role: 'Recomposición', initials: 'LM' },
    { quote: 'Como competidor, su preparación para tarima es de élite: dieta, posing y mentalidad. Confianza total el día del show.', name: 'Diego Herrera', role: 'Culturismo', initials: 'DH' },
  ];

  protected readonly reviewsB: readonly Review[] = [
    { quote: 'El plan online es impecable: rutinas claras, ajustes cada semana y respuesta a todas mis dudas. Resultados reales.', name: 'Andrea Solís', role: 'Clienta online', initials: 'AS' },
    { quote: 'Como competidor, su preparación para tarima es de élite: dieta, posing y mentalidad. Confianza total el día del show.', name: 'Diego Herrera', role: 'Culturismo', initials: 'DH' },
    { quote: 'Gané 9 kg de masa limpia en una temporada. La progresión de cargas y la técnica que me enseñó marcaron la diferencia.', name: 'Esteban Quirós', role: 'Fuerza y volumen', initials: 'EQ' },
    { quote: 'Adrián me preparó para mi primer Nacional y subí al podio. Su nivel de detalle en dieta y posing es de otro mundo.', name: 'Kevin Mora', role: 'Competidor Men’s Physique', initials: 'KM' },
    { quote: 'Llegué a mi boda en la mejor forma de mi vida. Profesional, exigente y siempre pendiente de cada detalle.', name: 'Laura Méndez', role: 'Recomposición', initials: 'LM' },
    { quote: 'Más que un entrenador, un mentor. Su experiencia como juez se nota en cada corrección que te da.', name: 'José Castro', role: 'Campeón Nacional', initials: 'JC' },
    { quote: 'Empecé desde cero a los 45 y hoy compito. Adrián cree en vos más de lo que vos crees en vos mismo.', name: 'Marvin Vargas', role: 'Classic Physique', initials: 'MV' },
    { quote: 'Bajé 18 kg en 6 meses sin perder músculo. Por primera vez entendí cómo comer de verdad. Me cambió la vida.', name: 'Daniela Rojas', role: 'Clienta online', initials: 'DR' },
  ];
}
