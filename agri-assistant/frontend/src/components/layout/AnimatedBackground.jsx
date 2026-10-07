import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 4000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          vx: Math.floor(Math.random() * 50) - 25,
          vy: Math.floor(Math.random() * 50) - 25,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Slow drift
        star.x += star.vx / 100;
        star.y += star.vy / 100;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#030712]">
      {/* Drifting Starfield */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50 pointer-events-none" />

      {/* Animated Aurora / Nebula Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-900/40 rounded-full mix-blend-screen filter blur-[128px] animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-[35rem] h-[35rem] bg-blue-900/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob-reverse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/2 w-[45rem] h-[45rem] bg-slate-800/40 rounded-full mix-blend-screen filter blur-[128px] animate-blob" style={{ animationDelay: '4s' }} />

      {/* Dark vignette overlay for text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#030712_100%)] opacity-80 pointer-events-none" />
    </div>
  );
}
