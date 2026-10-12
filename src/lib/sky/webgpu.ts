import {
  DAY_A,
  DAY_B,
  DAY_C,
  DAY_D,
  DAY_GHOST_IN,
  DAY_GHOST_OUT,
  NIGHT_GOLD,
  NIGHT_SILVER,
  PHYSICS,
  type Rgb,
  type SkyFrame,
} from "./shared";
import type { SkyRenderer } from "./types";

const vec3 = (c: Rgb) => `vec3f(${c[0].toFixed(4)}, ${c[1].toFixed(4)}, ${c[2].toFixed(4)})`;

const COMMON = /* wgsl */ `
struct Frame {
  view: vec4f,   // width, height, time, night
  focus: vec4f,  // x, y, radius, band
  sim: vec4f,    // dt, stiffness, damping, scaleRate
  flow: vec4f,   // focus velocity x, y (px/s), unused, unused
};

// Hash without sine (Dave Hoskins), then trilinear value noise in [-1, 1].
fn hash3(p: vec3f) -> f32 {
  var q = fract(p * 0.1031);
  q += dot(q, q.zyx + 31.32);
  return fract((q.x + q.y) * q.z);
}

fn vnoise(p: vec3f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = mix(hash3(i), hash3(i + vec3f(1.0, 0.0, 0.0)), u.x);
  let b = mix(hash3(i + vec3f(0.0, 1.0, 0.0)), hash3(i + vec3f(1.0, 1.0, 0.0)), u.x);
  let c = mix(hash3(i + vec3f(0.0, 0.0, 1.0)), hash3(i + vec3f(1.0, 0.0, 1.0)), u.x);
  let d = mix(hash3(i + vec3f(0.0, 1.0, 1.0)), hash3(i + vec3f(1.0, 1.0, 1.0)), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z) * 2.0 - 1.0;
}
`;

const COMPUTE = /* wgsl */ `
${COMMON}
@group(0) @binding(0) var<uniform> frame: Frame;
@group(0) @binding(1) var<storage, read> rest: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> state: array<vec4f>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= arrayLength(&rest)) {
    return;
  }

  let r = rest[i];
  let rp = r.xy;
  let t = frame.view.z;
  let focus = frame.focus.xy;
  let radius = frame.focus.z;
  let band = frame.focus.w;

  let d = rp - focus;
  let dist = max(length(d), 0.001);
  let dir = d / dist;

  // Irregular, breathing ring. Noise is sampled on the direction vector to avoid an atan seam.
  let shape = vnoise(vec3f(dir * 1.4, t * 0.22)) * 0.2 + vnoise(vec3f(dir * 3.2 + 7.3, t * 0.4)) * 0.07;
  let ringR = radius * (1.0 + shape + 0.05 * sin(t * 0.9) + 0.03 * cos(t * 2.3));
  // Outer reach varies with angle between ~2.2x and ~3x the inner radius.
  let reach = ringR * (2.2 + 0.8 * (vnoise(vec3f(dir * 1.8 + 3.1, t * 0.18)) * 0.5 + 0.5));
  let rough = dist + vnoise(vec3f(rp * 0.05, t * 0.5)) * band * 0.25;

  // Sharp inner edge, bright crest just past it, long soft tail out to the reach.
  let inner = smoothstep(ringR - band * 0.7, ringR, rough);
  let span = max(reach - ringR, 1.0);
  let k = clamp((dist - ringR) / span, 0.0, 1.0);
  let tail = inner * (1.0 - smoothstep(0.5, 1.0, k + vnoise(vec3f(rp * 0.012, t * 0.3)) * 0.12));
  let crest = inner * (1.0 - smoothstep(0.0, 0.14, k));
  // Size falls off gently with distance so the field thins out toward the reach.
  var vis = tail * (1.0 - 0.3 * k) + pow(crest, 2.0) * 0.45;
  vis = clamp(vis, 0.0, 1.4);

  // Spring target: flow noise + sway, pushed outward where the ring is.
  var disp = vec2f(
    vnoise(vec3f(rp * 0.008 + vec2f(88.5, 32.4), t * 0.18)),
    vnoise(vec3f(rp * 0.008 + vec2f(50.9, 120.9), t * 0.18)),
  ) * 12.0;
  disp += vec2f(
    vnoise(vec3f(rp * 0.04 + vec2f(18.5, 72.9), t * 0.5)),
    vnoise(vec3f(rp * 0.04 + vec2f(50.9, 12.9), t * 0.5)),
  ) * 2.5;
  let far = clamp(dist / (radius * 2.5), 0.0, 1.0);
  disp += vec2f(sin(rp.x * 0.035 + t * 2.0), cos(rp.y * 0.035 + t * 1.5)) * 3.0 * far;
  // Small outward push at the crest: enough to ripple when the focus moves, not enough to pile up.
  let push = dir * ringR * 0.07 * pow(crest, 0.75);
  let goal = rp + disp + push;

  var s0 = state[i * 2u];
  var s1 = state[i * 2u + 1u];
  let dt = frame.sim.x;

  if (dt <= 0.0) {
    state[i * 2u] = vec4f(goal, 0.0, 0.0);
    state[i * 2u + 1u] = vec4f(vis, 0.0, 0.0, 0.0);
    return;
  }

  // Semi-implicit Euler, two substeps for stability at low frame rates.
  let h = dt * 0.5;
  for (var k = 0; k < 2; k++) {
    let acc = (goal - s0.xy) * frame.sim.y - s0.zw * frame.sim.z;
    let v = s0.zw + acc * h;
    s0 = vec4f(s0.xy + v * h, v);
  }
  s1.x += (vis - s1.x) * (1.0 - exp(-dt * frame.sim.w));

  state[i * 2u] = s0;
  state[i * 2u + 1u] = s1;
}
`;

