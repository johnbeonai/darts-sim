import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Sparkles, Flame, Trophy, Crown, ArrowRight } from 'lucide-react';

interface NineDarterSpectacleModalProps {
  playerName: string;
  tournamentName?: string;
  onDismiss: () => void;
}

export const NineDarterSpectacleModal: React.FC<NineDarterSpectacleModalProps> = ({
  playerName,
  tournamentName = 'PDC Tour Arena',
  onDismiss
}) => {
  useEffect(() => {
    // Multi-stage confetti fireworks
    const duration = 4000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: ['#f59e0b', '#e11d48', '#38bdf8', '#fbbf24', '#ffffff']
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      {/* Background Animated Strobe Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-neutral-900 to-black border-2 border-amber-500/50 rounded-3xl p-8 shadow-2xl shadow-amber-500/20 text-center space-y-6 animate-scale-up">
        {/* Top Television Broadcast Bug */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-black tracking-widest uppercase animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span>BROADCAST HISTORY • 9-DART SPECTACLE</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-amber-400 fill-amber-400 animate-bounce" />
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight">
              PERFECTION AT THE OCHE!
            </h1>
            <Zap className="w-10 h-10 text-amber-400 fill-amber-400 animate-bounce" />
          </div>
          <p className="text-sm uppercase tracking-widest text-amber-200/80 font-bold">
            9 DARTS • 501 POINTS • ABSOLUTE DARTS IMMORTALITY
          </p>
        </div>

        {/* Famous Mardle Commentary Box */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left relative overflow-hidden">
          <div className="text-amber-300/90 font-serif italic text-sm sm:text-base leading-relaxed">
            &ldquo;I can’t spake! I CAN’T SPAKE!! That was the most extraordinary leg of darts ever witnessed!
            Nine perfect darts on the televised stage! Bedlam in the arena!&rdquo;
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-amber-400/70 uppercase tracking-wider">
            <span>— Wayne Mardle, TV Commentary</span>
            <span>{tournamentName}</span>
          </div>
        </div>

        {/* The 9-Dart Visit Blueprint */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Visit 1</div>
            <div className="text-2xl font-black text-amber-400">180</div>
            <div className="text-[10px] text-neutral-500">T20 • T20 • T20</div>
          </div>
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Visit 2</div>
            <div className="text-2xl font-black text-amber-400">180</div>
            <div className="text-[10px] text-neutral-500">T20 • T20 • T20</div>
          </div>
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1">
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Visit 3 (Finish)</div>
            <div className="text-2xl font-black text-emerald-400">141</div>
            <div className="text-[10px] text-emerald-300/80 font-semibold">T20 • T19 • D12</div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center gap-4">
          <Crown className="w-8 h-8 text-amber-400" />
          <div className="text-left">
            <div className="text-lg font-black text-white">{playerName}</div>
            <div className="text-xs text-amber-300/90 font-medium">
              Officially inducted into the prestigious PDC 9-Darter Club & Hall of Fame!
            </div>
          </div>
        </div>

        {/* Dismiss / Continue Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Continue Match</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
