import React, { useEffect, useRef } from 'react';

interface WindVortexCanvasProps {
  windSpeedKmh: number;
  isActive: boolean;
  onToggle: () => void;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
  color: string;
}

export const WindVortexCanvas: React.FC<WindVortexCanvasProps> = ({
  windSpeedKmh,
  isActive,
  onToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Approximate eye center on map canvas
    const eyeX = width * 0.72;
    const eyeY = height * 0.65;

    const numParticles = 160;
    const particles: Particle[] = [];

    const getWindColor = (speedFraction: number) => {
      if (speedFraction > 0.8) return '#f43f5e'; // Crimson
      if (speedFraction > 0.5) return '#fbbf24'; // Amber
      if (speedFraction > 0.25) return '#06b6d4'; // Cyan
      return '#10b981'; // Emerald
    };

    for (let i = 0; i < numParticles; i++) {
      const radius = 30 + Math.random() * (Math.max(width, height) * 0.8);
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.8 + Math.random() * 1.5) * (windSpeedKmh / 100);
      particles.push({
        x: eyeX + Math.cos(angle) * radius,
        y: eyeY + Math.sin(angle) * radius,
        age: Math.floor(Math.random() * 60),
        maxAge: 40 + Math.floor(Math.random() * 80),
        speed,
        color: getWindColor(Math.random()),
      });
    }

    let lastFrameTime = performance.now();
    const frameIntervalMs = 1000 / 35; // 35 FPS optimal rendering budget

    const render = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(render);

      const elapsed = currentTime - lastFrameTime;
      if (elapsed < frameIntervalMs) return;
      lastFrameTime = currentTime - (elapsed % frameIntervalMs);

      // Semi-transparent fade trail
      ctx.fillStyle = 'rgba(7, 9, 14, 0.15)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx = p.x - eyeX;
        const dy = p.y - eyeY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Cyclonic inward spiral math
        const angle = Math.atan2(dy, dx);
        const tangentialSpeed = p.speed * 2.2;
        const radialSpeed = p.speed * 0.65;

        // Counter-clockwise cyclonic rotation
        const newX = p.x - Math.sin(angle) * tangentialSpeed - Math.cos(angle) * radialSpeed;
        const newY = p.y + Math.cos(angle) * tangentialSpeed - Math.sin(angle) * radialSpeed;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(newX, newY);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        p.x = newX;
        p.y = newY;
        p.age++;

        // Reset particle if too close to eye or expired
        if (dist < 18 || p.age > p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          const resetRadius = 60 + Math.random() * (Math.max(width, height) * 0.7);
          const resetAngle = Math.random() * Math.PI * 2;
          p.x = eyeX + Math.cos(resetAngle) * resetRadius;
          p.y = eyeY + Math.sin(resetAngle) * resetRadius;
          p.age = 0;
          p.color = getWindColor(Math.random());
        }
      });
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isActive, windSpeedKmh]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full opacity-60 mix-blend-screen" />
    </div>
  );
};
