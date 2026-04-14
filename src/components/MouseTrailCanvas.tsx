import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
  float: number;
}

const COLORS = [
  'rgba(16, 185, 129,',   // emerald-500
  'rgba(52, 211, 153,',   // emerald-400
  'rgba(6, 182, 212,',    // cyan-500
  'rgba(99, 102, 241,',   // indigo-500
  'rgba(167, 243, 208,',  // emerald-200
];

export default function MouseTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Spawn multiple particles per move for a denser trail
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.3;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5, // slight upward drift
          alpha: Math.random() * 0.6 + 0.4,
          size: Math.random() * 12 + 4,
          color,
          decay: Math.random() * 0.015 + 0.008,
          float: (Math.random() - 0.5) * 0.02,
        });
      }

      // Limit particle count
      if (particlesRef.current.length > 300) {
        particlesRef.current = particlesRef.current.slice(-300);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.01);

      for (const p of particlesRef.current) {
        // Create glowing gradient per particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `${p.color} ${p.alpha})`);
        gradient.addColorStop(0.5, `${p.color} ${p.alpha * 0.4})`);
        gradient.addColorStop(1, `${p.color} 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx += p.float;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.size *= 0.98;
        p.alpha -= p.decay;
      }

      animRef.current = requestAnimationFrame(draw);
      frameRef.current++;
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[50] mix-blend-screen"
    />
  );
}
