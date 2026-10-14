import {
  DAY_A,
  DAY_B,
  DAY_C,
  DAY_D,
  DAY_GHOST_OUT,
  NIGHT_GOLD,
  NIGHT_SILVER,
  PHYSICS,
  REST_STRIDE,
  STATE_STRIDE,
  type Rgb,
  type SkyFrame,
} from "./shared";
import type { SkyRenderer } from "./types";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

const fract = (x: number) => x - Math.floor(x);

function hash3(x: number, y: number, z: number) {
  let qx = fract(x * 0.1031);
  let qy = fract(y * 0.1031);
  let qz = fract(z * 0.1031);
  const dd = qx * (qz + 31.32) + qy * (qy + 31.32) + qz * (qx + 31.32);
  qx += dd;
  qy += dd;
  qz += dd;
  return fract((qx + qy) * qz);
}

/** Trilinear value noise in [-1, 1]; matches vnoise() in webgpu.ts. */
function vnoise(x: number, y: number, z: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const a = l(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), ux);
  const b = l(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), ux);
  const c = l(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), ux);
  const d = l(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), ux);
  return l(l(a, b, uy), l(c, d, uy), uz) * 2 - 1;
}

const mix3 = (a: Rgb, b: Rgb, t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const css = (c: readonly number[], alpha: number) =>
  `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${alpha.toFixed(3)})`;

/** Canvas 2D fallback: same model on the CPU, one ghost instead of two. */
export function createCanvasRenderer(canvas: HTMLCanvasElement): SkyRenderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let rest: Float32Array = new Float32Array(0);
  let state: Float32Array = new Float32Array(0);

  const step = (f: SkyFrame) => {
    const t = f.time;
    const count = rest.length / REST_STRIDE;
    for (let p = 0; p < count; p += 1) {
      const ri = p * REST_STRIDE;
      const si = p * STATE_STRIDE;
      const rx = rest[ri];
      const ry = rest[ri + 1];
      const dx = rx - f.focusX;
      const dy = ry - f.focusY;
      const dist = Math.max(Math.hypot(dx, dy), 0.001);
      const ux = dx / dist;
      const uy = dy / dist;

      const shape =
        vnoise(ux * 1.4, uy * 1.4, t * 0.22) * 0.2 +
        vnoise(ux * 3.2 + 7.3, uy * 3.2 + 7.3, t * 0.4) * 0.07;
      const ringR = f.radius * (1 + shape + 0.05 * Math.sin(t * 0.9) + 0.03 * Math.cos(t * 2.3));
      // Outer reach varies with angle between ~2.2x and ~3x the inner radius.
      const reach =
        ringR * (2.2 + 0.8 * (vnoise(ux * 1.8 + 3.1, uy * 1.8 + 3.1, t * 0.18) * 0.5 + 0.5));
      const rough = dist + vnoise(rx * 0.05, ry * 0.05, t * 0.5) * f.band * 0.25;
      const inner = smoothstep(ringR - f.band * 0.7, ringR, rough);
      const along = Math.min(Math.max((dist - ringR) / Math.max(reach - ringR, 1), 0), 1);
      const tail =
        inner * (1 - smoothstep(0.5, 1, along + vnoise(rx * 0.012, ry * 0.012, t * 0.3) * 0.12));
      const crest = inner * (1 - smoothstep(0, 0.14, along));
      const vis = Math.min(Math.max(tail * (1 - 0.3 * along) + crest ** 2 * 0.45, 0), 1.4);

      const far = Math.min(dist / (f.radius * 2.5), 1);
      const pushMag = ringR * 0.07 * crest ** 0.75;
      const gx =
        rx +
        vnoise(rx * 0.008 + 88.5, ry * 0.008 + 32.4, t * 0.18) * 12 +
        Math.sin(rx * 0.035 + t * 2) * 3 * far +
        ux * pushMag;
      const gy =
        ry +
        vnoise(rx * 0.008 + 50.9, ry * 0.008 + 120.9, t * 0.18) * 12 +
        Math.cos(ry * 0.035 + t * 1.5) * 3 * far +
        uy * pushMag;

      if (f.dt <= 0) {
        state[si] = gx;
        state[si + 1] = gy;
        state[si + 2] = 0;
        state[si + 3] = 0;
        state[si + 4] = vis;
        continue;
      }
      const h = f.dt * 0.5;
      for (let k = 0; k < 2; k += 1) {
        const vx =
          state[si + 2] +
          ((gx - state[si]) * PHYSICS.stiffness - state[si + 2] * PHYSICS.damping) * h;
        const vy =
          state[si + 3] +
          ((gy - state[si + 1]) * PHYSICS.stiffness - state[si + 3] * PHYSICS.damping) * h;
        state[si] += vx * h;
        state[si + 1] += vy * h;
        state[si + 2] = vx;
        state[si + 3] = vy;
      }
      state[si + 4] += (vis - state[si + 4]) * (1 - Math.exp(-f.dt * PHYSICS.scaleRate));
    }
  };

  const capsule = (
    x: number,
    y: number,
    ax: number,
    ay: number,
    halfLen: number,
    halfW: number,
    color: string,
  ) => {
    const core = Math.max(halfLen - halfW, 0.01);
    ctx.strokeStyle = color;
    ctx.lineWidth = halfW * 2;
    ctx.beginPath();
    ctx.moveTo(x - ax * core, y - ay * core);
    ctx.lineTo(x + ax * core, y + ay * core);
    ctx.stroke();
  };

  return {
    kind: "canvas",
    lost: false,
    setParticles(field) {
      rest = field.rest;
      state = field.state;
    },
    resize(width, height) {
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    },
    render(f: SkyFrame) {
      step(f);
      const scale = canvas.width / f.width;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.lineCap = "round";
      const t = f.time;
      const night = f.night;
      const count = rest.length / REST_STRIDE;

      for (let p = 0; p < count; p += 1) {
        const si = p * STATE_STRIDE;
        const size = Math.min(state[si + 4], 1.2);
        if (size < 0.06) continue;
        const sa = rest[p * REST_STRIDE + 2];
        const sb = rest[p * REST_STRIDE + 3];
        const x = state[si];
        const y = state[si + 1];
        const speed = Math.hypot(state[si + 2], state[si + 3]);
        const dx = x - f.focusX;
        const dy = y - f.focusY;
        const dist = Math.max(Math.hypot(dx, dy), 0.001);
        const ux = dx / dist;
        const uy = dy / dist;
        const wob = vnoise(x * 0.02, y * 0.02, t * 0.85) * 0.5;
        const ax = ux * Math.cos(wob) - uy * Math.sin(wob);
        const ay = ux * Math.sin(wob) + uy * Math.cos(wob);

        const flow = smoothstep(
          0,
          0.85,
          (vnoise(x * 0.0035 + 74.6, y * 0.0035 + 74.6, t * 0.25) * 0.5 + 0.5) ** 1.5,
        );
        let day = mix3(DAY_A, DAY_B, smoothstep(0, 0.4, flow));
        day = mix3(day, DAY_C, smoothstep(0.35, 0.75, flow));
        day = mix3(day, DAY_D, smoothstep(0.75, 1, flow));
        const nightRgb = mix3(NIGHT_SILVER, NIGHT_GOLD, smoothstep(0.3, 0.8, sb));
        const twinkle = 0.6 + 0.4 * Math.sin(t * (0.8 + sa * 2.2) + sb * 40);
        const presence = smoothstep(0.06, 0.22, size);
        const dayA = 0.6 + 0.25 * sb;
        const alpha = presence * (dayA + ((0.5 + 0.5 * sb) * twinkle - dayA) * night);

        const halfLen =
          (2.9 * size + Math.min(speed * 0.015, 1)) * (1 - night) + 1.7 * size * night;
        const halfW = 1.25 * size;

        if (size > 0.35) {
          const shift = 0.5 + 0.8 * smoothstep(0.6, 1.1, size);
          const flowLen = Math.hypot(f.flowX, f.flowY);
          const lead = flowLen > 1 ? (2.2 * (1 - Math.exp(-flowLen * 0.003))) / flowLen : 0;
          const ghostAlpha = alpha * (0.3 - 0.16 * night) * smoothstep(0.45, 0.95, size);
          capsule(
            x + ux * shift + f.flowX * lead,
            y + uy * shift + f.flowY * lead,
            ax,
            ay,
            halfLen,
            halfW * (1 + 1.2 * night),
            css(mix3(DAY_GHOST_OUT, NIGHT_GOLD, night), ghostAlpha),
          );
        }
        capsule(x, y, ax, ay, halfLen, halfW, css(mix3(day, nightRgb, night), alpha));
      }
    },
    destroy() {
      rest = new Float32Array(0);
      state = new Float32Array(0);
    },
  };
}
