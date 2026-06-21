import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type Stat = { value: string; label: string };
type Review = { quote: string; name: string; role: string; initials: string };
type GalleryItem = {
  src: string;
  label: string;
  depth: number;
  vy: number;
  w: string;
  h: string;
  // Mobile-only vertical layout: big shots stay centered; runs of 2+ small
  // shots zig-zag left/right; a lone small shot between big ones stays centered.
  align: 'left' | 'right' | 'center';
};

@Component({
  selector: 'adrian-badilla-ui-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adrian-badilla-ui-landing-page.component.html',
  styleUrls: ['./adrian-badilla-ui-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The template declares its CSS animations through inline `style="animation:…"`
  // attributes (spinner, hero ribbons marquee, reviews carousel). Emulated
  // encapsulation renames `@keyframes` (e.g. `ab-spin` -> `_ngcontent-…_ab-spin`)
  // but does NOT rewrite inline styles, so those references break and nothing
  // animates. `None` keeps the keyframes global so the inline animations resolve.
  // All selectors in the stylesheet are namespaced under `.ab-root` (or `ab-`/
  // `svc-`/`rev-`/`g-` prefixes) to avoid leaking into the rest of the app.
  encapsulation: ViewEncapsulation.None,
})
export class AdrianBadillaUiLandingPageComponent
  implements AfterViewInit, OnDestroy
{
  /** 'Verde' | 'Azul' | 'Naranja' */
  @Input() accentColor: 'Verde' | 'Azul' | 'Naranja' = 'Verde';
  @Input() showApp = true;

  private host = inject(ElementRef<HTMLElement>);
  private cleanup: Array<() => void> = [];
  private hRaf = 0;
  private runStatsCount: (() => void) | null = null;
  private syncChromeFn: (() => void) | null = null;

  // ---- accent ----
  private accentMap: Record<string, [string, string]> = {
    Verde: ['hsl(142 90% 61%)', 'hsl(142 70% 45%)'],
    Azul: ['hsl(217 91% 62%)', 'hsl(217 80% 48%)'],
    Naranja: ['hsl(20 95% 57%)', 'hsl(20 90% 46%)'],
  };
  get accent(): string {
    return (this.accentMap[this.accentColor] || this.accentMap['Verde'])[0];
  }
  get accentDark(): string {
    return (this.accentMap[this.accentColor] || this.accentMap['Verde'])[1];
  }

  // ---- data ----
  stats: Stat[] = [
    { value: '30+', label: 'Campeones nacionales formados' },
    { value: '25+', label: 'Años de experiencia' },
    { value: 'Juez', label: 'Federación Nacional de Fisicoculturismo' },
    { value: '5.0★', label: 'Valoración de sus clientes' },
  ];

  credentials: string[] = [
    'Excompetidor de culturismo de alto nivel',
    'Juez principal de la Federación Nacional (CR)',
    '+30 campeones nacionales preparados',
    'Coaching presencial en San José y online',
  ];

  reviews: Review[] = [
    { quote: 'Adrián me preparó para mi primer Nacional y subí al podio. Su nivel de detalle en dieta y posing es de otro mundo.', name: 'Kevin Mora', role: 'Competidor Men’s Physique', initials: 'KM' },
    { quote: 'Bajé 18 kg en 6 meses sin perder músculo. Por primera vez entendí cómo comer de verdad. Me cambió la vida.', name: 'Daniela Rojas', role: 'Clienta online', initials: 'DR' },
    { quote: 'Más que un entrenador, un mentor. Su experiencia como juez se nota en cada corrección que te da.', name: 'José Castro', role: 'Campeón Nacional', initials: 'JC' },
    { quote: 'Empecé desde cero a los 45 y hoy compito. Adrián cree en vos más de lo que vos crees en vos mismo.', name: 'Marvin Vargas', role: 'Classic Physique', initials: 'MV' },
    { quote: 'El plan online es impecable: rutinas claras, ajustes cada semana y respuesta a todas mis dudas. Resultados reales.', name: 'Andrea Solís', role: 'Clienta online', initials: 'AS' },
    { quote: 'Gané 9 kg de masa limpia en una temporada. La progresión de cargas y la técnica que me enseñó marcaron la diferencia.', name: 'Esteban Quirós', role: 'Fuerza y volumen', initials: 'EQ' },
    { quote: 'Llegué a mi boda en la mejor forma de mi vida. Profesional, exigente y siempre pendiente de cada detalle.', name: 'Laura Méndez', role: 'Recomposición', initials: 'LM' },
    { quote: 'Como competidor, su preparación para tarima es de élite: dieta, posing y mentalidad. Confianza total el día del show.', name: 'Diego Herrera', role: 'Culturismo', initials: 'DH' },
  ];

  reviewsB: Review[] = [
    { quote: 'El plan online es impecable: rutinas claras, ajustes cada semana y respuesta a todas mis dudas. Resultados reales.', name: 'Andrea Solís', role: 'Clienta online', initials: 'AS' },
    { quote: 'Como competidor, su preparación para tarima es de élite: dieta, posing y mentalidad. Confianza total el día del show.', name: 'Diego Herrera', role: 'Culturismo', initials: 'DH' },
    { quote: 'Gané 9 kg de masa limpia en una temporada. La progresión de cargas y la técnica que me enseñó marcaron la diferencia.', name: 'Esteban Quirós', role: 'Fuerza y volumen', initials: 'EQ' },
    { quote: 'Adrián me preparó para mi primer Nacional y subí al podio. Su nivel de detalle en dieta y posing es de otro mundo.', name: 'Kevin Mora', role: 'Competidor Men’s Physique', initials: 'KM' },
    { quote: 'Llegué a mi boda en la mejor forma de mi vida. Profesional, exigente y siempre pendiente de cada detalle.', name: 'Laura Méndez', role: 'Recomposición', initials: 'LM' },
    { quote: 'Más que un entrenador, un mentor. Su experiencia como juez se nota en cada corrección que te da.', name: 'José Castro', role: 'Campeón Nacional', initials: 'JC' },
    { quote: 'Empecé desde cero a los 45 y hoy compito. Adrián cree en vos más de lo que vos crees en vos mismo.', name: 'Marvin Vargas', role: 'Classic Physique', initials: 'MV' },
    { quote: 'Bajé 18 kg en 6 meses sin perder músculo. Por primera vez entendí cómo comer de verdad. Me cambió la vida.', name: 'Daniela Rojas', role: 'Clienta online', initials: 'DR' },
  ];

  galleryItems: GalleryItem[] = this.buildGallery();

  private buildGallery(): GalleryItem[] {
    const resultados = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16']
      .map((n) => `/global/assets/img/resultados/${n}.webp`);
    const gLabels = ['Definición','Fuerza','Escenario','Posing','Disciplina','Volumen','Simetría','Preparación','Constancia','Resultado','Physique','Detalle','Potencia','Forma','Enfoque','Victoria'];
    // [height vh, aspect w/h, vertical offset vh, parallax depth]
    const gRhythm: number[][] = [
      [28, 0.82, -12, 0.04], [38, 1.30, 8, -0.03], [24, 0.80, 18, 0.05],
      [40, 1.12, -3, 0.0], [26, 0.82, 15, 0.04], [32, 1.25, -16, -0.04],
      [24, 0.78, 9, 0.05], [38, 1.10, -8, -0.03], [28, 0.85, 14, 0.04],
      [24, 0.80, -17, 0.06], [40, 1.28, 3, -0.04], [27, 0.82, 17, 0.03],
      [34, 1.15, -12, -0.05], [24, 0.80, 7, 0.05], [28, 0.84, 16, -0.03], [36, 1.20, -6, 0.04],
    ];
    // A shot is "big" when it's tall or wide; everything else is "small".
    const isBig = (i: number) => {
      const [h, ar] = gRhythm[i % gRhythm.length];
      return h >= 36 || ar >= 1.2;
    };
    // Walk the list assigning mobile alignment: consecutive runs of 2+ small
    // shots alternate left/right; lone smalls and all big shots stay centered.
    const N = resultados.length;
    const aligns: Array<'left' | 'right' | 'center'> = new Array(N).fill('center');
    let i = 0;
    while (i < N) {
      if (isBig(i)) { i++; continue; }
      let j = i;
      while (j < N && !isBig(j)) j++;
      if (j - i >= 2) {
        for (let k = i; k < j; k++) aligns[k] = (k - i) % 2 === 0 ? 'left' : 'right';
      }
      i = j;
    }
    return resultados.map((src, idx) => {
      const [h, ar, vy, depth] = gRhythm[idx % gRhythm.length];
      return {
        src,
        label: gLabels[idx % gLabels.length],
        depth,
        vy,
        w: `max(150px, ${(h * ar).toFixed(1)}vh)`,
        h: `${h}vh`,
        align: aligns[idx],
      };
    });
  }

  // ======================================================================
  //  Scroll engine (ported 1:1 from the prototype)
  // ======================================================================
  ngAfterViewInit(): void {
    const root: HTMLElement = this.host.nativeElement;
    const q = (sel: string) => root.querySelector(sel) as HTMLElement | null;
    const qa = (sel: string) =>
      Array.from(root.querySelectorAll(sel)) as HTMLElement[];

    // ---- loader hide ----
    const hide = () => {
      const el = q('[data-ab-loader]');
      if (!el) return;
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      setTimeout(() => el.style.setProperty('display', 'none', 'important'), 750);
    };
    if (document.readyState === 'complete') setTimeout(hide, 650);
    else window.addEventListener('load', () => setTimeout(hide, 450));
    setTimeout(hide, 3000);

    const on = (
      t: EventTarget,
      ev: string,
      fn: EventListenerOrEventListenerObject,
      opts?: boolean | AddEventListenerOptions
    ) => {
      t.addEventListener(ev, fn, opts);
      this.cleanup.push(() => t.removeEventListener(ev, fn, opts));
    };

    const nav = q('.ab-nav');
    const burger = q('[data-ab-burger]');
    const drawer = q('[data-ab-drawer]');
    const backdrop = q('[data-ab-backdrop]');
    const closeBtn = q('[data-ab-close]');
    const drawerLinks = drawer
      ? (Array.from(drawer.querySelectorAll('.ab-drawer-link')) as HTMLElement[])
      : [];

    // ---- drawer ----
    let drawerOpen = false;
    // Scroll-lock state. We CANNOT use `body { overflow: hidden }` here: the
    // global `html, body { height: 100% }` makes that clip everything below the
    // fold, collapsing the scrollable height to 0 and snapping the page to the
    // top (hero). Instead we pin the body with `position: fixed` at the current
    // offset and restore it on close, so the scroll position is preserved.
    let lockedScrollY = 0;
    const lockScroll = () => {
      lockedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    };
    const unlockScroll = () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      // Restore the offset INSTANTLY. The global `scroll-behavior: smooth` would
      // otherwise animate this restore from the top (the page sits at 0 while the
      // body is pinned) down to where the user was — an ugly hero→section glide.
      const root = document.documentElement;
      const prevBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, lockedScrollY);
      root.style.scrollBehavior = prevBehavior;
    };
    const setLinksHidden = () =>
      drawerLinks.forEach((l) => {
        l.style.transitionDelay = '0ms';
        l.style.opacity = '0';
        l.style.transform = 'translateX(24px)';
      });
    setLinksHidden();
    const openDrawer = () => {
      drawerOpen = true;
      if (drawer) drawer.style.transform = 'translateX(0)';
      if (backdrop) { backdrop.style.opacity = '1'; backdrop.style.pointerEvents = 'auto'; }
      if (burger) burger.style.opacity = '0';
      lockScroll();
      drawerLinks.forEach((l, i) => {
        l.style.transitionDelay = 130 + i * 55 + 'ms';
        l.style.opacity = '1';
        l.style.transform = 'translateX(0)';
      });
    };
    const closeDrawer = () => {
      drawerOpen = false;
      if (drawer) drawer.style.transform = 'translateX(105%)';
      if (backdrop) { backdrop.style.opacity = '0'; backdrop.style.pointerEvents = 'none'; }
      unlockScroll();
      setLinksHidden();
      this.syncChromeFn?.();
    };
    if (burger) on(burger, 'click', openDrawer);
    if (closeBtn) on(closeBtn, 'click', closeDrawer);
    if (backdrop) on(backdrop, 'click', closeDrawer);
    drawerLinks.forEach((l) => on(l, 'click', closeDrawer));
    on(document, 'keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape' && drawerOpen) closeDrawer();
    });

    // ---- nav hide / burger show ----
    const syncChrome = () => {
      const y = window.scrollY;
      const compact = y > 90 || window.innerWidth < 900;
      if (nav) {
        nav.style.transform = compact ? 'translateY(-130%)' : 'translateY(0)';
        nav.style.pointerEvents = compact ? 'none' : 'auto';
      }
      if (burger && !drawerOpen) {
        if (compact) {
          burger.style.transition = 'opacity .3s ease .15s, transform .3s ease .15s, background .2s ease, border-color .2s ease';
          burger.style.opacity = '1'; burger.style.transform = 'translateY(0)'; burger.style.pointerEvents = 'auto';
        } else {
          burger.style.transition = 'opacity .22s ease, transform .22s ease, background .2s ease, border-color .2s ease';
          burger.style.opacity = '0'; burger.style.transform = 'translateY(-12px)'; burger.style.pointerEvents = 'none';
        }
      }
    };
    this.syncChromeFn = syncChrome;
    on(window, 'scroll', syncChrome, { passive: true });
    on(window, 'resize', syncChrome);
    syncChrome();

    // ---- narrative scroll engine ----
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    // Phones get a different choreography (vertical galleries, proportional hero
    // image, un-pinned scenes). Desktop keeps the pinned scrollytelling intact.
    const isMobile = () => window.innerWidth <= 820;

    type ScrubItem = {
      el: HTMLElement;
      x?: number[]; y?: number[]; s?: number[]; o?: number[];
      rot?: number[]; blur?: number[]; mask?: string; range: number[];
    };
    const scrubEls: ScrubItem[] = [];
    if (!reduced) {
      const pair = (s: string) => s.split(',').map(parseFloat);
      const build = (el: HTMLElement): Omit<ScrubItem, 'el'> => {
        const r: any = {};
        if (el.hasAttribute('data-sy')) r.y = pair(el.getAttribute('data-sy')!);
        if (el.hasAttribute('data-sx')) r.x = pair(el.getAttribute('data-sx')!);
        if (el.hasAttribute('data-ss')) r.s = pair(el.getAttribute('data-ss')!);
        if (el.hasAttribute('data-so')) r.o = pair(el.getAttribute('data-so')!);
        if (el.hasAttribute('data-sr')) r.rot = pair(el.getAttribute('data-sr')!);
        if (el.hasAttribute('data-sblur')) r.blur = pair(el.getAttribute('data-sblur')!);
        if (el.hasAttribute('data-mask')) r.mask = el.getAttribute('data-mask') || 'up';
        r.range = el.hasAttribute('data-srange') ? pair(el.getAttribute('data-srange')!) : [0, 0.55];
        if (!r.y && !r.x && !r.s && !r.o && !r.rot && !r.mask && !r.blur) {
          r.y = [120, 0]; r.o = [0, 1]; r.s = [0.94, 1];
        }
        return r;
      };
      qa('[data-scrub]').forEach((el) => scrubEls.push(Object.assign({ el }, build(el))));
      qa('[data-scrub-group]').forEach((c) => {
        Array.from(c.children).forEach((child) =>
          scrubEls.push({ el: child as HTMLElement, y: [160, 0], o: [0, 1], s: [0.85, 1], range: [0, 0.72] })
        );
      });
      scrubEls.forEach((it) => (it.el.style.willChange = 'transform, opacity'));
    }
    const applyScrub = () => {
      const vh = window.innerHeight;
      for (const it of scrubEls) {
        const rect = it.el.getBoundingClientRect();
        const p = (vh - rect.top) / (vh + rect.height);
        const t = ease(clamp01((p - it.range[0]) / (it.range[1] - it.range[0])));
        let tf = '';
        if (it.x) tf += `translateX(${(it.x[0] + (it.x[1] - it.x[0]) * t).toFixed(2)}px) `;
        if (it.y) tf += `translateY(${(it.y[0] + (it.y[1] - it.y[0]) * t).toFixed(2)}px) `;
        if (it.s) tf += `scale(${(it.s[0] + (it.s[1] - it.s[0]) * t).toFixed(4)}) `;
        if (it.rot) tf += `rotate(${(it.rot[0] + (it.rot[1] - it.rot[0]) * t).toFixed(2)}deg) `;
        if (tf) it.el.style.transform = tf;
        if (it.o) it.el.style.opacity = (it.o[0] + (it.o[1] - it.o[0]) * t).toFixed(3);
        if (it.blur) it.el.style.filter = `blur(${(it.blur[0] + (it.blur[1] - it.blur[0]) * t).toFixed(2)}px)`;
        if (it.mask) {
          const hidden = ((1 - t) * 100).toFixed(2);
          let cp: string;
          if (it.mask === 'left') cp = `inset(0 ${hidden}% 0 0)`;
          else if (it.mask === 'right') cp = `inset(0 0 0 ${hidden}%)`;
          else if (it.mask === 'circle') cp = `circle(${(t * 80 + 12).toFixed(2)}% at 50% 50%)`;
          else cp = `inset(${hidden}% 0 0 0)`;
          it.el.style.clipPath = cp;
          (it.el.style as any).webkitClipPath = cp;
        }
      }
    };

    // parallax
    const plx = qa('[data-parallax]');
    const applyParallax = () => {
      if (reduced) return;
      const vh = window.innerHeight;
      for (const el of plx) {
        const r = el.getBoundingClientRect();
        const off = r.top + r.height / 2 - vh / 2;
        const sp = parseFloat(el.getAttribute('data-parallax') || '0.08') || 0.08;
        el.style.transform = `translate3d(0,${(-off * sp).toFixed(1)}px,0)`;
      }
    };

    // pinned horizontal gallery
    const hSection = q('[data-h-gallery]');
    const hSticky = hSection ? (hSection.querySelector('[data-h-sticky]') as HTMLElement | null) : null;
    const hTrack = hSection ? (hSection.querySelector('[data-h-track]') as HTMLElement | null) : null;
    let hMax = 0;
    const measureH = () => {
      if (!hSection || !hTrack) return;
      if (reduced || isMobile()) {
        // Un-pin the horizontal scene. Phones show the gallery as a vertical
        // stacked story (CSS), so clear the pin + any per-figure transforms left
        // over from a desktop->mobile resize.
        hSection.style.height = 'auto';
        if (hSticky) { hSticky.style.position = 'static'; hSticky.style.height = 'auto'; }
        hTrack.style.transform = 'none';
        const kids = hTrack.children;
        for (let i = 0; i < kids.length; i++) {
          const f = kids[i] as HTMLElement;
          f.style.transform = 'none'; f.style.opacity = '1';
          const im = f.querySelector('img') as HTMLElement | null;
          if (im) im.style.filter = 'none';
        }
        // Non-mobile reduced-motion users keep a horizontal scroll fallback.
        if (reduced && !isMobile() && hTrack.parentElement) {
          (hTrack.parentElement as HTMLElement).style.overflowX = 'auto';
        }
        hMax = 0;
        return;
      }
      if (hSticky) { hSticky.style.position = 'sticky'; hSticky.style.height = '100vh'; }
      hMax = Math.max(0, hTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.12);
      hSection.style.height = Math.max(170, (hMax / window.innerHeight) * 62 + 95) + 'vh';
    };
    let hCur = 0; let hTarget = 0;
    const applyH = () => {
      if (reduced || isMobile() || !hSection || !hTrack) return;
      const total = hSection.offsetHeight - window.innerHeight;
      const prog = total > 0 ? clamp01(-hSection.getBoundingClientRect().top / total) : 0;
      hTarget = hMax * prog;
    };
    const renderH = (pos: number) => {
      if (reduced || isMobile() || !hSection || !hTrack) return;
      const prog = hMax > 0 ? pos / hMax : 0;
      hTrack.style.transform = `translate3d(${(-pos).toFixed(1)}px,0,0)`;
      const vw = window.innerWidth, cx = vw / 2, kids = hTrack.children;
      for (let i = 0; i < kids.length; i++) {
        const fig = kids[i] as HTMLElement;
        const r = fig.getBoundingClientRect();
        const d = Math.min(1, Math.abs(r.left + r.width / 2 - cx) / (vw * 0.6));
        const depth = parseFloat(fig.getAttribute('data-depth') || '0') || 0;
        const vy = (parseFloat(fig.getAttribute('data-vy') || '0') || 0) * window.innerHeight / 100;
        const driftX = (prog - 0.5) * depth * vw;
        let driftY = vy + (1 - d) * -10;
        const bandH = (hTrack.parentElement as HTMLElement).clientHeight;
        const figH = fig.offsetHeight;
        const maxOff = Math.max(0, (bandH - figH) / 2 - 6);
        if (driftY > maxOff) driftY = maxOff;
        else if (driftY < -maxOff) driftY = -maxOff;
        const s = (0.97 + 0.05 * (1 - d)).toFixed(3);
        fig.style.transform = `translate3d(${driftX.toFixed(1)}px,${driftY.toFixed(1)}px,0) scale(${s})`;
        fig.style.opacity = (0.55 + 0.45 * (1 - d)).toFixed(3);
        const img = fig.querySelector('img') as HTMLElement | null;
        if (img) img.style.filter = `grayscale(${(0.65 * d).toFixed(2)}) brightness(${(1 - 0.22 * d).toFixed(2)})`;
        const cap = fig.querySelector('.g-cap') as HTMLElement | null;
        if (cap) cap.style.color = `rgba(${d < 0.45 ? '198,255,120' : '255,255,255'},${(0.35 + 0.5 * (1 - d)).toFixed(2)})`;
      }
    };

    // hero pinned scrollytelling
    const scene = q('[data-hero-scene]');
    const frame = scene ? (scene.querySelector('[data-hero-frame]') as HTMLElement | null) : null;
    const heroContent = scene ? (scene.querySelector('[data-hero-content]') as HTMLElement | null) : null;
    const ribbons = scene ? (scene.querySelector('[data-hero-ribbons]') as HTMLElement | null) : null;
    const heroStats = scene ? (scene.querySelector('[data-hero-stats]') as HTMLElement | null) : null;
    const heroCue = scene ? (scene.querySelector('[data-hero-cue]') as HTMLElement | null) : null;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let statsCounted = false;
    const applyHeroScene = () => {
      if (!scene || !frame) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      const total = scene.offsetHeight - vh;
      const p = total > 0 ? clamp01(-scene.getBoundingClientRect().top / total) : 0;
      if (heroContent) {
        const c = clamp01(1 - p / 0.3);
        heroContent.style.opacity = c.toFixed(3);
        heroContent.style.transform = `translateY(${(-p * 70).toFixed(1)}px)`;
        heroContent.style.pointerEvents = c < 0.05 ? 'none' : 'auto';
      }
      if (heroCue) heroCue.style.opacity = clamp01(1 - p / 0.12).toFixed(3);
      const sT = ease(clamp01((p - 0.05) / 0.6));
      // On phones the shrunk frame must stay well-proportioned (a portrait card,
      // ~4:5) instead of the thin desktop sliver, and centered. On desktop it
      // shrinks to a side panel as before.
      const targetW = isMobile() ? Math.min(vw * 0.82, 360) : Math.min(vw * 0.42, 600);
      const targetH = isMobile() ? targetW * 1.25 : vh * 0.5;
      frame.style.width = lerp(vw, targetW, sT).toFixed(1) + 'px';
      frame.style.height = lerp(vh, targetH, sT).toFixed(1) + 'px';
      frame.style.borderRadius = (sT * (isMobile() ? 22 : 16)).toFixed(1) + 'px';
      if (ribbons) ribbons.style.opacity = clamp01((p - 0.2) / 0.35).toFixed(3);
      if (heroStats) {
        heroStats.style.opacity = clamp01((p - 0.46) / 0.08).toFixed(3);
        const head = heroStats.firstElementChild as HTMLElement | null;
        if (head) {
          const ht = ease(clamp01((p - 0.5) / 0.28));
          head.style.opacity = ht.toFixed(3);
          head.style.transform = `translateY(${((1 - ht) * 28).toFixed(1)}px)`;
        }
        const row = heroStats.querySelector('[data-ab-stats]');
        if (row) {
          const it = row.children;
          for (let i = 0; i < it.length; i++) {
            const st = ease(clamp01((p - (0.56 + i * 0.05)) / 0.3));
            (it[i] as HTMLElement).style.opacity = st.toFixed(3);
            (it[i] as HTMLElement).style.transform = `translateY(${((1 - st) * 55).toFixed(1)}px)`;
          }
        }
      }
      if (!statsCounted && p > 0.5 && this.runStatsCount) {
        statsCounted = true;
        this.runStatsCount();
      }
    };

    // about open scene
    const aScene = q('[data-about-scene]');
    const aPhoto = aScene ? (aScene.querySelector('[data-about-photo]') as HTMLElement | null) : null;
    const aText = aScene ? (aScene.querySelector('[data-about-text]') as HTMLElement | null) : null;
    const aReveal = q('[data-about-reveal]');
    if (aReveal && !reduced) {
      aReveal.style.opacity = '0';
      aReveal.style.transform = 'translateY(46px)';
      aReveal.style.transition = 'opacity 1s cubic-bezier(.2,.7,.2,1), transform 1s cubic-bezier(.2,.7,.2,1)';
      const aio = new IntersectionObserver(
        (es) => es.forEach((e) => {
          if (e.isIntersecting) {
            aReveal.style.opacity = '1';
            aReveal.style.transform = 'none';
            aio.disconnect();
          }
        }),
        { threshold: 0.18 }
      );
      aio.observe(aReveal);
      this.cleanup.push(() => aio.disconnect());
    }
    const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const applyAboutScene = () => {
      if (!aScene || !aPhoto || !aText) return;
      // On small screens the scene un-pins (CSS), so the about block flows
      // normally — neutralize the scroll-driven slide/fade and let CSS own it.
      if (window.innerWidth <= 820) {
        aPhoto.style.transform = 'none'; aPhoto.style.opacity = '1';
        aText.style.transform = 'none'; aText.style.opacity = '1';
        return;
      }
      const vw = window.innerWidth;
      const total = aScene.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp01(-aScene.getBoundingClientRect().top / total) : 0;
      const t = easeIO(clamp01((p - 0.28) / 0.22));
      const off = vw * 0.55;
      aPhoto.style.transform = `translateX(${(-t * off).toFixed(1)}px)`;
      aPhoto.style.opacity = (1 - t).toFixed(3);
      aText.style.transform = `translateX(${(t * off).toFixed(1)}px)`;
      aText.style.opacity = (1 - t).toFixed(3);
    };

    // services appears within about scene
    const sContent = aScene ? (aScene.querySelector('[data-services-content]') as HTMLElement | null) : null;
    const applyServicesScene = () => {
      if (!aScene || !sContent) return;
      // On small screens the scene un-pins (CSS): show the plans at rest and
      // mark them ready so the CTAs are clickable, without scroll-driven fading.
      if (window.innerWidth <= 820) {
        sContent.style.opacity = '1';
        sContent.style.transform = 'none';
        sContent.classList.add('svc-ready');
        return;
      }
      const total = aScene.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp01(-aScene.getBoundingClientRect().top / total) : 0;
      // Complementary cross-fade with the "about" scene: services fades IN on
      // exactly the same window/curve the about block fades OUT (easeIO over
      // 0.28..0.50). That guarantees about_opacity + services_opacity === 1 at
      // every scroll position, so the two never sit at ~0 simultaneously and the
      // viewport is never left fully black between the two segments.
      const t = easeIO(clamp01((p - 0.28) / 0.22));
      sContent.style.opacity = t.toFixed(3);
      sContent.style.transform = `scale(${(0.94 + 0.06 * t).toFixed(3)})`;
      // Only enable card hover once the scene is fully positioned, otherwise a
      // card under the resting cursor would enter already-expanded while the
      // section is still scaling/fading in. `svc-ready` flips pointer-events on.
      sContent.classList.toggle('svc-ready', t > 0.999);
    };

    // ---- mobile-only "Tu preparador" cinematic ----
    // Photo reveals (back-to-front) -> infinite zoom into the black shirt (which
    // blends into the black bg) -> the text emerges from the black and the two
    // groups (info / credentials) converge in. Desktop: element is display:none
    // and this no-ops.
    const cine = q('[data-about-cine]');
    const cPhoto = cine?.querySelector('.abc-photo') as HTMLElement | null;
    const cName = cine?.querySelector('.abc-name') as HTMLElement | null;
    const cContent = cine?.querySelector('.abc-content') as HTMLElement | null;
    const cInfo = cine?.querySelector('.abc-col--info') as HTMLElement | null;
    const cCreds = cine?.querySelector('.abc-col--creds') as HTMLElement | null;
    const applyAboutCine = () => {
      if (!cine || !cPhoto || !isMobile()) return;
      const total = cine.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp01(-cine.getBoundingClientRect().top / total) : 0;

      // A (0 -> .20): full image grows from small, "Adrián" name behind it.
      // B (.20 -> .42): infinite zoom into the shirt; image dissolves to black.
      const a = ease(clamp01(p / 0.2));
      const b = ease(clamp01((p - 0.2) / 0.22));
      const photoFade = clamp01((p - 0.32) / 0.1);
      cPhoto.style.transform = `scale(${(0.45 + a * 0.55 + b * 3.1).toFixed(3)})`;
      cPhoto.style.opacity = (a * (1 - photoFade)).toFixed(3);

      if (cName) {
        const nameFade = clamp01((p - 0.3) / 0.1);
        cName.style.transform = `translate(-50%,-50%) scale(${(0.85 + a * 0.15 + b * 0.45).toFixed(3)})`;
        cName.style.opacity = (a * 0.5 * (1 - nameFade)).toFixed(3);
      }

      // C (.40 -> .60): text + checkboxes emerge from the black WITH the same
      //   zoom feel (scale up + fade in), already assembled.
      // D (.74 -> 1): on further scroll the two blocks split — info exits left,
      //   credentials exit right — clearing the way for the plans below.
      const c = ease(clamp01((p - 0.4) / 0.2));
      const d = ease(clamp01((p - 0.74) / 0.26));
      if (cContent) {
        cContent.style.opacity = (c * (1 - d)).toFixed(3);
        cContent.style.transform = `scale(${(0.7 + c * 0.3).toFixed(3)})`;
      }
      if (cInfo) cInfo.style.transform = `translateX(${(-d * 92).toFixed(1)}%)`;
      if (cCreds) cCreds.style.transform = `translateX(${(d * 92).toFixed(1)}%)`;
    };

    const tick = () => {
      applyScrub(); applyParallax(); applyHeroScene();
      applyAboutScene(); applyServicesScene(); applyAboutCine(); applyH();
    };
    const hLoop = () => {
      hCur += (hTarget - hCur) * 0.09;
      if (Math.abs(hTarget - hCur) < 0.12) hCur = hTarget;
      renderH(hCur);
      this.hRaf = requestAnimationFrame(hLoop);
    };
    measureH();
    if (!reduced) { hTarget = hCur = 0; hLoop(); }
    on(window, 'scroll', tick, { passive: true });
    on(window, 'resize', () => { measureH(); tick(); });
    on(window, 'load', () => { measureH(); tick(); });
    tick();

    // stats count-up
    const statSection = q('[data-ab-stats]');
    if (statSection && !reduced) {
      const parsed = Array.from(statSection.children)
        .map((c) => c.firstElementChild as HTMLElement | null)
        .filter(Boolean)
        .map((el) => {
          const raw = (el!.textContent || '').trim();
          const m = raw.match(/^([\d]+(?:[.,][\d]+)?)(.*)$/);
          if (!m) return null;
          const dec = (m[1].split(/[.,]/)[1] || '').length;
          return { el: el!, num: parseFloat(m[1].replace(',', '.')), suffix: m[2], dec };
        });
      parsed.forEach((p) => { if (p) p.el.textContent = (p.dec ? (0).toFixed(p.dec) : '0') + p.suffix; });
      this.runStatsCount = () => {
        parsed.forEach((p) => {
          if (!p) return;
          const start = performance.now(), dur = 1500;
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const v = p.num * (1 - Math.pow(1 - t, 3));
            p.el.textContent = (p.dec ? v.toFixed(p.dec) : Math.round(v)) + p.suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      };
    }
  }

  ngOnDestroy(): void {
    if (this.hRaf) cancelAnimationFrame(this.hRaf);
    this.cleanup.forEach((fn) => fn());
    // Clear any scroll-lock left behind if destroyed while the drawer is open.
    const body = document.body.style;
    body.overflow = '';
    body.position = '';
    body.top = '';
    body.left = '';
    body.right = '';
    body.width = '';
  }
}