const RENDER = /* wgsl */ `
${COMMON}
struct VSOut {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,   // px from capsule centre, along/perpendicular to the axis
  @location(1) half: vec2f,    // half length, half width, px
  @location(2) color: vec4f,
};

@group(0) @binding(0) var<uniform> frame: Frame;
@group(0) @binding(1) var<storage, read> rest: array<vec4f>;
@group(0) @binding(2) var<storage, read> state: array<vec4f>;

const DAY_A = ${vec3(DAY_A)};
const DAY_B = ${vec3(DAY_B)};
const DAY_C = ${vec3(DAY_C)};
const DAY_D = ${vec3(DAY_D)};
const GHOST_IN = ${vec3(DAY_GHOST_IN)};
const GHOST_OUT = ${vec3(DAY_GHOST_OUT)};
const NIGHT_SILVER = ${vec3(NIGHT_SILVER)};
const NIGHT_GOLD = ${vec3(NIGHT_GOLD)};

fn rotate(v: vec2f, a: f32) -> vec2f {
  let s = sin(a);
  let c = cos(a);
  return vec2f(c * v.x - s * v.y, s * v.x + c * v.y);
}

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VSOut {
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );

  // Three instances per particle: the capsule plus two chromatic ghosts.
  let layer = ii % 3u;
  let idx = ii / 3u;
  let seed = rest[idx].zw;
  let s0 = state[idx * 2u];
  let scale = state[idx * 2u + 1u].x;
  let t = frame.view.z;
  let night = frame.view.w;

  var out: VSOut;
  if (scale < 0.06) {
    out.position = vec4f(2.0, 2.0, 0.0, 1.0);
    out.color = vec4f(0.0);
    return out;
  }

  var pos = s0.xy;
  let vel = s0.zw;
  let speed = length(vel);
  let d = pos - frame.focus.xy;
  let dir = d / max(length(d), 0.001);

  // Radial orientation, wobbled by noise, bent toward the velocity when moving fast.
  var axis = rotate(dir, vnoise(vec3f(pos * 0.02, t * 0.85)) * 0.5);
  if (speed > 1.0) {
    axis = normalize(mix(axis, vel / speed, smoothstep(10.0, 60.0, speed) * 0.6));
  }

  // Capsule aspect stays within ~1:2.5 (stretching a little with speed).
  let size = min(scale, 1.2);
  let dayHalf = vec2f(2.9 * size + min(speed * 0.015, 1.0), 1.25 * size);
  let nightHalf = vec2f(1.7 * size, 1.25 * size);
  var half = mix(dayHalf, nightHalf, night);

  // Day colour flows across the field; night is silver and gold starlight.
  let flow = smoothstep(0.0, 0.85, pow(vnoise(vec3f(pos * 0.0035 + 74.6, t * 0.25)) * 0.5 + 0.5, 1.5));
  var dayRgb = mix(DAY_A, DAY_B, smoothstep(0.0, 0.4, flow));
  dayRgb = mix(dayRgb, DAY_C, smoothstep(0.35, 0.75, flow));
  dayRgb = mix(dayRgb, DAY_D, smoothstep(0.75, 1.0, flow));
  let nightRgb = mix(NIGHT_SILVER, NIGHT_GOLD, smoothstep(0.3, 0.8, seed.y));
  let twinkle = 0.6 + 0.4 * sin(t * (0.8 + seed.x * 2.2) + seed.y * 40.0);

  let presence = smoothstep(0.06, 0.22, scale);
  var rgb = mix(dayRgb, nightRgb, night);
  var alpha = presence * mix(0.6 + 0.25 * seed.y, (0.5 + 0.5 * seed.y) * twinkle, night);

  if (layer != 0u) {
    // Dispersion: a radial base split, plus a split along the pointer's motion
    // (red leads, blue trails) that fades out when the pointer stops.
    let side = select(-1.0, 1.0, layer == 1u);
    let motion = frame.flow.xy;
    let flowLen = length(motion);
    // Base split is small and only strong at the crest; motion adds a smooth, capped split.
    var split = dir * (0.5 + 0.8 * smoothstep(0.6, 1.1, scale));
    if (flowLen > 1.0) {
      let amount = 2.2 * (1.0 - exp(-flowLen * 0.003));
      split += (motion / flowLen) * amount * (0.7 + 0.3 * dot(dir, motion / flowLen));
    }
    pos += split * side + dir * side * min(speed * 0.02, 1.2);
    rgb = mix(select(GHOST_IN, GHOST_OUT, layer == 1u), NIGHT_GOLD, night);
    alpha *= mix(0.3, select(0.0, 0.14, layer == 1u), night) * smoothstep(0.45, 0.95, scale);
    half = mix(half, half * vec2f(1.0, 2.2) + vec2f(1.5, 0.0), night);
  }

  // Quad padded by 1px for anti-aliasing.
  let ext = half + vec2f(1.0);
  let corner = quad[vi] * ext;
  let perp = vec2f(-axis.y, axis.x);
  let world = pos + axis * corner.x + perp * corner.y;
  let clip = vec2f(world.x / frame.view.x * 2.0 - 1.0, 1.0 - world.y / frame.view.y * 2.0);

  out.position = vec4f(clip, 0.0, 1.0);
  out.local = corner;
  out.half = half;
  out.color = vec4f(rgb, alpha);
  return out;
}

@fragment
fn fs(input: VSOut) -> @location(0) vec4f {
  // Capsule SDF, px.
  let core = max(input.half.x - input.half.y, 0.0);
  let q = vec2f(max(abs(input.local.x) - core, 0.0), input.local.y);
  let sd = length(q) - input.half.y;
  let a = input.color.a * (1.0 - smoothstep(-0.6, 0.6, sd));
  if (a < 0.004) {
    discard;
  }
  return vec4f(input.color.rgb * a, a);
}
`;

