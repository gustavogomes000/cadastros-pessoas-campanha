import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

export default function ConstellationBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const CONNECT_DIST = 140;
    const COUNT = 55;
    let mouseX = -1000;
    let mouseY = -1000;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.4 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.008,
        });
      }
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const dpr = window.devicePixelRatio || 1;
      const dist = CONNECT_DIST * dpr;

      // Move & pulse particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Gentle mouse repulsion
        const mdx = p.x - mouseX * dpr;
        const mdy = p.y - mouseY * dpr;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 100 * dpr && md > 0) {
          p.vx += (mdx / md) * 0.08;
          p.vy += (mdy / md) * 0.08;
        }
        // Limit speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1) { p.vx *= 0.95; p.vy *= 0.95; }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < dist) {
            const alpha = (1 - d / dist) * 0.12;
            ctx!.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
            ctx!.lineWidth = 0.8 * dpr;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      // Draw particles with pulse glow
      for (const p of particles) {
        const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
        const pulseR = p.r + Math.sin(p.pulse) * 0.4;

        // Outer glow
        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR * 4 * dpr);
        gradient.addColorStop(0, `rgba(236, 72, 153, ${pulseAlpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, pulseR * 4 * dpr, 0, Math.PI * 2);
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, pulseR * dpr, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(236, 72, 153, ${pulseAlpha + 0.2})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const touch = 'touches' in e ? e.touches[0] : e;
      if (touch) {
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
      }
    };

    init();
    draw();
    window.addEventListener('resize', init);
    canvas.addEventListener('mousemove', handleMove as EventListener);
    canvas.addEventListener('touchmove', handleMove as EventListener, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
      canvas.removeEventListener('mousemove', handleMove as EventListener);
      canvas.removeEventListener('touchmove', handleMove as EventListener);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
    />
  );
}
