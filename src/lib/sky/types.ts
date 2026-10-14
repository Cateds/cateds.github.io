import type { ParticleField, SkyFrame } from "./shared";

export interface SkyRenderer {
  readonly kind: "webgpu" | "canvas";
  readonly lost: boolean;
  /** Install a field, preserving renderer-owned live state for overlapping cells. */
  setParticles(field: ParticleField): void;
  /** Backing buffer size in device px. */
  resize(width: number, height: number): void;
  /** Steps the springs by frame.dt, then draws. */
  render(frame: SkyFrame): void;
  destroy(): void;
}
