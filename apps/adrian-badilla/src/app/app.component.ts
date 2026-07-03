import { Component, computed, inject, resource, Type } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { TourOverlayComponent } from 'adrian-badilla/settings';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { settingsStoreDev } from 'adrian-badilla/settings';
import { FabLayoutStore } from 'adrian-badilla/settings';

@Component({
  imports: [RouterModule, NgComponentOutlet, TourOverlayComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'adrian-badilla';

  private readonly router = inject(Router);
  private readonly settingsStore = inject(settingsStoreDev);
  private readonly fabLayout = inject(FabLayoutStore);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly showChat = computed(() => {
    const url = this.currentUrl();
    return url !== '/' && !url.startsWith('/?') && !url.startsWith('/auth');
  });

  /**
   * Inputs passed to AiCoachChatComponent via ngComponentOutletInputs.
   * This keeps the AI lib decoupled from settingsStoreDev and FabLayoutStore.
   */
  readonly chatInputs = computed(() => ({
    remainingMacros: (this.settingsStore as any).remainingMacros?.() ?? null,
    fabBottomBase: this.fabLayout.fabBaseBottom(),
  }));

  readonly chatResource = resource<Type<unknown> | null, boolean>({
    params: () => this.showChat(),
    loader: async ({ params: shouldShow }) => {
      if (!shouldShow) return null;
      const { AiCoachChatComponent } = await import('@adrian-badilla/ai');
      return AiCoachChatComponent;
    },
  });
}
