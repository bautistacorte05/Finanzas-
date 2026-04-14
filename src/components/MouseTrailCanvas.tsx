import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  hue: number;   // Using HSL so we only store a number
  decay: number;
}

// Precomputed color hues matching emerald/cyan/indigo palette
const HUES = [160, 175, 185, 220, 250];

export default function MouseTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, moved: false });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse without setState to avoid React re-renders
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, moved: true };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let lastSpawn = 0;

    const draw = (timestamp: number) => {
      animRef.current = requestAnimationFrame(draw);

      // Throttle particle spawn to every ~16ms (60fps) and only if mouse moved
      const shouldSpawn = mouseRef.current.moved && timestamp - lastSpawn > 16;

      if (shouldSpawn) {
        lastSpawn = timestamp;
        mouseRef.current.moved = false;

        // Spawn 3 particles per move — enough for a rich trail, not too many
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.2 + 0.2;
          particlesRef.current.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * 6,
            y: mouseRef.current.y + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.4, // gentle upward float
            alpha: Math.random() * 0.5 + 0.5,
            size: Math.random() * 8 + 3,
            hue: HUES[Math.floor(Math.random() * HUES.length)],
            decay: Math.random() * 0.018 + 0.01,
          });
        }

        // Hard cap to avoid memory buildup
        if (particlesRef.current.length > 180) {
          particlesRef.current.splice(0, particlesRef.current.length - 180);
        }
      }

      // Fade out instead of clear — creates a motion-blur trailing effect naturally
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set glow once per frame — much cheaper than per-particle radialGradient
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowBlur = 12;

      const dead: number[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        if (p.alpha <= 0.01) {
          dead.push(i);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = `hsl(${p.hue}, 90%, 65%)`;
        ctx.fillStyle = `hsl(${p.hue}, 85%, 70%)`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.size *= 0.97;
        p.alpha -= p.decay;
      }

      // Remove dead particles in reverse so indices stay valid
      for (let i = dead.length - 1; i >= 0; i--) {
        particlesRef.current.splice(dead[i], 1);
      }

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[50]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
