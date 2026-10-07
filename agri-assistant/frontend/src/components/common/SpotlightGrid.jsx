import { useRef } from 'react';

export function SpotlightGrid({ children, className = '' }) {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    for (const card of containerRef.current.children) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove} 
      className={`group ${className}`}
    >
      {children}
    </div>
  );
}

export function SpotlightCard({ children, className = '' }) {
  const cardRef = useRef(null);

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleCardMouseMove}
      className={`relative flex flex-col rounded-xl border border-white/10 bg-[#05070D]/50 backdrop-blur-md overflow-hidden group/card transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* 1. THE BRIGHT BORDER FLARE */}
      {/* Forces a sharp white glow that peaks through the 1px gap */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 group-hover/card:opacity-100 hover:opacity-100 z-0"
        style={{
          background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.4), transparent 40%)'
        }}
      />
      
      {/* 2. THE GLASS MASK */}
      {/* Dark glassmorphic inner surface allowing background glow and waves to diffuse through */}
      <div className="absolute inset-[1px] rounded-xl bg-[#05070D]/60 backdrop-blur-md z-10" />

      {/* 3. THE SOFT INNER HIGHLIGHT */}
      {/* Replicates the soft blue/purple wash over the text/icons */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 group-hover/card:opacity-100 hover:opacity-100 z-20"
        style={{
          background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(120, 119, 198, 0.15), transparent 40%)'
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-30 h-full p-6">
        {children}
      </div>
    </div>
  );
}

export default SpotlightCard;
