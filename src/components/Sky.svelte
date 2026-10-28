<script lang="ts">
  /**
   * Optional particle layer. The current constructivist background no longer mounts it;
   * the renderer and its tests are kept for anyone who wants to bring the field back.
   */
  import { onMount } from "svelte";
  import { createCanvasRenderer } from "$lib/sky/canvas";
  import {
    CANVAS_SPACING,
    CANVAS_STYLE,
    DEFAULT_SKY_OPTIONS,
    createParticles,
    getSkySize,
    gridShape,
    idleFocus,
    type ParticleField,
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
  let container: HTMLDivElement;
  let ready = $state(false);

  onMount(() => {
    let renderer: SkyRenderer | null = null;
    let raf = 0;
    let disposed = false;
    let width = 0;
    let height = 0;
    let needsLayout = false;
    let time = Math.random() * 100;
    let last = performance.now();
    let night = readNightTarget();
    let field: ParticleField | null = null;
    // Anchor = where the ring rests. It starts at the idle spot, then stays at the
    // last pointer position after the pointer leaves or stops.
    let anchor: { x: number; y: number } | null = null;
    // Resize does not reliably emit pointermove. Keep the last viewport-relative
    // pointer position so the ring follows the cursor after a window resize too.
    let lastPointer: { x: number; y: number } | null = null;
    let pointerWindowOrigin = { x: window.screenX, y: window.screenY };
    let pointerActive = false;
    const focus = { x: 0, y: 0 };
    const flow = { x: 0, y: 0 };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    // One simulation + paint step. A resize calls it directly, right after the drawing
    // buffer changed: the resize clears the buffer, and waiting for the next animation
    // frame would flash an empty canvas.
    const paint = (now: number, elapsed?: number) => {
      if (disposed || !renderer) return;
      const dt = elapsed ?? Math.min(Math.max((now - last) / 1000, 0), 0.05);
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
        // dt=0 means settle instantly to the renderer, not "just redraw".
        dt: still ? 0 : Math.max(dt, 0.000001),
        focusX: focus.x,
        focusY: focus.y,
        radius,
        band,
        night,
        flowX: still ? 0 : flow.x,
        flowY: still ? 0 : flow.y,
      });

      if (!ready) ready = true;
    };

    const layout = () => {
      if (!renderer) return;
      const bounds = container.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      // Never stretch an old buffer to fit an independently changing CSS box.
      // The drawing coordinates, display box and buffer are committed together.
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2) * renderScale;
      renderer.resize(Math.round(width * pixelRatio), Math.round(height * pixelRatio));
      const gap = renderer.kind === "canvas" ? Math.max(spacing, CANVAS_SPACING) : spacing;
      // Grow the field only when the viewport needs more cells; existing cells keep
      // their rest spot, seeds and live state. An address-bar resize no longer
      // rebuilds (and blanks) the whole field.
      const { cols, rows } = gridShape(width, height, gap);
      if (!field || cols > field.cols || rows > field.rows) {
        field = createParticles(width, height, gap, field ?? undefined);
        renderer.setParticles(field);
      }
      const idle = idleFocus(width, height, time);
      if (!focus.x && !focus.y) Object.assign(focus, idle);
      if (lastPointer) {
        // Resizing from the left/top edge moves the window origin underneath a
        // stationary cursor. Translate the stored client coordinate by that delta.
        lastPointer = {
          x: lastPointer.x + pointerWindowOrigin.x - window.screenX,
          y: lastPointer.y + pointerWindowOrigin.y - window.screenY,
        };
        pointerWindowOrigin = { x: window.screenX, y: window.screenY };
        anchor = {
          x: Math.min(Math.max(lastPointer.x, 0), width),
          y: Math.min(Math.max(lastPointer.y, 0), height),
        };
      } else if (anchor) {
        anchor = { x: Math.min(anchor.x, width), y: Math.min(anchor.y, height) };
      }
      if (ready) paint(performance.now(), 0);
    };

    // Power: full rate while the pointer moves or the day/night crossfade eases,
    // ~30fps when idle. The CPU fallback keeps its own pacing.
    const frame = (now: number) => {
      if (disposed || !renderer) return;
      if (renderer.lost) {
        void swapToCanvas();
        return;
      }
      if (needsLayout) {
        needsLayout = false;
        layout();
        raf = requestAnimationFrame(frame);
        return;
      }
      const easing = Math.abs(readNightTarget() - night) > 0.01;
      const minGap = motion.matches ? (easing ? 0 : 250) : pointerActive || easing ? 0 : 1000 / 31;
      if (now - last < minGap) {
        raf = requestAnimationFrame(frame);
        return;
      }
      paint(now);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const swapToCanvas = async () => {
      if (disposed) return;
      cancelAnimationFrame(raf);
      renderer?.destroy();
      // A canvas that held a WebGPU context cannot switch to 2D; replace it.
      const next = canvas.cloneNode() as HTMLCanvasElement;
      canvas.replaceWith(next);
      canvas = next;
      renderer = createCanvasRenderer(canvas);
      if (!renderer) return;
      // The CPU fallback runs a sparser grid; let layout build a fresh field for it.
      field = null;
      layout();
      start();
    };

    let idleTimer = 0;
    const onPointer = (event: PointerEvent) => {
      if (coarse.matches) return;
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        lastPointer = { x: event.clientX, y: event.clientY };
        pointerWindowOrigin = { x: window.screenX, y: window.screenY };
        anchor = lastPointer;
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

    const onResize = () => {
      needsLayout = true;
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

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
      observer.disconnect();
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      renderer?.destroy();
    };
  });
</script>

<div class="sky" bind:this={container} class:ready aria-hidden="true">
  <canvas bind:this={canvas} style={CANVAS_STYLE}></canvas>
</div>

<style>
  .sky {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    opacity: 0;
    filter: blur(10px);
    transition:
      opacity 1.6s ease,
      filter 1.8s cubic-bezier(0.2, 0.7, 0.1, 1);
  }

  /* Browser chrome changes the visible area, not the background's world size.
     A stable large viewport avoids stretching/recentring during address-bar motion. */
  @media (hover: none) and (pointer: coarse) {
    .sky {
      height: 100lvh;
    }
  }

  .sky.ready {
    opacity: var(--sky-opacity, 0.85);
    filter: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .sky {
      filter: none;
      transition: none;
    }
  }

  /* Keep the reading column calm: the field thins out behind content. */
  @media (min-width: 861px) {
    .sky {
      mask-image: linear-gradient(
        90deg,
        rgb(0 0 0 / 0.3) 0,
        rgb(0 0 0 / 0.3) 272px,
        rgb(0 0 0 / 0.4) 440px,
        rgb(0 0 0 / 0.68) 920px,
        #000 1220px
      );
    }
  }

  @media (max-width: 860px) {
    .sky {
      mask-image: linear-gradient(180deg, #000 0, rgb(0 0 0 / 0.75) 40%, rgb(0 0 0 / 0.45) 100%);
    }
  }

  :global([data-sky="quiet"]) .sky.ready {
    --sky-opacity: 0.32;
  }
</style>
