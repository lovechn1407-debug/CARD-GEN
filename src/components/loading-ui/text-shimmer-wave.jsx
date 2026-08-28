import React from 'react';

export function TextShimmerWave({
  children,
  className = '',
  duration = 1.2,
  style = {}
}) {
  const text = typeof children === 'string' ? children : String(children || '');
  const characters = text.split('');
  const total = characters.length;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.04em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        color: '#ffffff',
        ...style
      }}
    >
      <style>{`
        @keyframes text-shimmer-wave-anim {
          0%, 100% {
            opacity: 0.35;
            transform: translateY(0px) scale(0.96);
            color: rgba(255, 255, 255, 0.45);
            text-shadow: none;
          }
          50% {
            opacity: 1;
            transform: translateY(-3px) scale(1.08);
            color: #ffffff;
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }
      `}</style>
      {characters.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            animation: `text-shimmer-wave-anim ${duration}s ease-in-out infinite`,
            animationDelay: `${(i / Math.max(1, total)) * duration}s`
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export function TextShimmerWaveDemo() {
  return (
    <TextShimmerWave className="text-xl font-medium">Thinking</TextShimmerWave>
  );
}