export async function createWebGPURenderer(canvas: HTMLCanvasElement): Promise<SkyRenderer | null> {
  if (!("gpu" in navigator) || !navigator.gpu) return null;

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "low-power" });
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) return null;

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const computePipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: device.createShaderModule({ code: COMPUTE }), entryPoint: "main" },
  });
  const renderModule = device.createShaderModule({ code: RENDER });
  const renderPipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: renderModule, entryPoint: "vs" },
    fragment: {
      module: renderModule,
      entryPoint: "fs",
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
            alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
          },
        },
      ],
    },
    primitive: { topology: "triangle-list" },
  });

  const uniforms = new Float32Array(16);
  const uniformBuffer = device.createBuffer({
    size: uniforms.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  let restBuffer: GPUBuffer | null = null;
  let stateBuffer: GPUBuffer | null = null;
  let computeGroup: GPUBindGroup | null = null;
  let renderGroup: GPUBindGroup | null = null;
  let count = 0;
  let lost = false;

  void device.lost.then(() => {
    lost = true;
  });

  const storage = (data: Float32Array) => {
    const buffer = device.createBuffer({
      size: Math.max(16, data.byteLength),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data as Float32Array<ArrayBuffer>);
    return buffer;
  };

  return {
    kind: "webgpu",
    get lost() {
      return lost;
    },
    setParticles(rest, state) {
      restBuffer?.destroy();
      stateBuffer?.destroy();
      count = rest.length / 4;
      restBuffer = storage(rest);
      stateBuffer = storage(state);
      const entries = [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: { buffer: restBuffer } },
        { binding: 2, resource: { buffer: stateBuffer } },
      ];
      computeGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries,
      });
      renderGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries,
      });
    },
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
    },
    render(f: SkyFrame) {
      if (!computeGroup || !renderGroup || lost) return;
      uniforms.set([
        f.width,
        f.height,
        f.time,
        f.night,
        f.focusX,
        f.focusY,
        f.radius,
        f.band,
        f.dt,
        PHYSICS.stiffness,
        PHYSICS.damping,
        PHYSICS.scaleRate,
        f.flowX,
        f.flowY,
        0,
        0,
      ]);
      device.queue.writeBuffer(uniformBuffer, 0, uniforms);

      const encoder = device.createCommandEncoder();
      const compute = encoder.beginComputePass();
      compute.setPipeline(computePipeline);
      compute.setBindGroup(0, computeGroup);
      compute.dispatchWorkgroups(Math.ceil(count / 64));
      compute.end();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(renderPipeline);
      pass.setBindGroup(0, renderGroup);
      pass.draw(6, count * 3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      restBuffer?.destroy();
      stateBuffer?.destroy();
      uniformBuffer.destroy();
      device.destroy();
    },
  };
}
