import React from 'react';

export type OrbPhase = 'idle' | 'observing' | 'analyzing' | 'suggesting' | 'typing';

interface HoloOrbProps {
  phase?: OrbPhase;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const HoloOrb: React.FC<HoloOrbProps> = ({
  phase = 'idle',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const getColors = () => {
    switch (phase) {
      case 'observing':
        return {
          glow: 'from-cyan-400 via-sky-500 to-blue-600',
          shadow: 'rgba(6, 182, 212, 0.6)',
          ring: 'border-cyan-400/80 animate-ping',
          core: 'bg-cyan-300',
        };
      case 'analyzing':
        return {
          glow: 'from-purple-500 via-indigo-500 to-pink-500',
          shadow: 'rgba(168, 85, 247, 0.6)',
          ring: 'border-purple-400/80 animate-spin',
          core: 'bg-fuchsia-300',
        };
      case 'suggesting':
        return {
          glow: 'from-emerald-400 via-teal-500 to-cyan-500',
          shadow: 'rgba(16, 185, 129, 0.6)',
          ring: 'border-emerald-400/80 animate-pulse',
          core: 'bg-emerald-200',
        };
      case 'typing':
        return {
          glow: 'from-blue-500 via-indigo-600 to-cyan-400',
          shadow: 'rgba(59, 130, 246, 0.6)',
          ring: 'border-blue-400/80',
          core: 'bg-blue-200',
        };
      case 'idle':
      default:
        return {
          glow: 'from-cyan-500 via-indigo-500 to-purple-600',
          shadow: 'rgba(56, 189, 248, 0.4)',
          ring: 'border-cyan-500/30',
          core: 'bg-cyan-200',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none ${sizeMap[size]} ${className}`}
      title={`AI Status: ${phase.toUpperCase()}`}
    >
      {/* Outer pulsing ring */}
      <div
        className={`absolute inset-0 rounded-full border ${colors.ring} opacity-70 transition-all duration-700`}
        style={{ filter: `drop-shadow(0 0 8px ${colors.shadow})` }}
      />

      {/* Plasma orb background with radial gradient */}
      <div
        className={`w-full h-full rounded-full bg-gradient-to-tr ${colors.glow} animate-pulse shadow-lg transition-all duration-500 flex items-center justify-center overflow-hidden`}
        style={{
          boxShadow: `0 0 16px ${colors.shadow}, inset 0 0 8px rgba(255, 255, 255, 0.6)`,
        }}
      >
        {/* Swirling energy overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent_60%)] pointer-events-none" />

        {/* Dense glowing core */}
        <div
          className={`w-2.5 h-2.5 rounded-full ${colors.core} shadow-md shadow-white/80 transition-transform duration-300 ${
            phase === 'analyzing' ? 'scale-125' : 'scale-100'
          }`}
        />
      </div>

      {/* Live status ping dot for active vision */}
      {phase === 'observing' && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
      )}
    </div>
  );
};
