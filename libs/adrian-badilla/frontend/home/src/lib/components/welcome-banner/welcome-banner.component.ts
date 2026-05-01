import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MotivationalQuote {
  text: string;
  author: string;
}

const QUOTES: MotivationalQuote[] = [
  { text: 'El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.', author: 'Albert Schweitzer' },
  { text: 'Tu cuerpo puede soportar casi todo. Es tu mente la que tienes que convencer.', author: 'Anónimo' },
  { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali' },
  { text: 'Cada comida es una oportunidad para nutrir tu cuerpo.', author: 'Anónimo' },
  { text: 'La disciplina es el puente entre las metas y los logros.', author: 'Jim Rohn' },
  { text: 'Cuida tu cuerpo, es el único lugar que tienes para vivir.', author: 'Jim Rohn' },
  { text: 'La constancia es la madre de la maestría.', author: 'Robin Sharma' },
];

@Component({
  selector: 'lib-welcome-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-banner.component.html',
  styleUrl: './welcome-banner.component.scss',
})
export class WelcomeBannerComponent {
  greeting = this.getGreeting();
  quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  today = new Date();
  dayName = this.today.toLocaleDateString('es-ES', { weekday: 'long' });
  dateFormatted = this.today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
