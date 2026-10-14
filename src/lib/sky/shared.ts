/**
 * Background "sky".
 *
 * Particles sit on a jittered grid and are bound to moving targets by
 * underdamped springs. A focus point (pointer, or a slow idle wander) defines
 * a breathing, noise-roughened ring. Each particle carries an eased `scale`:
 * near the ring it grows into a visible capsule, elsewhere it shrinks to
 * nothing, so visibility is encoded in size rather than a hard alpha mask.
 * Targets are displaced by flow noise and pushed outward around the ring, so
 * when the focus moves the springs lag, overshoot and wobble.
 *
 * The model is implemented in WGSL (webgpu.ts) and in TypeScript (canvas.ts).
 */

export type Rgb = readonly [number, number, number];

export interface SkyOptions {
  /** Grid spacing between particles, CSS px. */
  spacing: number;
  /** Multiplier on device pixel ratio for the backing buffer. */
  renderScale: number;
}

export const DEFAULT_SKY_OPTIONS: SkyOptions = {
  spacing: 28,
  renderScale: 0.6,
};

/** Spacing for the CPU fallback, which can't afford the full density. */
export const CANVAS_SPACING = 30;

export const PHYSICS = {
  /** Spring constant; ω = √k ≈ 6.3 rad/s. */
  stiffness: 40,
  /** Velocity damping; ζ ≈ 0.4, so particles overshoot and settle in a few wobbles. */
  damping: 5,
  /** Rate at which scale eases toward its target, 1/s. */
  scaleRate: 5,
} as const;

/** Floats per particle in the rest buffer and the state buffer. */
export const REST_STRIDE = 4;
export const STATE_STRIDE = 8;

export interface SkyFrame {
  width: number;
  height: number;
  time: number;
  /** Simulation step, s. 0 means "settle instantly" (reduced motion). */
  dt: number;
  focusX: number;
  focusY: number;
  radius: number;
  band: number;
  /** 0 = day, 1 = night. Eased during theme changes. */
  night: number;
  /** Smoothed focus velocity, px/s. Drives directional dispersion. */
  flowX: number;
  flowY: number;
}

const hex = (value: string): Rgb => {
  const n = Number.parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** Daylight: Nord frost/aurora stops, spread across the field by noise. */
export const DAY_A = hex("#4f74b0");
export const DAY_B = hex("#a77fb0");
export const DAY_C = hex("#d0606a");
export const DAY_D = hex("#e0965f");
/** Chromatic ghosts either side of each dash. */
export const DAY_GHOST_IN = hex("#5fb4d0");
export const DAY_GHOST_OUT = hex("#e2707a");
/** Starlight. */
export const NIGHT_SILVER = hex("#c0caf5");
export const NIGHT_GOLD = hex("#ead29c");

/** Stable per-cell randomness in [0, 1): a cell always gets the same jitter, seeds
 *  included, so growing the grid never moves particles that were already placed. */
const cellRandom = (col: number, row: number, salt: number) => {
  let h = Math.imul(col + salt * 1013, 0x9e3779b1) ^ Math.imul(row + salt * 7919, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
};

/** Grid cells needed to cover a viewport, plus a margin cell on each side. */
export function gridShape(width: number, height: number, spacing: number) {
  return { cols: Math.ceil(width / spacing) + 2, rows: Math.ceil(height / spacing) + 2 };
}

/**
 * Particle field: rest layout [restX, restY, seedA, seedB] and dynamic state
 * [x, y, vx, vy, scale, 0, 0, 0] per particle, CSS px, row-major over the grid.
 */
export interface ParticleField {
  rest: Float32Array;
  state: Float32Array;
  cols: number;
  rows: number;
}

/**
 * Build the field for a viewport, optionally carrying over a previous one. Layout comes
 * from the grid cell, and per-particle state is copied cell by cell, so a resize that
 * only grows the viewport keeps every existing particle at its rest spot, seeds and
 * live state. It adds (or drops) edge cells instead of rebuilding — and visually
 * resetting — the whole field.
 */
export function createParticles(
  width: number,
  height: number,
  spacing: number,
  previous?: ParticleField,
): ParticleField {
  const shape = gridShape(width, height, spacing);
  const cols = Math.max(shape.cols, previous?.cols ?? 0);
  const rows = Math.max(shape.rows, previous?.rows ?? 0);
  const rest = new Float32Array(cols * rows * REST_STRIDE);
  const state = new Float32Array(cols * rows * STATE_STRIDE);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = (row * cols + col) * REST_STRIDE;
      rest[i] = (col - 0.5 + (cellRandom(col, row, 1) - 0.5) * 0.8) * spacing;
      rest[i + 1] = (row - 0.5 + (cellRandom(col, row, 2) - 0.5) * 0.8) * spacing;
      rest[i + 2] = cellRandom(col, row, 3);
      rest[i + 3] = cellRandom(col, row, 4);

      const si = (row * cols + col) * STATE_STRIDE;
      if (previous && row < previous.rows && col < previous.cols) {
        const pi = (row * previous.cols + col) * STATE_STRIDE;
        state.set(previous.state.subarray(pi, pi + STATE_STRIDE), si);
      } else {
        // New edge cells start invisible and ease in like everything else.
        state[si] = rest[i];
        state[si + 1] = rest[i + 1];
      }
    }
  }
  return { rest, state, cols, rows };
}

export function getSkySize(width: number, height: number) {
  // Inner radius of the clear hole. The field reaches 2.2-3x this, which runs past the
  // screen edges on desktop so it reads as background rather than a ring.
  const narrow = width < 860;
  const radius = narrow ? Math.min(width, height) * 0.32 : Math.max(width, height) * 0.19;
  return { radius, band: radius * 0.28 };
}

export function readNightTarget(): number {
  return document.documentElement.dataset.theme === "dark" ? 1 : 0;
}

/** Where the focus rests before the pointer has moved: centred on the content area. */
export function idleFocus(width: number, height: number, time: number) {
  const narrow = width < 860;
  const cx = narrow ? width * 0.5 : 248 + (width - 248) * 0.5;
  const cy = height * (narrow ? 0.38 : 0.44);
  return {
    x: cx + Math.cos(time * 0.13) * width * 0.03,
    y: cy + Math.sin(time * 0.097) * height * 0.03,
  };
}

// The transparent background-image keeps backdrop-filter working over a WebGPU canvas in Chromium.
export const CANVAS_STYLE =
  "position:absolute;inset:0;width:100%;height:100%;background-image:linear-gradient(transparent,transparent);";
