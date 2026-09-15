import React, { useEffect, useState } from 'react';
import { TrophyAward } from '../../core/trophies/Trophy';
import { Player } from '../../core/player/Player';
import { AudioManager } from '../../core/audio/AudioManager';
import { Trophy, Sparkles, Camera, Award, ChevronRight, Flame } from 'lucide-react';

interface TrophyCeremonyModalProps {
  trophy: TrophyAward;
  winner: Player;
  tournamentName: string;
  tournamentLocation: string;
  prizeMoney: number;
  rankingPoints: number;
  onContinue: () => void;
}

export const TrophyCeremonyModal: React.FC<TrophyCeremonyModalProps> = ({
  trophy,
  winner,
  tournamentName,
  tournamentLocation,
  prizeMoney,
  rankingPoints,
  onContinue,
}) => {
  const isSidWaddell = trophy.trophyId === 'sid-waddell' || tournamentName.includes('World Darts Championship') || tournamentLocation.includes('Alexandra Palace');
  const [celebrationState, setCelebrationState] = useState<'intro' | 'lifting' | 'champagne' | 'press'>('intro');
  const [flashes, setFlashes] = useState<boolean>(false);

  useEffect(() => {
    AudioManager.playMatchWon(winner.name);
    const flashTimer = setInterval(() => {
      setFlashes(prev => !prev);
    }, 450);
    return () => clearInterval(flashTimer);
  }, [winner.name]);

  const handleLiftTrophy = () => {
    setCelebrationState('lifting');
    AudioManager.playCrowdCheer(4.0);
  };

  const handleSprayChampagne = () => {
    setCelebrationState('champagne');
    AudioManager.playCrowdCheer(3.0);
  };

  const handlePressPose = () => {
    setCelebrationState('press');
    setFlashes(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      {/* Dynamic Flashbulbs Overlay */}
      {flashes && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none transition-opacity duration-150" />
      )}

      {/* Floating Confetti Particle Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2.5 h-4 rounded-sm animate-pulse opacity-70"
            style={{
              top: `${(i * 7) % 100}%`,
              left: `${(i * 13) % 100}%`,
              backgroundColor: ['#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#10b981', '#ffffff'][i % 6],
              transform: `rotate(${(i * 37) % 360}deg)`,
              animationDuration: `${1.5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-neutral-900/95 via-neutral-900 to-neutral-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 overflow-hidden">
        {/* Glow Halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-widest shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official PDC Trophy Presentation</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-1">
            {isSidWaddell ? '👑 WORLD CHAMPION OF DARTS!' : '🏆 TOURNAMENT CHAMPION!'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium">
            {tournamentName} • {tournamentLocation}
          </p>
        </div>

        {/* High-Definition 3D-Styled SVG Trophy Art */}
        <div className="relative z-10 py-2 flex flex-col items-center">
          <div className={`transition-transform duration-500 ${celebrationState === 'lifting' ? 'scale-110 -translate-y-2' : ''}`}>
            {isSidWaddell ? (
              /* The Sid Waddell Trophy at Alexandra Palace: Spiral crystal dart column with silver finial & ebony plinth */
              <svg viewBox="0 0 160 220" className="w-40 sm:w-48 h-52 sm:h-60 mx-auto drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                <defs>
                  <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#eab308" />
                    <stop offset="70%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="crystalGleam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="woodPlinth" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="50%" stopColor="#312e81" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Ambient Trophy Radiance */}
                <circle cx="80" cy="90" r="60" fill="url(#goldSheen)" opacity="0.15" filter="blur(15px)" />

                {/* Top Silver Star & Dart Finial */}
                <path d="M 80 15 L 85 30 L 100 32 L 88 42 L 92 56 L 80 47 L 68 56 L 72 42 L 60 32 L 75 30 Z" fill="url(#goldSheen)" stroke="#ffffff" strokeWidth="1.2" />

                {/* Spiral Crystal Cup Shaft */}
                <path d="M 68 52 C 60 80, 100 110, 72 140 L 88 140 C 116 110, 76 80, 92 52 Z" fill="url(#crystalGleam)" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 76 56 C 88 85, 68 115, 84 138" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />

                {/* Mid Gold Collar */}
                <ellipse cx="80" cy="142" rx="22" ry="6" fill="url(#goldSheen)" stroke="#fef08a" strokeWidth="1" />

                {/* Solid Heavy Plinth */}
                <rect x="52" y="148" width="56" height="34" rx="4" fill="url(#woodPlinth)" stroke="#475569" strokeWidth="1.5" />
                <rect x="44" y="182" width="72" height="14" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

                {/* Engraved Sid Waddell Brass Plaque */}
                <rect x="58" y="156" width="44" height="18" rx="2" fill="url(#goldSheen)" stroke="#ffffff" strokeWidth="0.8" />
                <text x="80" y="165" textAnchor="middle" fontSize="5" fontWeight="900" fill="#451a03" fontFamily="sans-serif">
                  SID WADDELL
                </text>
                <text x="80" y="171" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">
                  TROPHY
                </text>
              </svg>
            ) : (
              /* Standard Authentic PDC Major Trophy */
              <svg viewBox="0 0 160 200" className="w-36 sm:w-44 h-48 sm:h-56 mx-auto drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <defs>
                  <linearGradient id="majorGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </linearGradient>
                </defs>
                {/* Handles */}
                <path d="M 45 60 C 20 60, 20 110, 52 115" stroke="url(#majorGold)" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 115 60 C 140 60, 140 110, 108 115" stroke="url(#majorGold)" strokeWidth="6" fill="none" strokeLinecap="round" />
                {/* Main Chalice Body */}
                <path d="M 46 45 Q 80 50 114 45 L 110 105 Q 80 140 50 105 Z" fill="url(#majorGold)" stroke="#fef08a" strokeWidth="1.5" />
                {/* Stem & Base */}
                <path d="M 75 130 L 75 155 L 85 155 L 85 130 Z" fill="url(#majorGold)" />
                <path d="M 50 155 L 110 155 L 115 175 L 45 175 Z" fill="#0f172a" stroke="url(#majorGold)" strokeWidth="2" />
                <circle cx="80" cy="80" r="14" fill="#78350f" opacity="0.4" />
                <text x="80" y="85" textAnchor="middle" fontSize="14" fill="#ffffff">🎯</text>
              </svg>
            )}
          </div>

          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400">
              {trophy.trophyName}
            </h3>
            <p className="text-xs text-neutral-300 font-mono">
              Awarded to <span className="font-bold text-white">{winner.name}</span>
            </p>
          </div>
        </div>

        {/* Prize & Milestone Badges */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">First Prize</span>
            <span className="font-mono font-black text-emerald-400 text-lg">
              £{prizeMoney.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">PDC Order of Merit</span>
            <span className="font-mono font-black text-amber-400 text-lg">
              +{rankingPoints.toLocaleString()} Pts
            </span>
          </div>
        </div>

        {/* Celebration Interaction Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleLiftTrophy}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              celebrationState === 'lifting'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Hoist Trophy Aloft!</span>
          </button>

          <button
            type="button"
            onClick={handleSprayChampagne}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              celebrationState === 'champagne'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Spray Champagne 🍾</span>
          </button>

          <button
            type="button"
            onClick={handlePressPose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              celebrationState === 'press'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Pose for Photographers 📸</span>
          </button>
        </div>

        {/* Main Continue Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Post-Match Media & Celebrations</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
