import React from 'react';
import { SeasonAwardsGala, PdcAnnualAward } from '../../core/career/PdcAwardsManager';
import {
  Trophy, Award, Sparkles, Star, Zap, CheckCircle2, ChevronRight, X
} from 'lucide-react';

interface PdcAwardsGalaModalProps {
  gala: SeasonAwardsGala;
  onClose: () => void;
}

export const PdcAwardsGalaModal: React.FC<PdcAwardsGalaModalProps> = ({
  gala,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden my-auto">
        {/* Ambient Gold Glow & Spotlights */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PDC Annual Awards Gala • Season {gala.year}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>The Honours of the Oche</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Recognising the finest achievements, breakthrough stars, and world-class performances of the past 12 months.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Human Winners Congratulatory Banner */}
        {gala.humanAwardsCount > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30">
              🏆
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                Historic Career Triumph!
              </h4>
              <p className="text-xs text-slate-300">
                You have received {gala.humanAwardsCount} prestigious PDC Annual {gala.humanAwardsCount === 1 ? 'Accolade' : 'Accolades'} for your outstanding season!
              </p>
            </div>
          </div>
        )}

        {/* Awards 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {gala.awards.map((award: PdcAnnualAward) => {
            return (
              <div
                key={award.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3 ${
                  award.isHuman
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {award.category}
                    </span>
                    {award.isHuman && (
                      <span className="text-[10px] font-black uppercase text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full shadow">
                        ★ You Won!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-3xl filter drop-shadow">
                      {award.trophyIcon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {award.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-amber-300">
                          {award.winnerPlayerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({award.winnerNationality})
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-2 border-t border-white/5">
                    "{award.citation}"
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>PDC Honours Committee</span>
                  <span className="text-amber-400 font-bold">Class of {award.year}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>Celebrate & Step Off Stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
