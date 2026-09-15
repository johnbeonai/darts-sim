import React from 'react';
import { Player } from '../../core/player/Player';
import { Match } from '../../core/match/Match';
import { Trophy, Award, Target, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface MatchBoxScoreModalProps {
  player: Player;
  opponent: Player;
  match: Match;
  winnerId: string;
  isExhibition?: boolean;
  onContinue: () => void;
}

export const MatchBoxScoreModal: React.FC<MatchBoxScoreModalProps> = ({
  player,
  opponent,
  match,
  winnerId,
  isExhibition = false,
  onContinue,
}) => {
  const p1Stats = match.getOverallStats(player.id);
  const p2Stats = match.getOverallStats(opponent.id);
  const isPlayerWinner = winnerId === player.id;
  const winner = isPlayerWinner ? player : opponent;

  const rows = [
    { label: 'Final Score (Legs)', p1: `${p1Stats.legsWon}`, p2: `${p2Stats.legsWon}`, highlight: true },
    { label: '3-Dart Match Average', p1: `${p1Stats.average.toFixed(2)}`, p2: `${p2Stats.average.toFixed(2)}`, p1Num: p1Stats.average, p2Num: p2Stats.average },
    { label: 'Checkout Percentage', p1: `${p1Stats.checkoutPercentage}% (${p1Stats.doublesHit}/${p1Stats.doublesAttempted})`, p2: `${p2Stats.checkoutPercentage}% (${p2Stats.doublesHit}/${p2Stats.doublesAttempted})`, p1Num: p1Stats.checkoutPercentage, p2Num: p2Stats.checkoutPercentage },
    { label: 'Highest Checkout', p1: `${p1Stats.highestCheckout || '-'}`, p2: `${p2Stats.highestCheckout || '-'}`, p1Num: p1Stats.highestCheckout, p2Num: p2Stats.highestCheckout },
    { label: '180s Hit', p1: `${p1Stats.scores180}`, p2: `${p2Stats.scores180}`, p1Num: p1Stats.scores180, p2Num: p2Stats.scores180 },
    { label: '140+ Visits', p1: `${p1Stats.scores140Plus}`, p2: `${p2Stats.scores140Plus}`, p1Num: p1Stats.scores140Plus, p2Num: p2Stats.scores140Plus },
    { label: '100+ Visits', p1: `${p1Stats.scores100Plus}`, p2: `${p2Stats.scores100Plus}`, p1Num: p1Stats.scores100Plus, p2Num: p2Stats.scores100Plus },
    { label: 'Total Darts Thrown', p1: `${p1Stats.dartsThrown}`, p2: `${p2Stats.dartsThrown}` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Victory Header */}
        <div className="flex flex-col items-center gap-2 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-2xl shadow-inner">
            🏆
          </div>
          <h2 className="text-2xl font-black text-white">
            {winner.name} Wins!
          </h2>
          <p className="text-xs text-neutral-400">
            Televised Match Statistics & Box Score
          </p>
        </div>

        {/* Players Score Header */}
        <div className="grid grid-cols-2 gap-4 pb-2">
          <div className={`p-4 rounded-2xl border ${isPlayerWinner ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-neutral-950 border-neutral-800'}`}>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              {player.name}
            </span>
            <span className={`text-4xl font-mono font-black ${isPlayerWinner ? 'text-amber-400' : 'text-neutral-300'}`}>
              {p1Stats.legsWon}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${!isPlayerWinner ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-neutral-950 border-neutral-800'}`}>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              {opponent.name}
            </span>
            <span className={`text-4xl font-mono font-black ${!isPlayerWinner ? 'text-amber-400' : 'text-neutral-300'}`}>
              {p2Stats.legsWon}
            </span>
          </div>
        </div>

        {/* Stats Table */}
        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden text-xs">
          <div className="divide-y divide-neutral-900">
            {rows.map((row, idx) => {
              const isP1Better = row.p1Num !== undefined && row.p2Num !== undefined && row.p1Num > row.p2Num;
              const isP2Better = row.p1Num !== undefined && row.p2Num !== undefined && row.p2Num > row.p1Num;

              return (
                <div key={idx} className="grid grid-cols-7 py-2.5 px-4 items-center">
                  <div className={`col-span-2 text-right font-mono ${row.highlight ? 'font-black text-base text-amber-400' : isP1Better ? 'font-bold text-amber-300' : 'text-neutral-300'}`}>
                    {row.p1}
                  </div>
                  <div className="col-span-3 text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                    {row.label}
                  </div>
                  <div className={`col-span-2 text-left font-mono ${row.highlight ? 'font-black text-base text-amber-400' : isP2Better ? 'font-bold text-amber-300' : 'text-neutral-300'}`}>
                    {row.p2}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
          >
            <span>{isExhibition ? 'Return to Menu' : 'Continue to Tournament Bracket'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
