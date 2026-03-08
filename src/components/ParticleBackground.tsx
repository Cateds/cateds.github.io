import { onMount, onCleanup } from "solid-js";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  restX: number;
  restY: number;
}

interface ParticleGridProps {
  spacing?: number;
  springStiffness?: number;
  damping?: number;
  mouseRadius?: number;
  mouseStrength?: number;
  particleRadius?: number;
  flowSpeed?: number;
  flowScale?: number;
  flowStrength?: number;
}

const permutation = new Uint8Array(512);
for (let i = 0; i < 256; i++) permutation[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
}
for (let i = 0; i < 256; i++) permutation[i + 256] = permutation[i];

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);

  const u = fade(x);
  const v = fade(y);

  const A = permutation[X] + Y;
  const B = permutation[X + 1] + Y;

  return lerp(
    lerp(grad(permutation[A], x, y), grad(permutation[B], x - 1, y), u),
    lerp(
      grad(permutation[A + 1], x, y - 1),
      grad(permutation[B + 1], x - 1, y - 1),
      u,
    ),
    v,
  );
}

let canvasRef: HTMLCanvasElement | undefined;
let particles: Particle[] = [];
let mouse = { x: -1000, y: -1000 };
let animationId = 0;
let time = 0;
let prefersReducedMotion = false;

export default function ParticleBackground(props: ParticleGridProps) {
  const spacing = () => props.spacing ?? 25;
  const springStiffness = () => props.springStiffness ?? 0.018;
  const damping = () => props.damping ?? 0.92;
  const mouseRadius = () => props.mouseRadius ?? 500;
  const mouseStrength = () => props.mouseStrength ?? 12000;
  const particleRadius = () => props.particleRadius ?? 1.5;
  const flowSpeed = () => props.flowSpeed ?? 0.008;
  const flowScale = () => props.flowScale ?? 0.0012;
  const flowStrength = () => props.flowStrength ?? 25;

  const initParticles = (width: number, height: number) => {
    const newParticles: Particle[] = [];
    const cols = Math.ceil(width / spacing()) + 1;
    const rows = Math.ceil(height / spacing()) + 1;
    const offsetX = (width - (cols - 1) * spacing()) / 2;
    const offsetY = (height - (rows - 1) * spacing()) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const restX = offsetX + col * spacing();
        const restY = offsetY + row * spacing();
        newParticles.push({
          x: restX,
          y: restY,
          vx: 0,
          vy: 0,
          restX,
          restY,
        });
      }
    }
    particles = newParticles;
  };

  onMount(() => {
    prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const canvas = canvasRef;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouse = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      const baseColor = isDark ? "220, 215, 210" : "100, 95, 90";
      const accentColor = isDark ? "232, 154, 120" : "224, 123, 83";

      const t = time * flowSpeed();

      particles.forEach((particle) => {
        if (!prefersReducedMotion) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < mouseRadius() && dist > 0) {
            const force = mouseStrength() / (distSq + 1);
            particle.vx -= (dx / dist) * force * 0.01;
            particle.vy -= (dy / dist) * force * 0.01;
          }

          const noiseX = particle.restX * flowScale() + t * 0.3;
          const noiseY = particle.restY * flowScale() + t * 0.2;

          const offsetX = perlin(noiseX, noiseY) * flowStrength();
          const offsetY = perlin(noiseX + 100, noiseY + 100) * flowStrength();

          const targetX = particle.restX + offsetX;
          const targetY = particle.restY + offsetY;

          const springX = (targetX - particle.x) * springStiffness();
          const springY = (targetY - particle.y) * springStiffness();
          particle.vx += springX;
          particle.vy += springY;

          particle.vx *= damping();
          particle.vy *= damping();

          particle.x += particle.vx;
          particle.y += particle.vy;
        } else {
          particle.x = particle.restX;
          particle.y = particle.restY;
        }

        const displacement = Math.sqrt(
          Math.pow(particle.x - particle.restX, 2) +
            Math.pow(particle.y - particle.restY, 2),
        );
        const intensity = Math.min(displacement / 25, 1);
        const opacity = 0.25 + intensity * 0.45;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particleRadius(), 0, Math.PI * 2);

        if (intensity > 0.15) {
          ctx.fillStyle = `rgba(${accentColor}, ${opacity})`;
        } else {
          ctx.fillStyle = `rgba(${baseColor}, 0.2)`;
        }
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    onCleanup(() => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        "pointer-events": "none",
        "z-index": 0,
      }}
    />
  );
}