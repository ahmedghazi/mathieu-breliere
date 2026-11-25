/**
 * Mini timeline basée sur la Web Animations API.
 * Chaque étape = element.animate(...) en pause, décalée via `delay`.
 * Le contrôle global se fait en pilotant currentTime / playbackRate
 * de toutes les animations en même temps.
 *
 * Position (dernier argument de add), façon GSAP :
 *   undefined  → à la fin de l'étape précédente
 *   '<'        → en même temps que le début de l'étape précédente
 *   '+=200'    → 200 ms après la fin de la précédente
 *   '-=200'    → chevauchement de 200 ms
 *   500        → position absolue en ms
 *   'step2'    → sur un label
 */

export type Position =
  | number
  | "<"
  | `+=${number}`
  | `-=${number}`
  | (string & {});

export type StepOptions = Omit<
  KeyframeAnimationOptions,
  "delay" | "fill" | "duration"
> & {
  duration?: number;
};

export const fadeUp = [
  { opacity: 0, transform: "translateY(40px)" },
  { opacity: 1, transform: "translateY(0)" },
];
export const fadeDown = [
  { opacity: 1, transform: "translateY(40px)" },
  { opacity: 0, transform: "translateY(0px)" },
];

export interface TimelineOptions {
  onUpdate?: (time: number, timeline: Timeline) => void;
  /** Appelé quand la lecture (sens normal) atteint la fin */
  onComplete?: (timeline: Timeline) => void;
}

export class Timeline {
  readonly animations: Animation[] = [];
  readonly labels: Record<string, number> = {};
  duration = 0;

  private readonly targets = new WeakSet<Element>();
  private readonly calls: { time: number; fn: (timeline: Timeline) => void }[] =
    [];
  private prevTime = 0;
  private lastStart = 0;
  private lastEnd = 0;
  private raf: number | null = null;
  private stopAt: number | undefined;
  private readonly onUpdate?: TimelineOptions["onUpdate"];
  private readonly onComplete?: TimelineOptions["onComplete"];

  constructor({ onUpdate, onComplete }: TimelineOptions = {}) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  private resolve(position?: Position): number {
    if (position === undefined) return this.lastEnd;
    if (typeof position === "number") return position;
    if (position === "<") return this.lastStart;
    if (position.startsWith("+="))
      return this.lastEnd + parseFloat(position.slice(2));
    if (position.startsWith("-="))
      return this.lastEnd - parseFloat(position.slice(2));
    if (position in this.labels) return this.labels[position];
    throw new Error(`Position inconnue : ${position}`);
  }

  private toTime(target: number | string): number {
    if (typeof target === "number") return target;
    const t = this.labels[target];
    if (t === undefined) throw new Error(`Label inconnu : ${target}`);
    return t;
  }

  addLabel(name: string, position?: Position): this {
    this.labels[name] = this.resolve(position);
    return this;
  }

  add(
    el: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: StepOptions = {},
    position?: Position,
  ): this {
    const start = this.resolve(position);
    const duration = options.duration ?? 500;
    // Seule la 1re étape d'un élément remplit "avant" (état initial) ;
    // sinon le fill backwards d'une étape suivante écrase les précédentes.
    const isFirstOnEl = !this.targets.has(el);
    this.targets.add(el);
    const anim = el.animate(keyframes, {
      easing: "ease-out",
      ...options,
      duration,
      delay: start,
      fill: isFirstOnEl ? "both" : "forwards",
    });
    anim.pause();
    anim.currentTime = 0;

    this.animations.push(anim);
    this.lastStart = start;
    this.lastEnd = start + duration;
    this.syncDuration();
    return this;
  }

  /** Appelle `fn` quand la lecture franchit `position` (dans les deux sens) */
  call(fn: (timeline: Timeline) => void, position?: Position): this {
    const time = this.resolve(position);
    this.calls.push({ time, fn });
    this.lastStart = this.lastEnd = time;
    this.syncDuration();
    return this;
  }

  private syncDuration(): void {
    this.duration = Math.max(this.duration, this.lastEnd);
    // Toutes les animations durent `duration` (via endDelay) pour que
    // currentTime reste synchronisé jusqu'au bout de la timeline.
    this.animations.forEach((a) => {
      const { delay = 0, duration: d = 0 } = a.effect!.getTiming();
      a.effect!.updateTiming({
        endDelay: this.duration - Number(delay) - Number(d),
      });
    });
  }

  /** Déclenche les `call` franchis entre prevTime et `t` */
  private fireCalls(t: number, rate: number): void {
    const prev = this.prevTime;
    this.calls.forEach(({ time, fn }) => {
      if (rate > 0 ? prev < time && time <= t : t <= time && time < prev)
        fn(this);
    });
    this.prevTime = t;
  }

  get time(): number {
    // currentTime est typé CSSNumberish | null dans lib.dom récent
    return Number(this.animations[0]?.currentTime ?? 0);
  }

  private get rate(): number {
    return this.animations[0]?.playbackRate ?? 1;
  }

  seek(target: number | string): this {
    const time = Math.min(Math.max(this.toTime(target), 0), this.duration);
    this.animations.forEach((a) => (a.currentTime = time));
    this.onUpdate?.(this.time, this);
    return this;
  }

  play(): this {
    this.stopAt = undefined;
    return this.run(1);
  }

  reverse(): this {
    this.stopAt = undefined;
    return this.run(-1);
  }

  pause(): this {
    this.animations.forEach((a) => a.pause());
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    return this;
  }

  restart(): this {
    return this.seek(0).play();
  }

  /** Joue jusqu'à un label (ou un temps) puis s'arrête */
  tweenTo(target: number | string): this {
    const end = this.toTime(target);
    this.run(end >= this.time ? 1 : -1);
    this.stopAt = end;
    return this;
  }

  /** Stoppe et retire les animations des éléments */
  kill(): void {
    this.pause();
    this.animations.forEach((a) => a.cancel());
    this.animations.length = 0;
  }

  private run(rate: 1 | -1): this {
    this.animations.forEach((a) => (a.playbackRate = rate));
    // en bout de course, on repart de l'autre extrémité
    if (rate > 0 && this.time >= this.duration) this.seek(0);
    if (rate < 0 && this.time <= 0) this.seek(this.duration);
    // depuis une extrémité, les `call` placés pile dessus doivent partir aussi
    const t = this.time;
    if (rate > 0) this.prevTime = t <= 0 ? -1 : t;
    else this.prevTime = t >= this.duration ? this.duration + 1 : t;
    this.animations.forEach((a) => a.play());
    this.tick();
    return this;
  }

  private tick(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf);

    const loop = () => {
      const t = this.time;
      const rate = this.rate;

      if (
        this.stopAt !== undefined &&
        ((rate > 0 && t >= this.stopAt) || (rate < 0 && t <= this.stopAt))
      ) {
        const stop = this.stopAt;
        this.stopAt = undefined;
        this.fireCalls(stop, rate);
        this.pause().seek(stop);
        return;
      }

      this.fireCalls(t, rate);
      this.onUpdate?.(t, this);

      if ((rate > 0 && t >= this.duration) || (rate < 0 && t <= 0)) {
        this.pause();
        if (rate > 0) this.onComplete?.(this);
        return;
      }
      this.raf = requestAnimationFrame(loop);
    };

    this.raf = requestAnimationFrame(loop);
  }
}
