import type { SkyFrame } from "./shared";

export interface SkyRenderer {
  readonly kind: "webgpu" | "canvas";
  readonly lost: boolean;
  /** Rest layout [restX, restY, seedA, seedB] and initial state [x, y, vx, vy], CSS px. */
  setParticles(rest: Float32Array, state: Float32Array): void;
  /** Backing buffer size in device px. */
  resize(width: number, height: number): void;
  /** Steps the springs by frame.dt, then draws. */
  render(frame: SkyFrame): void;
  destroy(): void;
}
