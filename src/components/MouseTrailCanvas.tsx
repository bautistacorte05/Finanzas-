import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 28;           // Puntos en la estela
const SPRITE_SIZE = 60;            // Tamaño del sprite pre-renderizado
const HUES = [160, 175, 190, 220]; // emerald → cyan → indigo

export default function MouseTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  
  // Circular buffer para las posiciones del mouse
  const trailRef  = useRef<{ x: number; y: number }[]>([]);
  const mouseRef  = useRef({ x: -999, y: -999 });

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true })!;

    // --- Resize ---
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // --- Captura del mouse: SIN React state, SIN throttling ---
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // --- Pre-renderizar sprites de glow (1 vez, no por frame) ---
    const sprites: OffscreenCanvas[] = HUES.map((hue) => {
      const oc  = new OffscreenCanvas(SPRITE_SIZE, SPRITE_SIZE);
      const oct = oc.getContext('2d')!;
      const cx  = SPRITE_SIZE / 2;
      const grad = oct.createRadialGradient(cx, cx, 0, cx, cx, cx);
      grad.addColorStop(0,   `hsla(${hue}, 90%, 70%, 1)`);
      grad.addColorStop(0.3, `hsla(${hue}, 85%, 60%, 0.6)`);
      grad.addColorStop(1,   `hsla(${hue}, 80%, 50%, 0)`);
      oct.fillStyle = grad;
      oct.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      return oc;
    });

    // Inicializar trail con posición fuera de pantalla
    trailRef.current = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -999, y: -999 }));

    // --- Loop principal ---
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      // Empujar posición actual al frente del trail (LIFO)
      trailRef.current.unshift({ ...mouseRef.current });
      trailRef.current.length = TRAIL_LENGTH; // mantener largo fijo

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';

      const trail = trailRef.current;

      for (let i = 0; i < trail.length; i++) {
        const { x, y } = trail[i];
        if (x < 0) continue;

        // Opacidad: el primer punto (i=0) es el más brillante
        const progress = 1 - i / trail.length;        // 1..0
        const alpha    = progress * progress * 0.9;    // ease-out
        const scale    = 0.15 + progress * 0.85;       // tamaño crece hacia el front
        const size     = SPRITE_SIZE * scale;
        const offset   = size / 2;

        // Alternar sprites por posición para variedad de color
        const sprite = sprites[i % sprites.length];

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, x - offset, y - offset, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
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
