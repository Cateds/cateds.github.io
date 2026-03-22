import { onCleanup, onMount } from "solid-js";
import {
  DEFAULT_PARTICLE_OPTIONS,
  PARTICLE_CANVAS_STYLE,
  addMediaQueryListener,
  clampRenderScale,
  createPermutationTable,
  getThemeParticlePalette,
  perlin,
  removeMediaQueryListener,
  type ParticleBackgroundProps,
} from "./particleBackgroundShared";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  restX: number;
  restY: number;
}

export default function ParticleBackgroundCanvas(
  props: ParticleBackgroundProps,
) {
  let canvasRef: HTMLCanvasElement | undefined = undefined;
  let particles: Particle[] = [];
  let mouse = { x: -1000, y: -1000 };
  let animationId = 0;
  let time = 0;
  let prefersReducedMotion = false;
  let reducedMotionQuery: MediaQueryList | undefined;
  let viewportWidth = 0;
  let viewportHeight = 0;

  const permutation = createPermutationTable();

  const spacing = () => props.spacing ?? DEFAULT_PARTICLE_OPTIONS.spacing;
  const springStiffness = () =>
    props.springStiffness ?? DEFAULT_PARTICLE_OPTIONS.springStiffness;
  const damping = () => props.damping ?? DEFAULT_PARTICLE_OPTIONS.damping;
  const mouseRadius = () =>
    props.mouseRadius ?? DEFAULT_PARTICLE_OPTIONS.mouseRadius;
  const mouseStrength = () =>
    props.mouseStrength ?? DEFAULT_PARTICLE_OPTIONS.mouseStrength;
  const particleRadius = () =>
    props.particleRadius ?? DEFAULT_PARTICLE_OPTIONS.particleRadius;
  const flowSpeed = () => props.flowSpeed ?? DEFAULT_PARTICLE_OPTIONS.flowSpeed;
  const flowScale = () => props.flowScale ?? DEFAULT_PARTICLE_OPTIONS.flowScale;
  const flowStrength = () =>
    props.flowStrength ?? DEFAULT_PARTICLE_OPTIONS.flowStrength;
  const renderScale = () => clampRenderScale(props.renderScale);

  const initParticles = (width: number, height: number) => {
    const newParticles: Particle[] = [];
    const cols = Math.ceil(width / spacing()) + 1;
    const rows = Math.ceil(height / spacing()) + 1;
    const offsetX = (width - (cols - 1) * spacing()) / 2;
    const offsetY = (height - (rows - 1) * spacing()) / 2;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const restX = offsetX + col * spacing();
        const restY = offsetY + row * spacing();
        newParticles.push({ x: restX, y: restY, vx: 0, vy: 0, restX, restY });
      }
    }

    particles = newParticles;
  };

  onMount(() => {
    reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion = reducedMotionQuery.matches;

    const canvas = canvasRef;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resizeCanvas = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = Math.max(1, Math.round(viewportWidth * renderScale()));
      canvas.height = Math.max(1, Math.round(viewportHeight * renderScale()));
      initParticles(viewportWidth, viewportHeight);
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

    resizeCanvas();
    addMediaQueryListener(reducedMotionQuery, handleMotionChange);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const scaleX = canvas.width / Math.max(viewportWidth, 1);
      const scaleY = canvas.height / Math.max(viewportHeight, 1);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

      const palette = getThemeParticlePalette();
      const baseColor = palette.baseRgb.join(", ");
      const accentColor = palette.accentRgb.join(", ");
      const t = time * flowSpeed();
      const radius = mouseRadius();
      const radiusSq = radius * radius;
      const strength = mouseStrength();

      particles.forEach((particle) => {
        if (!prefersReducedMotion) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = strength / (distSq + 1);
            particle.vx -= (dx / dist) * force * 0.01;
            particle.vy -= (dy / dist) * force * 0.01;
          }

          const noiseX = particle.restX * flowScale() + t * 0.3;
          const noiseY = particle.restY * flowScale() + t * 0.2;
          const offsetX = perlin(noiseX, noiseY, permutation) * flowStrength();
          const offsetY =
            perlin(noiseX + 100, noiseY + 100, permutation) * flowStrength();

          const targetX = particle.restX + offsetX;
          const targetY = particle.restY + offsetY;

          particle.vx += (targetX - particle.x) * springStiffness();
          particle.vy += (targetY - particle.y) * springStiffness();
          particle.vx *= damping();
          particle.vy *= damping();
          particle.x += particle.vx;
          particle.y += particle.vy;
        } else {
          particle.x = particle.restX;
          particle.y = particle.restY;
        }

        const displacement = Math.sqrt(
          (particle.x - particle.restX) * (particle.x - particle.restX) +
            (particle.y - particle.restY) * (particle.y - particle.restY),
        );
        const intensity = Math.min(displacement / 25, 1);
        const opacity = 0.25 + intensity * 0.45;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particleRadius(), 0, Math.PI * 2);
        ctx.fillStyle =
          intensity > 0.15
            ? `rgba(${accentColor}, ${opacity})`
            : `rgba(${baseColor}, 0.2)`;
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    onCleanup(() => {
      if (reducedMotionQuery) {
        removeMediaQueryListener(reducedMotionQuery, handleMotionChange);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);

      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });
  });

  return (
    <canvas ref={(el) => (canvasRef = el)} style={PARTICLE_CANVAS_STYLE} />
  );
}
