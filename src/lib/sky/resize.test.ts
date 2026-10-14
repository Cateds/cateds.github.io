import { afterEach, expect, test } from "bun:test";
import { createParticles, STATE_STRIDE } from "./shared";
import { createWebGPURenderer } from "./webgpu";

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
const originalUsage = Object.getOwnPropertyDescriptor(globalThis, "GPUBufferUsage");

afterEach(() => {
  for (const [key, descriptor] of [
    ["navigator", originalNavigator],
    ["GPUBufferUsage", originalUsage],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

test("WebGPU resize preserves live GPU state, not the stale CPU upload", async () => {
  const buffers: { data: Float32Array; usage: number; destroy(): void }[] = [];
  const device = {
    lost: new Promise(() => {}),
    createShaderModule: () => ({}),
    createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createRenderPipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createBindGroup: () => ({}),
    createBuffer: ({ size, usage }: { size: number; usage: number }) => {
      const buffer = { data: new Float32Array(size / 4), usage, destroy() {} };
      buffers.push(buffer);
      return buffer;
    },
    createCommandEncoder: () => {
      const copies: (() => void)[] = [];
      return {
        copyBufferToBuffer(
          source: (typeof buffers)[number],
          from: number,
          target: (typeof buffers)[number],
          to: number,
          size: number,
        ) {
          expect(source.usage & 4).not.toBe(0);
          expect(target.usage & 8).not.toBe(0);
          copies.push(() =>
            target.data.set(source.data.subarray(from / 4, (from + size) / 4), to / 4),
          );
        },
        finish: () => copies,
      };
    },
    queue: {
      writeBuffer(buffer: (typeof buffers)[number], offset: number, data: Float32Array) {
        buffer.data.set(data, offset / 4);
      },
      submit(commands: (() => void)[][]) {
        commands.flat().forEach((copy) => copy());
      },
    },
    destroy() {},
  };
  Object.defineProperty(globalThis, "GPUBufferUsage", {
    configurable: true,
    value: { UNIFORM: 1, STORAGE: 2, COPY_SRC: 4, COPY_DST: 8 },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      gpu: {
        requestAdapter: async () => ({ requestDevice: async () => device }),
        getPreferredCanvasFormat: () => "bgra8unorm",
      },
    },
  });
  const canvas = { getContext: () => ({ configure() {} }) } as unknown as HTMLCanvasElement;
  const renderer = await createWebGPURenderer(canvas);
  expect(renderer).not.toBeNull();
  let field = createParticles(90, 180, 30);
  renderer!.setParticles(field);
  let live = buffers.at(-1)!.data;
  // Stand in for compute shader writes. The CPU field intentionally stays stale.
  for (let i = 0; i < live.length; i++) live[i] = i + 100;
  const old = { cols: field.cols, rows: field.rows, state: live.slice() };
  field = createParticles(210, 240, 30, field);
  renderer!.setParticles(field);
  live = buffers.at(-1)!.data;
  for (let row = 0; row < old.rows; row++) {
    for (let col = 0; col < old.cols; col++) {
      const before = (row * old.cols + col) * STATE_STRIDE;
      const after = (row * field.cols + col) * STATE_STRIDE;
      expect(Array.from(live.subarray(after, after + STATE_STRIDE))).toEqual(
        Array.from(old.state.subarray(before, before + STATE_STRIDE)),
      );
    }
  }
  expect(live[(field.cols - 1) * STATE_STRIDE + 4]).toBe(0);
  renderer!.destroy();
});

test("alternating portrait/landscape growth never discards retained cells", () => {
  const portrait = createParticles(390, 844, 30);
  portrait.state.fill(7);
  const landscape = createParticles(844, 390, 30, portrait);
  expect(landscape.rows).toBeGreaterThanOrEqual(portrait.rows);
  expect(landscape.cols).toBeGreaterThanOrEqual(portrait.cols);
  const back = createParticles(390, 844, 30, landscape);
  expect(back.cols).toBe(landscape.cols);
  expect(back.rows).toBe(landscape.rows);
  for (let row = 0; row < portrait.rows; row++) {
    for (let col = 0; col < portrait.cols; col++) {
      const offset = (row * back.cols + col) * STATE_STRIDE;
      expect(Array.from(back.state.subarray(offset, offset + STATE_STRIDE))).toEqual(
        Array(STATE_STRIDE).fill(7),
      );
    }
  }
});
