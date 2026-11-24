"use client";

import {
  Children,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * Scroll virtuel : pas de scroll natif, chaque enfant (section) est translaté
 * en translate3d, avec interpolation (lerp) dans requestAnimationFrame.
 * Aux extrémités, la main est rendue au scroll natif de la page (footer…).
 *
 * Le scroller prend la hauteur de son parent (100%) : il fonctionne en plein
 * écran comme dans un bloc de la page. Le viewport virtuel est sa propre
 * boîte, pas la fenêtre. C'est un container CSS (`container-type: size`) :
 * dans les sections, `100cqh` = hauteur du scroller (`100cqw` en axe x).
 *
 * axis="x" : défilement horizontal (molette verticale ou horizontale, swipe
 * gauche / droite, flèches gauche / droite). Changeable à chaud, ex. mobile :
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * <ScrollerVirtual axis={isMobile ? "x" : "y"}>
 *
 * <ScrollerVirtual ref={ref} onIndexChange={setIndex}>
 *   <section>…</section>
 *   <section>…</section>
 * </ScrollerVirtual>
 *
 * ref.current.next() / prev() / goTo(i)
 *
 * Contrôlé : <ScrollerVirtual index={index} onIndexChange={setIndex}>
 * (la section suit `index`, les gestes remontent via onIndexChange)
 */

export type ScrollerAxis = "x" | "y";

export type ScrollerVirtualProps = {
  children: ReactNode;
  /**
   * Axe de défilement, "y" par défaut. En "x", les sections sont côte à côte,
   * chacune large d'au moins le scroller (plus large si son contenu l'impose).
   */
  axis?: ScrollerAxis;
  /** Multiplicateur appliqué au delta molette / touch. 1 = natif */
  speed?: number;
  /** Facteur d'interpolation par frame à 60 fps (0–1). Plus bas = plus fluide/lent */
  lerp?: number;
  /**
   * Skew max (deg) des sections (skewY, skewX en axe x) pendant la transition. 0 = désactivé.
   * En snap : nul quand une section est calée, max à mi-chemin entre deux
   * sections, toujours dans le même sens (effet Buzzman ≈ 4).
   * En scroll libre : proportionnel à la vitesse.
   */
  skew?: number;
  /**
   * Parallaxe des éléments marqués `data-scroller-parallax` dans une section :
   * décalage = -progression × hauteur × parallax (Buzzman ≈ 0.5). 0 = désactivé
   */
  parallax?: number;
  /** Skew (deg) des éléments `data-scroller-parallax` par section d'écart (Buzzman ≈ 8) */
  parallaxSkew?: number;
  /** Snap section par section, actif par défaut (un geste molette / swipe = une section). false = scroll libre */
  snap?: boolean;
  /**
   * Section affichée (mode contrôlé). Quand elle change, le scroller y va
   * (animé). À coupler avec onIndexChange pour suivre les gestes.
   */
  index?: number;
  /**
   * Écoute la molette sur toute la fenêtre, pas seulement au survol du
   * scroller. Les éléments scrollables survolés (liste…) gardent leur scroll
   * natif tant qu'ils peuvent scroller dans ce sens.
   */
  globalWheel?: boolean;
  /** Idem pour le swipe (mobile) : écoute le touch sur toute la fenêtre */
  globalTouch?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Appelé à chaque frame où la position change (px sur l'axe) */
  onScroll?: (pos: number, progress: number) => void;
  /** Appelé quand la section active change */
  onIndexChange?: (index: number, total: number) => void;
};

export type ScrollerVirtualHandle = {
  next: () => void;
  prev: () => void;
  goTo: (index: number, opts?: { immediate?: boolean }) => void;
  /** Scroll vers une position en px */
  scrollTo: (y: number, opts?: { immediate?: boolean }) => void;
  getState: () => {
    y: number;
    max: number;
    progress: number;
    index: number;
    total: number;
  };
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** addEventListener typé, retourne la fonction de nettoyage */
const listen = <K extends keyof WindowEventMap>(
  target: Window | HTMLElement,
  type: K,
  fn: (e: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) => {
  target.addEventListener(type, fn as EventListener, options);
  return () => target.removeEventListener(type, fn as EventListener, options);
};

/** Silence (ms) entre deux events wheel pour considérer un nouveau geste */
const GESTURE_GAP = 160;
/**
 * Trackpad : un nouveau geste peut démarrer pendant l'inertie du précédent,
 * donc sans silence. On le détecte quand le delta remonte nettement alors que
 * le geste en cours dure depuis au moins GESTURE_MIN_AGE ms.
 */
const GESTURE_MIN_AGE = 250;
const GESTURE_JUMP = 1.8;
/** Distance (px) min d'un swipe pour changer de section en mode snap */
const SWIPE_MIN = 50;
/** Vitesse (px/ms) min d'un flick pour changer de section en mode snap */
const FLICK_MIN = 0.2;
/** Distance (px) min parcourue pour qu'un flick compte (évite les taps) */
const FLICK_MIN_DIST = 12;
/** Durée (ms) de l'inertie au lâcher : vitesse (px/ms) × INERTIA = distance */
const INERTIA = 250;
/** Dépassement (fraction d'écran) en dessous duquel une section n'est pas « haute » */
const TALL_TOLERANCE = 0.15;
/** Pas (px) des flèches clavier */
const ARROW_STEP = 100;
/** Direction des touches gérées (Espace est ramené à PageUp / PageDown) */
const KEY_DIR: Record<string, 1 | -1> = {
  ArrowDown: 1,
  PageDown: 1,
  End: 1,
  ArrowUp: -1,
  PageUp: -1,
  Home: -1,
};
/** Touches ajoutées en axe x */
const KEY_DIR_X: Record<string, 1 | -1> = {
  ...KEY_DIR,
  ArrowRight: 1,
  ArrowLeft: -1,
};

const ScrollerVirtual = forwardRef<ScrollerVirtualHandle, ScrollerVirtualProps>(
  function ScrollerVirtual(
    {
      children,
      axis = "y",
      speed = 1,
      lerp = 0.1,
      skew = 0,
      parallax = 0,
      parallaxSkew = 0,
      snap = true,
      index,
      globalWheel = false,
      globalTouch = false,
      className,
      style,
      onScroll,
      onIndexChange,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const items = Children.toArray(children);

    // Props lues dans la boucle sans relancer les effets
    const latest = {
      speed,
      lerp,
      skew,
      parallax,
      parallaxSkew,
      snap,
      onScroll,
      onIndexChange,
    };
    const opts = useRef(latest);
    opts.current = latest;

    // État persistant entre re-renders / changements d'enfants
    const s = useRef({
      target: 0,
      current: 0,
      max: 0,
      vh: 0,
      index: -1,
      tops: [] as number[],
      heights: [] as number[],
      /** doigt posé : la position suit le doigt sans lerp */
      dragging: false,
      /** axe du dernier montage de l'effet (détecte un changement d'axe) */
      axis: null as ScrollerAxis | null,
    });
    /** Relance la boucle rAF (en veille quand rien ne bouge) */
    const wake = useRef(() => {});

    // --- Helpers partagés (effet + ref) ----------------------------------
    const total = () => s.current.tops.length;

    const setIndex = (i: number) => {
      const st = s.current;
      if (i === st.index) return;
      st.index = i;
      opts.current.onIndexChange?.(i, total());
    };

    /** Index de la section qui occupe le milieu de l'écran */
    const indexAt = (y: number) => {
      const { tops, vh } = s.current;
      let i = 0;
      for (let k = 0; k < tops.length; k++) if (tops[k] <= y + vh * 0.5) i = k;
      return i;
    };

    /** Section courante (avant le premier setIndex : celle à l'écran) */
    const currentIndex = () => {
      const st = s.current;
      return st.index < 0 ? indexAt(st.target) : st.index;
    };

    /** Haut d'une section, borné à la plage scrollable */
    const sectionTop = (i: number) => clamp(s.current.tops[i], 0, s.current.max);

    /**
     * Bas d'une section (pour les sections plus hautes que l'écran).
     * Un léger dépassement (ex. section en 100vh dans un conteneur en 100dvh
     * sur mobile, barre d'URL affichée) n'en fait pas une section « haute ».
     */
    const sectionEnd = (i: number) => {
      const { tops, heights, vh, max } = s.current;
      if (heights[i] - vh < vh * TALL_TOLERANCE) return sectionTop(i);
      return clamp(tops[i] + heights[i] - vh, 0, max);
    };

    const scrollTo = (y: number, o?: { immediate?: boolean }) => {
      const st = s.current;
      st.target = clamp(y, 0, st.max);
      if (o?.immediate) st.current = st.target;
      wake.current();
    };

    const goTo = (
      i: number,
      o?: { immediate?: boolean; fromEnd?: boolean },
    ) => {
      if (!total()) return;
      i = clamp(i, 0, total() - 1);
      scrollTo(o?.fromEnd ? sectionEnd(i) : sectionTop(i), o);
      setIndex(i);
    };

    /** Pas suivant / précédent en mode snap */
    const step = (dir: 1 | -1) =>
      // en remontant vers une section haute, on arrive par son bas
      goTo(currentIndex() + dir, { fromEnd: dir < 0 });

    useImperativeHandle(ref, () => ({
      next: () => step(1),
      prev: () => step(-1),
      goTo: (i, o) => goTo(i, o),
      scrollTo,
      getState() {
        const { current, max, index } = s.current;
        return {
          y: current,
          max,
          progress: max ? current / max : 0,
          index,
          total: total(),
        };
      },
    }));

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const st = s.current;
      // Toute la logique travaille sur une seule position (« y » / « vh » =
      // position / taille sur l'axe). Seuls mesure, rendu et entrées en dépendent.
      const horizontal = axis === "x";
      const axisChanged = st.axis !== null && st.axis !== axis;
      st.axis = axis;
      const sections = sectionRefs.current
        .slice(0, items.length)
        .filter(Boolean) as HTMLDivElement[];
      // lu à chaque frame : suit un changement du réglage système
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      // --- Boucle rAF + lerp ---------------------------------------------
      // Active seulement pendant un mouvement : en veille quand la position
      // est atteinte, relancée par wake() (geste, goTo, resize…).
      let raf = 0;
      let last = 0;
      let dirty = true;
      wake.current = () => {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      };

      // --- Mesure ---------------------------------------------------------
      let parallaxEls: HTMLElement[][] = [];
      const measure = () => {
        // viewport virtuel = la boîte du scroller, pas la fenêtre
        st.vh = horizontal ? root.clientWidth : root.clientHeight;
        parallaxEls = sections.map((el) =>
          Array.from(
            el.querySelectorAll<HTMLElement>("[data-scroller-parallax]"),
          ),
        );
        let acc = 0;
        st.tops = [];
        st.heights = [];
        for (const el of sections) {
          st.tops.push(acc);
          // non affecté par les transforms
          const h = horizontal ? el.offsetWidth : el.offsetHeight;
          st.heights.push(h);
          acc += h;
        }
        st.max = Math.max(0, acc - st.vh);
        // En snap, on reste calé sur la section courante après un resize
        // (mobile : la barre d'URL change la hauteur en plein geste). On ne
        // coupe pas une animation en cours, on corrige la cible. Pendant un
        // drag on ne recale pas : le doigt est entre deux sections, le
        // ramener sur la section courante annulerait le swipe au lâcher.
        if (opts.current.snap && st.index >= 0 && !st.dragging) {
          const i = Math.min(st.index, st.tops.length - 1);
          const settled = Math.abs(st.target - st.current) < 1;
          // section haute : on garde la position à l'intérieur
          st.target = clamp(st.target, sectionTop(i), sectionEnd(i));
          if (settled) st.current = st.target;
        }
        st.target = clamp(st.target, 0, st.max);
        st.current = clamp(st.current, 0, st.max);
        dirty = true;
        wake.current();
      };

      const ro = new ResizeObserver(measure);
      ro.observe(root);
      sections.forEach((el) => ro.observe(el));

      // --- Rendu ----------------------------------------------------------
      /**
       * Distance (en hauteurs d'écran) entre la position courante et la
       * position calée la plus proche. Une section haute est « calée » sur
       * toute sa plage [haut, bas].
       */
      const snapDistance = () => {
        let d = Infinity;
        for (let i = 0; i < st.tops.length; i++) {
          const a = sectionTop(i);
          const b = Math.max(a, sectionEnd(i));
          const di =
            st.current < a
              ? a - st.current
              : st.current > b
                ? st.current - b
                : 0;
          if (di < d) d = di;
        }
        return st.vh ? d / st.vh : 0;
      };

      /** Sections visibles au dernier rendu */
      const shown: boolean[] = [];
      const render = (full: boolean) => {
        const { current, target, vh, tops, heights } = st;
        const { skew: k, parallax: px, parallaxSkew: pk } = opts.current;
        // skew des sections
        let sk = 0;
        if (k) {
          sk = opts.current.snap
            ? // Buzzman : 0 calé → max à mi-chemin, toujours négatif
              -clamp(snapDistance() / 0.5, 0, 1) * k
            : // scroll libre : selon la vitesse (écart cible / courant)
              -clamp((target - current) / (vh * 0.25), -1, 1) * k;
        }
        const skewFn = horizontal ? "skewX" : "skewY";
        const translate = (v: number | string) =>
          horizontal ? `translate3d(${v}px,0,0)` : `translate3d(0,${v}px,0)`;
        const skewT = sk ? ` ${skewFn}(${sk.toFixed(3)}deg)` : "";
        for (let i = 0; i < sections.length; i++) {
          const y = Math.round((tops[i] - current) * 100) / 100;
          const visible = y < vh && y + heights[i] > 0;
          // Section hors écran : posée une fois à sa vraie position (hors du
          // cadre) puis laissée. visibility n'affecte pas les
          // IntersectionObserver, une section restée en 0 serait « dans
          // l'écran » (=> toutes les vidéos chargées et lues en même temps).
          if (!visible && !shown[i] && !full) continue;
          const el = sections[i];
          if (visible !== shown[i]) el.style.visibility = visible ? "" : "hidden";
          shown[i] = visible;
          el.style.transform = `${translate(y)}${visible ? skewT : ""}`;
          // parallaxe interne : p = 0 quand la section est calée, ±1 une section plus loin
          if (visible && (px || pk) && parallaxEls[i].length) {
            const p = vh ? y / vh : 0;
            const t = `${translate((-p * vh * px).toFixed(2))} ${skewFn}(${(-Math.abs(p) * pk).toFixed(3)}deg)`;
            for (const inner of parallaxEls[i]) inner.style.transform = t;
          }
        }
      };

      const tick = (now: number) => {
        raf = 0;
        const dt = Math.min(now - last, 64);
        last = now;
        const prev = st.current;
        // lerp indépendant du framerate (60 / 120 Hz)
        const f =
          reducedMotion.matches || st.dragging
            ? 1
            : 1 -
              Math.pow(
                1 - clamp(opts.current.lerp, 0.001, 1),
                dt / (1000 / 60),
              );
        st.current += (st.target - st.current) * f;
        if (Math.abs(st.target - st.current) < 0.05) st.current = st.target;

        const moved = st.current !== prev;
        if (dirty || moved) render(dirty);
        dirty = false;
        if (moved) {
          opts.current.onScroll?.(st.current, st.max ? st.current / st.max : 0);
          if (!opts.current.snap) setIndex(indexAt(st.current));
        }
        if (st.current !== st.target) raf = requestAnimationFrame(tick);
      };

      const add = (dy: number, min = 0, max = st.max) =>
        scrollTo(clamp(st.target + dy, min, max));

      /** L'animation vers la section cible est-elle encore en cours ? */
      const animating = () => Math.abs(st.target - st.current) > st.vh * 0.08;

      /**
       * Mode snap : si la section courante dépasse l'écran, on scrolle librement
       * à l'intérieur. Retourne true si le delta a été consommé.
       */
      const scrollInside = (dy: number) => {
        const i = currentIndex();
        const top = sectionTop(i);
        const end = sectionEnd(i);
        if (end - top < 1) return false;
        if (
          (dy > 0 && st.target < end - 0.5) ||
          (dy < 0 && st.target > top + 0.5)
        ) {
          add(dy, top, end);
          return true;
        }
        return false;
      };

      // --- Relais avec le scroll natif de la page -------------------------
      /**
       * Scroll de page (px) nécessaire pour caler le scroller dans le viewport.
       * Plus haut que l'écran : son haut calé en haut du viewport. Sinon : il
       * doit être entièrement visible. 0 = calé.
       */
      const offset = () => {
        const r = root.getBoundingClientRect();
        const wh = window.innerHeight;
        if (r.height >= wh - 1 || r.top < 0) return r.top;
        return r.bottom > wh ? r.bottom - wh : 0;
      };
      /** Le scroller est-il (au moins en partie) dans le viewport ? */
      const onScreen = () => {
        const r = root.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      };
      const pageCanScroll = (dir: number) => {
        const d = document.scrollingElement || document.documentElement;
        return dir > 0
          ? d.scrollTop + window.innerHeight < d.scrollHeight - 1
          : d.scrollTop > 0;
      };

      /**
       * Rend la main au scroll natif de la page (ex. footer après le scroller) :
       * - le scroller n'est pas calé dans le viewport (la page a scrollé)
       * - ou on est sur la dernière section en descendant / la première en
       *   remontant, animation terminée, et la page peut encore scroller
       */
      const release = (dy: number) => {
        if (!dy) return false;
        if (Math.abs(offset()) > 1) return true;
        if (!pageCanScroll(dy)) return false;
        // pas besoin d'attendre la fin exacte du lerp (queue longue) :
        // l'animation vers la section doit juste être quasi finie
        if (animating()) return false;
        const snapMode = opts.current.snap;
        if (dy > 0)
          return snapMode
            ? // fin de la dernière section (tolérance TALL_TOLERANCE comprise)
              st.index >= total() - 1 &&
                st.target >= sectionEnd(total() - 1) - 0.5
            : st.target >= st.max - 0.5;
        return (!snapMode || st.index <= 0) && st.target <= 0.5;
      };

      /**
       * Mode global : la cible (hors scroller) est-elle dans un élément
       * scrollable (liste…) qui peut encore scroller dans ce sens ?
       */
      const nativeScrollable = (target: EventTarget | null, dy: number) => {
        let el = target instanceof Element ? target : null;
        while (el && el !== root && el !== document.body) {
          if (
            el.scrollHeight > el.clientHeight + 1 &&
            (dy > 0
              ? el.scrollTop + el.clientHeight < el.scrollHeight - 1
              : el.scrollTop > 0) &&
            /(auto|scroll)/.test(getComputedStyle(el).overflowY)
          )
            return true;
          el = el.parentElement;
        }
        return false;
      };
      const outside = (target: EventTarget | null) =>
        !root.contains(target as Node);

      // --- Molette --------------------------------------------------------
      let lastWheel = 0;
      let lastAbs = 0;
      let gestureStart = 0;
      let wheelNative = false;
      const onWheel = (e: WheelEvent) => {
        if (
          globalWheel &&
          outside(e.target) &&
          nativeScrollable(e.target, e.deltaY)
        )
          return;
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? st.vh : 1;
        // axe x : molette verticale (souris) ou horizontale (trackpad), la plus forte
        const delta =
          horizontal && Math.abs(e.deltaX) > Math.abs(e.deltaY)
            ? e.deltaX
            : e.deltaY;
        const raw = delta * unit;
        const abs = Math.abs(raw);
        const now = performance.now();
        const newGesture =
          now - lastWheel > GESTURE_GAP ||
          (now - gestureStart > GESTURE_MIN_AGE &&
            abs > lastAbs * GESTURE_JUMP &&
            abs - lastAbs > 8);
        if (newGesture) gestureStart = now;
        lastWheel = now;
        lastAbs = abs;
        if (!raw) return;
        const dy = raw * opts.current.speed;

        // décidé une fois par geste : tout le geste va à la page ou au scroller
        if (newGesture) wheelNative = release(dy);
        if (wheelNative) {
          // en revenant vers le scroller, on se cale pile dessus sans le
          // dépasser, et la fin du geste (inertie) est absorbée
          const top = offset();
          if ((top < 0 && raw <= top) || (top > 0 && raw >= top)) {
            e.preventDefault();
            window.scrollBy(0, top);
            wheelNative = false;
          }
          return;
        }
        e.preventDefault();

        if (!opts.current.snap) return add(dy);
        if (scrollInside(dy)) return;
        // un geste (y compris l'inertie trackpad qui suit) = une section
        if (newGesture && !animating()) step(dy > 0 ? 1 : -1);
      };

      // --- Touch ----------------------------------------------------------
      let startX = 0;
      let startY = 0;
      let ty = 0;
      let tt = 0;
      let tv = 0; // vitesse lissée, px/ms (> 0 = doigt qui monte)
      let startTarget = 0;
      let startIndex = 0;
      let inside = false;
      /** cible du touchstart, hors du scroller (mode globalTouch) */
      let outsideTarget: EventTarget | null = null;
      /**
       * Décidé au premier mouvement significatif, pour tout le geste :
       * null = pas encore décidé · "self" = le scroller · "page" = scroll
       * natif (footer, liste…) · "ignore" = geste horizontal ou multi-doigts
       */
      let touchMode: null | "self" | "page" | "ignore" = null;

      /** Coordonnée du doigt sur l'axe / sur l'axe croisé */
      const along = (t: Touch) => (horizontal ? t.clientX : t.clientY);
      const across = (t: Touch) => (horizontal ? t.clientY : t.clientX);

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          // pinch / 2 doigts : on lâche
          touchMode = "ignore";
          st.dragging = false;
          return;
        }
        touchMode = null;
        startX = across(e.touches[0]);
        ty = startY = along(e.touches[0]);
        tt = performance.now();
        tv = 0;
        inside = false;
        outsideTarget = outside(e.target) ? e.target : null;
      };

      /** Premier mouvement significatif : à qui va le geste ? */
      const decide = (t: Touch) => {
        const ddx = Math.abs(across(t) - startX);
        const ddy = Math.abs(along(t) - startY);
        if (ddx < 4 && ddy < 4) return null; // seuil de décision pas atteint
        // geste sur l'axe croisé : natif (en axe x, le scroll vertical de la page)
        if (ddx > ddy) return "ignore";
        const dy = startY - along(t);
        // en axe x, un swipe horizontal ne peut pas être rendu au scroll
        // (vertical) de la page : il reste au scroller
        if (
          !horizontal &&
          ((outsideTarget && nativeScrollable(outsideTarget, dy)) ||
            release(dy))
        )
          return "page";
        // le doigt « attrape » le scroller là où il est, même en pleine animation
        st.dragging = true;
        st.target = st.current;
        startTarget = st.target;
        startIndex = currentIndex();
        // ty / tt restent ceux du touchstart : le déplacement déjà fait compte
        return "self";
      };

      const onTouchMove = (e: TouchEvent) => {
        const t = e.touches[0];
        if (touchMode === null) touchMode = decide(t);
        if (touchMode !== "self") return; // natif (pan-y), ignoré ou indécis
        e.preventDefault();

        const now = performance.now();
        const raw = ty - along(t);
        if (!raw) return;
        const v = raw / Math.max(now - tt, 1);
        tv = tv * 0.2 + v * 0.8;
        ty = along(t);
        tt = now;
        const dy = raw * opts.current.speed;

        if (!opts.current.snap) return add(dy);
        if (scrollInside(dy)) {
          inside = true;
          return;
        }
        // drag borné aux sections voisines : on ne saute pas 2 sections au doigt
        const lo = startIndex > 0 ? sectionEnd(startIndex - 1) : 0;
        const hi =
          startIndex < total() - 1 ? sectionTop(startIndex + 1) : st.max;
        add(dy, Math.min(lo, st.target), Math.max(hi, st.target));
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (e.touches.length) return; // il reste un doigt posé
        const mode = touchMode;
        touchMode = null;
        st.dragging = false;
        if (mode !== "self") return;
        // vitesse au lâcher (0 si le doigt s'est arrêté avant de lâcher)
        const v = performance.now() - tt < 100 ? tv : 0;
        const fling = v * opts.current.speed * INERTIA;
        if (!opts.current.snap) return add(fling);
        if (
          inside &&
          st.target !== startTarget &&
          Math.abs(st.target - st.tops[startIndex]) < st.heights[startIndex]
        ) {
          // on a scrollé à l'intérieur d'une section haute : inertie bornée à la section
          return add(fling, sectionTop(startIndex), sectionEnd(startIndex));
        }
        // direction : celle du flick s'il y en a un (intention au lâcher),
        // sinon celle de la distance parcourue
        const dist = st.target - startTarget;
        const dir =
          Math.abs(v) > FLICK_MIN && Math.abs(dist) > FLICK_MIN_DIST
            ? Math.sign(v)
            : Math.abs(dist) > SWIPE_MIN
              ? Math.sign(dist)
              : 0;
        st.index = startIndex;
        if (dir) step(dir > 0 ? 1 : -1);
        else goTo(startIndex); // retour élastique
      };

      // --- Clavier --------------------------------------------------------
      const onKey = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement;
        if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
          return;
        // scroller dans un bloc de la page : clavier natif s'il est hors écran
        if (!onScreen()) return;
        const key =
          e.key === " " ? (e.shiftKey ? "PageUp" : "PageDown") : e.key;
        const dir = (horizontal ? KEY_DIR_X : KEY_DIR)[key];
        if (!dir || release(dir)) return; // touche non gérée ou clavier natif
        e.preventDefault();
        const arrow = key.startsWith("Arrow");
        if (key === "Home") goTo(0);
        else if (key === "End") goTo(total() - 1, { fromEnd: true });
        else if (!opts.current.snap)
          add(dir * (arrow ? ARROW_STEP : st.vh * 0.9));
        // flèches : d'abord à l'intérieur d'une section haute
        else if (!arrow || !scrollInside(dir * ARROW_STEP)) step(dir);
      };

      // Le focus (Tab) peut faire scroller nativement le conteneur : on annule
      const onNativeScroll = () => {
        root.scrollTop = 0;
        root.scrollLeft = 0;
      };

      const wheelTarget = globalWheel ? window : root;
      const touchTarget = globalTouch ? window : root;
      const unlisten = [
        listen(wheelTarget, "wheel", onWheel, { passive: false }),
        listen(touchTarget, "touchstart", onTouchStart, { passive: true }),
        listen(touchTarget, "touchmove", onTouchMove, { passive: false }),
        listen(touchTarget, "touchend", onTouchEnd),
        listen(touchTarget, "touchcancel", onTouchEnd),
        listen(root, "scroll", onNativeScroll),
        listen(window, "keydown", onKey),
      ];

      measure();
      // changement d'axe : les positions (px) de l'ancien axe n'ont plus de
      // sens, on se recale sur la section courante
      if (axisChanged && st.index >= 0) goTo(st.index, { immediate: true });
      // mode contrôlé : on démarre directement sur la section demandée
      if (index !== undefined && st.index < 0)
        goTo(index, { immediate: true });
      // placer les sections tout de suite, avant les premiers IntersectionObserver
      render(true);
      setIndex(opts.current.snap ? Math.max(st.index, 0) : indexAt(st.current));

      return () => {
        cancelAnimationFrame(raf);
        wake.current = () => {};
        ro.disconnect();
        unlisten.forEach((off) => off());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length, globalWheel, globalTouch, axis]);

    // Mode contrôlé : suivre `index`. Pas de boucle avec onIndexChange :
    // setIndex ignore l'index déjà actif.
    useEffect(() => {
      if (index === undefined || index === s.current.index) return;
      goTo(index);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
      <div
        ref={rootRef}
        className={className}
        style={{
          position: "relative",
          // hauteur du parent : plein écran si le parent l'est, sinon borné au bloc
          height: "100%",
          overflow: "hidden",
          // les sections peuvent se dimensionner en 100cqh / 100cqw (= scroller)
          containerType: "size",
          // pan-y : le scroll natif (vertical) reste possible quand on rend la
          // main à la page (cf. release) et, en axe x, pour un geste vertical
          touchAction: "pan-y",
          ...style,
        }}>
        {items.map((child, i) => (
          <div
            key={(child as ReactElement).key ?? i}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              ...(axis === "x"
                ? // au moins la largeur du scroller, plus si le contenu l'impose
                  { height: "100%", width: "fit-content", minWidth: "100%" }
                : { width: "100%" }),
              willChange: "transform",
              transformOrigin: "center center",
            }}>
            {child}
          </div>
        ))}
      </div>
    );
  },
);

export default ScrollerVirtual;
