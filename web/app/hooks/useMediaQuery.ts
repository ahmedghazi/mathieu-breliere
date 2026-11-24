import { useSyncExternalStore } from "react";

/**
 * true si la media query correspond, suit ses changements (resize, rotation).
 * Côté serveur (et à l'hydratation) : `serverValue`, false par défaut.
 *
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export default function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
