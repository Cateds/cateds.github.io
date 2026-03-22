export interface ParticleBackgroundProps {
  spacing?: number;
  springStiffness?: number;
  damping?: number;
  mouseRadius?: number;
  mouseStrength?: number;
  particleRadius?: number;
  flowSpeed?: number;
  flowScale?: number;
  flowStrength?: number;
  renderScale?: number;
}

export const DEFAULT_PARTICLE_OPTIONS = {
  spacing: 25,
  springStiffness: 0.018,
  damping: 0.92,
  mouseRadius: 500,
  mouseStrength: 12000,
  particleRadius: 1.5,
  flowSpeed: 0.008,
  flowScale: 0.0012,
  flowStrength: 25,
  renderScale: 1,
} as const;

export interface ParticlePalette {
  baseRgb: readonly [number, number, number];
  accentRgb: readonly [number, number, number];
  base: readonly [number, number, number, number];
  accent: readonly [number, number, number, number];
}

type MediaQueryListener = (event: MediaQueryListEvent) => void;

export const PARTICLE_CANVAS_STYLE = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  "pointer-events": "none",
  "z-index": 0,
} as const;

export function createPermutationTable(): Uint32Array {
  const permutation = new Uint32Array(512);

  for (let i = 0; i < 256; i += 1) {
    permutation[i] = i;
  }

  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const value = permutation[i];
    permutation[i] = permutation[j];
    permutation[j] = value;
  }

  for (let i = 0; i < 256; i += 1) {
    permutation[i + 256] = permutation[i];
  }

  return permutation;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function perlin(x: number, y: number, permutation: Uint32Array): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const localX = x - Math.floor(x);
  const localY = y - Math.floor(y);

  const u = fade(localX);
  const v = fade(localY);

  const A = permutation[X] + Y;
  const B = permutation[X + 1] + Y;

  return lerp(
    lerp(
      grad(permutation[A], localX, localY),
      grad(permutation[B], localX - 1, localY),
      u,
    ),
    lerp(
      grad(permutation[A + 1], localX, localY - 1),
      grad(permutation[B + 1], localX - 1, localY - 1),
      u,
    ),
    v,
  );
}

export function getThemeParticlePalette(): ParticlePalette {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const baseRgb: readonly [number, number, number] = isDark
    ? [90, 120, 140]
    : [70, 100, 120];
  const accentRgb: readonly [number, number, number] = isDark
    ? [122, 154, 170]
    : [100, 130, 150];

  return {
    baseRgb,
    accentRgb,
    base: [baseRgb[0] / 255, baseRgb[1] / 255, baseRgb[2] / 255, 1],
    accent: [accentRgb[0] / 255, accentRgb[1] / 255, accentRgb[2] / 255, 1],
  };
}

export function addMediaQueryListener(
  mediaQuery: MediaQueryList,
  listener: MediaQueryListener,
) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return;
  }

  mediaQuery.addListener(listener);
}

export function removeMediaQueryListener(
  mediaQuery: MediaQueryList,
  listener: MediaQueryListener,
) {
  if (typeof mediaQuery.removeEventListener === "function") {
    mediaQuery.removeEventListener("change", listener);
    return;
  }

  mediaQuery.removeListener(listener);
}

export function clampRenderScale(scale: number | undefined): number {
  if (scale === undefined || Number.isNaN(scale)) {
    return DEFAULT_PARTICLE_OPTIONS.renderScale;
  }

  return Math.min(Math.max(scale, 0.35), 1);
}
