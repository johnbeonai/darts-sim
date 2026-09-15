import React, { useState } from 'react';
import { NarrativeDilemma, DilemmaOption } from '../../core/career/NarrativeDilemmaManager';
import { Player } from '../../core/player/Player';
import { Sparkles, ArrowRight, DollarSign, Activity, Flame, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

interface NarrativeDilemmaModalProps {
  player: Player;
  dilemma: NarrativeDilemma;
  onSelectOption: (option: DilemmaOption) => void;
}

export const NarrativeDilemmaModal: React.FC<NarrativeDilemmaModalProps> = ({
  player,
  dilemma,
  onSelectOption
}) => {
  const [selectedOption, setSelectedOption] = useState<DilemmaOption | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const handleConfirm = (option: DilemmaOption) => {
    setSelectedOption(option);
    setIsResolved(true);
  };

  const handleClose = () => {
    if (selectedOption) {
      onSelectOption(selectedOption);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-neutral-900 to-black border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 animate-scale-up">
        {!isResolved ? (
          <>
            {/* Header Tag */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <span>{dilemma.icon}</span>
                <span>CIRCUIT DILEMMA • {dilemma.category.toUpperCase()}</span>
              </div>
              <span className="text-xs text-neutral-400 font-semibold">{player.name}</span>
            </div>

            {/* Title & Context */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {dilemma.title}
              </h2>
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 text-sm text-neutral-300 leading-relaxed">
                {dilemma.context}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
                {dilemma.dilemmaPrompt}
              </p>
            </div>

            {/* 2 Selectable Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dilemma.options.map((opt) => {
                const c = opt.consequences;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleConfirm(opt)}
                    className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col justify-between group space-y-4 shadow-lg hover:shadow-amber-500/10"
                  >
                    <div className="space-y-2">
                      <div className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                        {opt.label}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    {/* Consequence Badges */}
                    <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                      <div className="flex flex-wrap gap-1.5">
                        {c.bankBalanceDelta !== undefined && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            c.bankBalanceDelta >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            <DollarSign className="w-3 h-3" />
                            {c.bankBalanceDelta >= 0 ? `+£${c.bankBalanceDelta.toLocaleString()}` : `-£${Math.abs(c.bankBalanceDelta).toLocaleString()}`}
                          </span>
                        )}

                        {c.fatigueDelta !== undefined && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            c.fatigueDelta <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            <Activity className="w-3 h-3" />
                            {c.fatigueDelta > 0 ? `+${c.fatigueDelta} Fatigue` : `${c.fatigueDelta} Fatigue`}
                          </span>
                        )}

                        {c.confidenceDelta !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-sky-500/20 text-sky-400">
                            <Flame className="w-3 h-3" />
                            +{c.confidenceDelta} Confidence
                          </span>
                        )}

                        {c.formDelta !== undefined && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            c.formDelta >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            <TrendingUp className="w-3 h-3" />
                            {c.formDelta >= 0 ? `+${c.formDelta} Form` : `${c.formDelta} Form`}
                          </span>
                        )}

                        {c.reputationTitle && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-300">
                            <Award className="w-3 h-3" />
                            {c.reputationTitle}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="w-full py-2 px-3 rounded-xl bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black text-xs font-bold text-neutral-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Choose This Path</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Resolution Screen */
          <div className="space-y-6 py-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Decision Locked In
              </span>
              <h3 className="text-2xl font-black text-white">{selectedOption?.label}</h3>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 text-sm text-neutral-200 leading-relaxed max-w-lg mx-auto">
              {selectedOption?.outcomeMessage}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95"
            >
              Continue Career
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
