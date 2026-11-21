import { useEffect, useRef } from 'react';

interface Wisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  color: string;
}

const PALETTE_COLORS = ['#CBE0E1', '#95B3B5', '#327D87', '#8CA293'];

export function MagicalMistCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let pointerX = width * 0.5;
    let pointerY = height * 0.35;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const wispCount = width < 640 ? 28 : 48;
    const wisps: Wisp[] = Array.from({ length: wispCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.18 - Math.random() * 0.35,
      radius: 1.4 + Math.random() * 2.8,
      alpha: 0.25 + Math.random() * 0.65,
      phase: i * 0.65,
      color: PALETTE_COLORS[i % PALETTE_COLORS.length],
    }));

    const handlePointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let time = 0;

    const renderFrame = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Subtle moving silver-teal mist glow following pointer gently
      const auraGrad = ctx.createRadialGradient(
        pointerX,
        pointerY,
        12,
        pointerX,
        pointerY,
        Math.max(width, height) * 0.36
      );
      auraGrad.addColorStop(0, 'rgba(50, 125, 135, 0.16)');
      auraGrad.addColorStop(0.45, 'rgba(13, 74, 63, 0.08)');
      auraGrad.addColorStop(1, 'rgba(12, 20, 27, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient drifting lake mist band
      const mistY = height * 0.72 + Math.sin(time * 0.6) * 18;
      const mistGrad = ctx.createLinearGradient(0, mistY - 140, 0, height);
      mistGrad.addColorStop(0, 'rgba(14, 44, 54, 0)');
      mistGrad.addColorStop(0.55, 'rgba(8, 84, 92, 0.14)');
      mistGrad.addColorStop(1, 'rgba(12, 51, 44, 0.25)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, mistY - 140, width, height - (mistY - 140));

      // Floating glowing wisps
      for (const w of wisps) {
        if (!prefersReducedMotion) {
          w.x += w.vx + Math.sin(time + w.phase) * 0.18;
          w.y += w.vy;
          if (w.y < -12) {
            w.y = height + 12;
            w.x = Math.random() * width;
          }
          if (w.x < -12) w.x = width + 12;
          if (w.x > width + 12) w.x = -12;
        }

        const pulse = 0.6 + 0.4 * Math.sin(time * 1.8 + w.phase);
        const currentAlpha = w.alpha * pulse;

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = w.color;
        ctx.shadowColor = '#CBE0E1';
        ctx.shadowBlur = w.radius * 4.5;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
