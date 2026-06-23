import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Site chrome: fixed top navbar + hamburger + slide-in drawer (with backdrop).
 * All interaction (open/close, scroll-lock, ESC, compact-on-scroll) is driven by
 * the shell's scroll engine, which queries `[data-ab-burger]`, `[data-ab-drawer]`,
 * `[data-ab-backdrop]`, `[data-ab-close]`, `.ab-drawer-link` and `.ab-nav` from
 * the rendered DOM — so the hooks keep working inside this component. Styling
 * comes from the global brand utilities (`.ab-nav`, `.ab-burger`, `.ab-btn-*`…).
 */
@Component({
  selector: 'ab-landing-nav',
  imports: [RouterLink],
  templateUrl: './landing-nav.component.html',
  styleUrl: './landing-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNavComponent {}
