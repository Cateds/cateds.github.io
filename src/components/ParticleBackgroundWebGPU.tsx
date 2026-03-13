import { onCleanup, onMount } from "solid-js";
import {
  DEFAULT_PARTICLE_OPTIONS,
  PARTICLE_CANVAS_STYLE,
  addMediaQueryListener,
  clampRenderScale,
  createPermutationTable,
  getThemeParticlePalette,
  removeMediaQueryListener,
  type ParticleBackgroundProps,
} from "./particleBackgroundShared";

interface ParticleBackgroundWebGPUProps extends ParticleBackgroundProps {
  onFallback?: () => void;
}

const COMPUTE_SHADER = /* wgsl */ `
struct Particle {
  state: vec4f,
  rest: vec4f,
};

struct Params {
  screenMouse: vec4f,
  interaction: vec4f,
  flow: vec4f,
  render: vec4f,
  baseColor: vec4f,
  accentColor: vec4f,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var<storage, read> permutation: array<u32>;

fn fade(t: f32) -> f32 {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

fn lerp(a: f32, b: f32, t: f32) -> f32 {
  return a + t * (b - a);
}

fn grad(hash: u32, x: f32, y: f32) -> f32 {
  let h = hash & 3u;
  let u = select(y, x, h < 2u);
  let v = select(x, y, h < 2u);
  let first = select(-u, u, (h & 1u) == 0u);
  let second = select(-v, v, (h & 2u) == 0u);
  return first + second;
}

fn perlin(x: f32, y: f32) -> f32 {
  let X = u32(i32(floor(x)) & 255);
  let Y = u32(i32(floor(y)) & 255);
  let localX = fract(x);
  let localY = fract(y);
  let u = fade(localX);
  let v = fade(localY);
  let A = permutation[X] + Y;
  let B = permutation[X + 1u] + Y;

  return lerp(
    lerp(grad(permutation[A], localX, localY), grad(permutation[B], localX - 1.0, localY), u),
    lerp(
      grad(permutation[A + 1u], localX, localY - 1.0),
      grad(permutation[B + 1u], localX - 1.0, localY - 1.0),
      u,
    ),
    v,
  );
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleCount = u32(params.render.z + 0.5);
  if (id.x >= particleCount) {
    return;
  }

  var particle = particles[id.x];
  var x = particle.state.x;
  var y = particle.state.y;
  var vx = particle.state.z;
  var vy = particle.state.w;
  let restX = particle.rest.x;
  let restY = particle.rest.y;

  if (params.render.y < 0.5) {
    let dx = params.screenMouse.z - x;
    let dy = params.screenMouse.w - y;
    let distSq = dx * dx + dy * dy;
    let radiusSq = params.interaction.x * params.interaction.x;

    if (distSq < radiusSq && distSq > 0.0) {
      let dist = sqrt(distSq);
      let force = params.interaction.y / (distSq + 1.0);
      vx -= (dx / dist) * force * 0.01;
      vy -= (dy / dist) * force * 0.01;
    }

    let t = params.flow.w * params.flow.x;
    let noiseX = restX * params.flow.y + t * 0.3;
    let noiseY = restY * params.flow.y + t * 0.2;
    let offsetX = perlin(noiseX, noiseY) * params.flow.z;
    let offsetY = perlin(noiseX + 100.0, noiseY + 100.0) * params.flow.z;
    let targetX = restX + offsetX;
    let targetY = restY + offsetY;

    vx += (targetX - x) * params.interaction.z;
    vy += (targetY - y) * params.interaction.z;
    vx *= params.interaction.w;
    vy *= params.interaction.w;
    x += vx;
    y += vy;
  } else {
    x = restX;
    y = restY;
  }

  particle.state = vec4f(x, y, vx, vy);
  particles[id.x] = particle;
}
`;

const RENDER_SHADER = /* wgsl */ `
struct Particle {
  state: vec4f,
  rest: vec4f,
};

struct Params {
  screenMouse: vec4f,
  interaction: vec4f,
  flow: vec4f,
  render: vec4f,
  baseColor: vec4f,
  accentColor: vec4f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) intensity: f32,
};

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: Params;

@vertex
fn vs(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0),
  );

  let particle = particles[instanceIndex];
  let radius = params.render.x;
  let screen = params.screenMouse.xy;
  let unit = quad[vertexIndex];
  let center = particle.state.xy;
  let clipCenter = vec2f(
    center.x / screen.x * 2.0 - 1.0,
    1.0 - center.y / screen.y * 2.0,
  );
  let clipOffset = vec2f(
    unit.x * radius * 2.0 / screen.x,
    -unit.y * radius * 2.0 / screen.y,
  );
  let displacement = distance(particle.state.xy, particle.rest.xy);

  var output: VertexOutput;
  output.position = vec4f(clipCenter + clipOffset, 0.0, 1.0);
  output.local = unit;
  output.intensity = min(displacement / 25.0, 1.0);
  return output;
}

@fragment
fn fs(input: VertexOutput) -> @location(0) vec4f {
  if (dot(input.local, input.local) > 1.0) {
    discard;
  }

  if (input.intensity > 0.15) {
    let opacity = 0.25 + input.intensity * 0.45;
    return vec4f(params.accentColor.rgb, opacity);
  }

  return vec4f(params.baseColor.rgb, 0.2);
}
`;

