<script lang="ts">
  import { onMount } from "svelte";
  import { createCanvasRenderer } from "$lib/sky/canvas";
  import {
    CANVAS_SPACING,
    CANVAS_STYLE,
    DEFAULT_SKY_OPTIONS,
    createParticles,
    createState,
    getSkySize,
    idleFocus,
    readNightTarget,
  } from "$lib/sky/shared";
  import type { SkyRenderer } from "$lib/sky/types";
  import { createWebGPURenderer } from "$lib/sky/webgpu";

  interface Props {
    spacing?: number;
    renderScale?: number;
  }

  let {
    spacing = DEFAULT_SKY_OPTIONS.spacing,
    renderScale = DEFAULT_SKY_OPTIONS.renderScale,
  }: Props = $props();

  let canvas: HTMLCanvasElement;
  let ready = $state(false);

  onMount(() => {
    let renderer: SkyRenderer | null = null;
    let raf = 0;
    let disposed = false;
    let width = 0;
    let height = 0;
    let time = Math.random() * 100;
    let last = performance.now();
    let night = readNightTarget();
    // Anchor = where the ring rests. It starts at the idle spot, then stays at the
    // last pointer position after the pointer leaves or stops.
    let anchor: { x: number; y: number } | null = null;
    let pointerActive = false;
    const focus = { x: 0, y: 0 };
    const flow = { x: 0, y: 0 };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const layout = () => {
      if (!renderer) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2) * renderScale;
      renderer.resize(Math.round(width * pixelRatio), Math.round(height * pixelRatio));
      const gap = renderer.kind === "canvas" ? Math.max(spacing, CANVAS_SPACING) : spacing;
      const rest = createParticles(width, height, gap);
      renderer.setParticles(rest, createState(rest));
      const idle = idleFocus(width, height, time);
      if (!focus.x && !focus.y) Object.assign(focus, idle);
      if (anchor) {
        anchor = { x: Math.min(anchor.x, width), y: Math.min(anchor.y, height) };
      }
    };

    // Power: full rate while the pointer is moving, ~30fps while idle.
    const frame = (now: number) => {
      if (disposed || !renderer) return;
      if (renderer.lost) {
        void swapToCanvas();
        return;
      }
      const minGap = pointerActive ? 0 : 1000 / 31;
      if (now - last < minGap) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const still = motion.matches;
      if (!still) time += dt;

      // Target = anchor (last pointer position, or the idle spot) plus a slow breath.
      const idle = idleFocus(width, height, time);
      const base = anchor ?? idle;
      const breathe = pointerActive ? 0 : 1;
      const tx = base.x + (anchor ? Math.sin(time * 0.21) * 18 * breathe : 0);
      const ty = base.y + (anchor ? Math.cos(time * 0.17) * 12 * breathe : 0);
      // Soft follow: the big ring glides after the pointer; springs add the ripple.
      const follow = still ? 1 : 1 - Math.exp(-dt * (pointerActive ? 2.4 : 1.2));
      const px = focus.x;
      const py = focus.y;
      focus.x += (tx - focus.x) * follow;
      focus.y += (ty - focus.y) * follow;
      if (dt > 0) {
        const ease = 1 - Math.exp(-dt * 6);
        flow.x += ((focus.x - px) / dt - flow.x) * ease;
        flow.y += ((focus.y - py) / dt - flow.y) * ease;
      }
      night += (readNightTarget() - night) * (still ? 1 : 1 - Math.exp(-dt * 3));

      const { radius, band } = getSkySize(width, height);
      renderer.render({
        width,
        height,
        time,
        dt: still ? 0 : dt,
        focusX: focus.x,
        focusY: focus.y,
        radius,
        band,
        night,
        flowX: still ? 0 : flow.x,
        flowY: still ? 0 : flow.y,
      });

      if (!ready) ready = true;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const swapToCanvas = async () => {
      renderer?.destroy();
      // A canvas that held a WebGPU context cannot switch to 2D; replace it.
      const next = canvas.cloneNode() as HTMLCanvasElement;
      canvas.replaceWith(next);
      canvas = next;
      renderer = createCanvasRenderer(canvas);
      layout();
      start();
    };

    let idleTimer = 0;
    const onPointer = (event: PointerEvent) => {
      if (coarse.matches) return;
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        anchor = { x: event.clientX, y: event.clientY };
        pointerActive = true;
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => (pointerActive = false), 600);
      }
    };
    const onLeave = () => (pointerActive = false);
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 120);
    };

    void (async () => {
      try {
        renderer = await createWebGPURenderer(canvas);
      } catch {
        renderer = null;
      }
      if (disposed) {
        renderer?.destroy();
        return;
      }
      if (!renderer) {
        await swapToCanvas();
        return;
      }
      layout();
      start();
    })();

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      renderer?.destroy();
    };
  });
</script>

<div class="sky" class:ready aria-hidden="true">
  <canvas bind:this={canvas} style={CANVAS_STYLE}></canvas>
</div>

<style>
  .sky {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0;
    filter: blur(10px);
    transition:
      opacity 1.6s ease,
      filter 1.8s cubic-bezier(0.2, 0.7, 0.1, 1);
  }

  .sky.ready {
    opacity: var(--sky-opacity, 1);
    filter: none;
  }

  /* Keep the reading column calm: the field thins out behind content. */
  @media (min-width: 861px) {
    .sky {
      mask-image: linear-gradient(
        90deg,
        rgb(0 0 0 / 0.35) 0,
        rgb(0 0 0 / 0.35) 248px,
        rgb(0 0 0 / 0.42) 420px,
        rgb(0 0 0 / 0.7) 900px,
        #000 1200px
      );
    }
  }

  @media (max-width: 860px) {
    .sky {
      mask-image: linear-gradient(180deg, #000 0, rgb(0 0 0 / 0.75) 40%, rgb(0 0 0 / 0.45) 100%);
    }
  }

  :global([data-sky="quiet"]) .sky.ready {
    --sky-opacity: 0.4;
  }
</style>