export default function ParticleBackgroundWebGPU(props: ParticleBackgroundWebGPUProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let animationId = 0;
  let mouse = { x: -1000, y: -1000 };
  let time = 0;
  let prefersReducedMotion = false;
  let reducedMotionQuery: MediaQueryList | undefined;
  let disposed = false;
  let cleanup: (() => void) | undefined;
  let viewportWidth = 0;
  let viewportHeight = 0;

  const spacing = () => props.spacing ?? DEFAULT_PARTICLE_OPTIONS.spacing;
  const springStiffness = () =>
    props.springStiffness ?? DEFAULT_PARTICLE_OPTIONS.springStiffness;
  const damping = () => props.damping ?? DEFAULT_PARTICLE_OPTIONS.damping;
  const mouseRadius = () => props.mouseRadius ?? DEFAULT_PARTICLE_OPTIONS.mouseRadius;
  const mouseStrength = () =>
    props.mouseStrength ?? DEFAULT_PARTICLE_OPTIONS.mouseStrength;
  const particleRadius = () =>
    props.particleRadius ?? DEFAULT_PARTICLE_OPTIONS.particleRadius;
  const flowSpeed = () => props.flowSpeed ?? DEFAULT_PARTICLE_OPTIONS.flowSpeed;
  const flowScale = () => props.flowScale ?? DEFAULT_PARTICLE_OPTIONS.flowScale;
  const flowStrength = () =>
    props.flowStrength ?? DEFAULT_PARTICLE_OPTIONS.flowStrength;
  const renderScale = () => clampRenderScale(props.renderScale);

  const fallback = () => {
    if (!disposed) {
      props.onFallback?.();
    }
  };

  onMount(() => {
    void init();
  });

  onCleanup(() => {
    disposed = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    cleanup?.();
  });

  const init = async () => {
    const canvas = canvasRef;
    if (!canvas) {
      fallback();
      return;
    }

    const gpuNavigator = navigator as Navigator & {
      gpu?: {
        requestAdapter: () => Promise<any>;
        getPreferredCanvasFormat?: () => string;
      };
    };

    if (!gpuNavigator.gpu) {
      fallback();
      return;
    }

    try {
      const adapter = await gpuNavigator.gpu.requestAdapter();
      if (!adapter) {
        fallback();
        return;
      }

      const device = await adapter.requestDevice();
      const context = canvas.getContext("webgpu") as any;
      if (!context) {
        fallback();
        return;
      }

      const gpuBufferUsage = (globalThis as { GPUBufferUsage?: Record<string, number> })
        .GPUBufferUsage;
      const preferredFormat = gpuNavigator.gpu.getPreferredCanvasFormat?.() ?? "bgra8unorm";

      if (!gpuBufferUsage) {
        fallback();
        return;
      }

      const configureContext = () => {
        context.configure({
          device,
          format: preferredFormat,
          alphaMode: "premultiplied",
        });
      };

      configureContext();

      reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotion = reducedMotionQuery.matches;

      const permutation = createPermutationTable();
      const permutationBuffer = device.createBuffer({
        size: permutation.byteLength,
        usage: gpuBufferUsage.STORAGE | gpuBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(permutationBuffer, 0, permutation);

      const paramsData = new Float32Array(24);
      const paramsBuffer = device.createBuffer({
        size: paramsData.byteLength,
        usage: gpuBufferUsage.UNIFORM | gpuBufferUsage.COPY_DST,
      });

      const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: {
          module: device.createShaderModule({ code: COMPUTE_SHADER }),
          entryPoint: "main",
        },
      });

      const renderPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: device.createShaderModule({ code: RENDER_SHADER }),
          entryPoint: "vs",
        },
        fragment: {
          module: device.createShaderModule({ code: RENDER_SHADER }),
          entryPoint: "fs",
          targets: [
            {
              format: preferredFormat,
              blend: {
                color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" },
                alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
              },
            },
          ],
        },
        primitive: { topology: "triangle-list" },
      });

      let particleBuffer: any;
      let computeBindGroup: any;
      let renderBindGroup: any;
      let particleCount = 0;

      const rebuildParticles = () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        canvas.width = Math.max(1, Math.round(viewportWidth * renderScale()));
        canvas.height = Math.max(1, Math.round(viewportHeight * renderScale()));
        configureContext();

        const cols = Math.ceil(viewportWidth / spacing()) + 1;
        const rows = Math.ceil(viewportHeight / spacing()) + 1;
        const offsetX = (viewportWidth - (cols - 1) * spacing()) / 2;
        const offsetY = (viewportHeight - (rows - 1) * spacing()) / 2;
        particleCount = cols * rows;

        const particleData = new Float32Array(particleCount * 8);
        let index = 0;

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const restX = offsetX + col * spacing();
            const restY = offsetY + row * spacing();
            particleData[index] = restX;
            particleData[index + 1] = restY;
            particleData[index + 2] = 0;
            particleData[index + 3] = 0;
            particleData[index + 4] = restX;
            particleData[index + 5] = restY;
            particleData[index + 6] = 0;
            particleData[index + 7] = 0;
            index += 8;
          }
        }

        particleBuffer?.destroy?.();
        particleBuffer = device.createBuffer({
          size: particleData.byteLength,
          usage: gpuBufferUsage.STORAGE | gpuBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(particleBuffer, 0, particleData);

        computeBindGroup = device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: particleBuffer } },
            { binding: 1, resource: { buffer: paramsBuffer } },
            { binding: 2, resource: { buffer: permutationBuffer } },
          ],
        });

        renderBindGroup = device.createBindGroup({
          layout: renderPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: particleBuffer } },
            { binding: 1, resource: { buffer: paramsBuffer } },
          ],
        });
      };

      const handleMotionChange = (event: MediaQueryListEvent) => {
        prefersReducedMotion = event.matches;
      };

      const handleMouseMove = (event: MouseEvent) => {
        mouse = { x: event.clientX, y: event.clientY };
      };

      const handleMouseLeave = () => {
        mouse = { x: -1000, y: -1000 };
      };

      const handleResize = () => {
        rebuildParticles();
      };

      addMediaQueryListener(reducedMotionQuery, handleMotionChange);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("resize", handleResize);
      rebuildParticles();

      void device.lost.then(() => {
        fallback();
      });

      const frame = () => {
        if (disposed || particleCount === 0) {
          return;
        }

        const palette = getThemeParticlePalette();
        paramsData[0] = viewportWidth;
        paramsData[1] = viewportHeight;
        paramsData[2] = mouse.x;
        paramsData[3] = mouse.y;
        paramsData[4] = mouseRadius();
        paramsData[5] = mouseStrength();
        paramsData[6] = springStiffness();
        paramsData[7] = damping();
        paramsData[8] = flowSpeed();
        paramsData[9] = flowScale();
        paramsData[10] = flowStrength();
        paramsData[11] = time;
        paramsData[12] = particleRadius();
        paramsData[13] = prefersReducedMotion ? 1 : 0;
        paramsData[14] = particleCount;
        paramsData[15] = 0;
        paramsData.set(palette.base, 16);
        paramsData.set(palette.accent, 20);
        device.queue.writeBuffer(paramsBuffer, 0, paramsData);

        const encoder = device.createCommandEncoder();
        const computePass = encoder.beginComputePass();
        computePass.setPipeline(computePipeline);
        computePass.setBindGroup(0, computeBindGroup);
        computePass.dispatchWorkgroups(Math.ceil(particleCount / 64));
        computePass.end();

        const textureView = context.getCurrentTexture().createView();
        const renderPass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        renderPass.setPipeline(renderPipeline);
        renderPass.setBindGroup(0, renderBindGroup);
        renderPass.draw(6, particleCount, 0, 0);
        renderPass.end();

        device.queue.submit([encoder.finish()]);
        time += 1;
        animationId = requestAnimationFrame(frame);
      };

      animationId = requestAnimationFrame(frame);

      cleanup = () => {
        if (reducedMotionQuery) {
          removeMediaQueryListener(reducedMotionQuery, handleMotionChange);
        }
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("resize", handleResize);
        particleBuffer?.destroy?.();
        permutationBuffer.destroy();
        paramsBuffer.destroy();
      };
    } catch {
      fallback();
    }
  };

  return <canvas ref={canvasRef} style={PARTICLE_CANVAS_STYLE} />;
}
