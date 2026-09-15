import React, { useMemo } from 'react';
import { Player } from '../../core/player/Player';
import { Leg } from '../../core/match/Leg';
import { Match } from '../../core/match/Match';
import { CheckoutTable } from '../../core/match/CheckoutTable';
import { Target, Trophy, Award, Zap, Flame, Sparkles } from 'lucide-react';
import { BroadcastDartboard } from './BroadcastDartboard';
import { DartCoordinates } from '../../core/match/DartCoordinates';

import { Visit } from '../../core/match/Visit';

interface ScoreboardProps {
  player: Player;
  opponent: Player;
  currentLeg: Leg;
  match?: Match | null;
  legsWon: Record<string, number>;
  bestOfLegs: number;
  tournamentName?: string;
  is2Player?: boolean;
  lastVisit?: Visit;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  player,
  opponent,
  currentLeg,
  match,
  legsWon,
  bestOfLegs,
  tournamentName = 'Exhibition Match',
  is2Player = false,
  lastVisit
}) => {
  const playerScore = currentLeg.getRemainingScore(player.id);
  const opponentScore = currentLeg.getRemainingScore(opponent.id);
  const isPlayerTurn = currentLeg.currentTurnPlayerId === player.id;

  const playerLegStats = currentLeg.getPlayerStats(player.id);
  const opponentLegStats = currentLeg.getPlayerStats(opponent.id);

  const cpuDartCoords = useMemo(() => {
    if (lastVisit && lastVisit.playerId === opponent.id) {
      return lastVisit.darts.map(d => DartCoordinates.getCoordinateForDart(d));
    }
    return [];
  }, [lastVisit, opponent.id]);

  const playerOverallStats = match ? match.getOverallStats(player.id) : null;
  const opponentOverallStats = match ? match.getOverallStats(opponent.id) : null;

  const playerCheckout = CheckoutTable.getRoute(playerScore);
  const opponentCheckout = CheckoutTable.getRoute(opponentScore);

  const firstToLegs = Math.ceil(bestOfLegs / 2);
  const legNumber = currentLeg.id.split('-').pop() || '1';

  // Sets format calculations
  const isSetsFormat = match?.format.type === 'sets';
  const bestOfSets = match?.format.bestOfSets || 3;
  const setsNeeded = Math.ceil(bestOfSets / 2);
  const legsPerSet = match?.format.legsPerSet || 3;

  const p1Sets = match?.setsWon.get(player.id) || 0;
  const p2Sets = match?.setsWon.get(opponent.id) || 0;
  const p1LegsInSet = match?.legsWon.get(player.id) || (legsWon[player.id] || 0);
  const p2LegsInSet = match?.legsWon.get(opponent.id) || (legsWon[opponent.id] || 0);

  const isAllyPally =
    tournamentName.toLowerCase().includes('world darts') ||
    tournamentName.toLowerCase().includes('ally pally') ||
    tournamentName.toLowerCase().includes('alexandra palace');

  // Dart counters for current leg
  const activeTurnPlayer = isPlayerTurn ? player : opponent;
  const activeTurnDarts = isPlayerTurn ? playerLegStats.dartsThrown : opponentLegStats.dartsThrown;
  const activeRemainingScore = isPlayerTurn ? playerScore : opponentScore;

  // Potential 9-darter detection
  const isNineDarterPotential = activeTurnDarts === 6 && activeRemainingScore <= 141;

  const p1Avg = playerOverallStats ? playerOverallStats.average.toFixed(2) : playerLegStats.average.toFixed(2);
  const p2Avg = opponentOverallStats ? opponentOverallStats.average.toFixed(2) : opponentLegStats.average.toFixed(2);

  const p1180s = playerOverallStats ? playerOverallStats.scores180 : playerLegStats.scores180;
  const p2180s = opponentOverallStats ? opponentOverallStats.scores180 : opponentLegStats.scores180;

  const p1DoublePct = playerOverallStats && playerOverallStats.doublesAttempted > 0
    ? `${playerOverallStats.checkoutPercentage}% (${playerOverallStats.doublesHit}/${playerOverallStats.doublesAttempted})`
    : playerLegStats.checkoutPercentage > 0
    ? `${playerLegStats.checkoutPercentage}%`
    : '0%';

  const p2DoublePct = opponentOverallStats && opponentOverallStats.doublesAttempted > 0
    ? `${opponentOverallStats.checkoutPercentage}% (${opponentOverallStats.doublesHit}/${opponentOverallStats.doublesAttempted})`
    : opponentLegStats.checkoutPercentage > 0
    ? `${opponentLegStats.checkoutPercentage}%`
    : '0%';

  const isDoubleInLeg = Boolean(currentLeg.doubleInRequired || match?.format.doubleInRequired);
  const p1HasDoubledIn = currentLeg.hasDoubledIn.get(player.id) ?? !isDoubleInLeg;
  const p2HasDoubledIn = currentLeg.hasDoubledIn.get(opponent.id) ?? !isDoubleInLeg;

  const isTieBreakActive = match?.isTieBreakActive() || false;
  const legsNeededMap = match ? match.getRequiredLegsToWin() : null;
  const p1Target = legsNeededMap ? legsNeededMap[player.id] : firstToLegs;
  const p2Target = legsNeededMap ? legsNeededMap[opponent.id] : firstToLegs;

  const p1HighFinish = playerOverallStats?.highestCheckout || playerLegStats.highestCheckout;
  const p2HighFinish = opponentOverallStats?.highestCheckout || opponentLegStats.highestCheckout;

  // Crucial Dart Detection
  const isP1SetDart = isSetsFormat && p1LegsInSet + 1 >= legsPerSet && playerScore <= 170;
  const isP2SetDart = isSetsFormat && p2LegsInSet + 1 >= legsPerSet && opponentScore <= 170;
  const isP1MatchDart = isSetsFormat
    ? (p1Sets + 1 >= setsNeeded && isP1SetDart)
    : ((legsWon[player.id] || 0) + 1 >= p1Target && playerScore <= 170);
  const isP2MatchDart = isSetsFormat
    ? (p2Sets + 1 >= setsNeeded && isP2SetDart)
    : ((legsWon[opponent.id] || 0) + 1 >= p2Target && opponentScore <= 170);

  const isMatchDart = isPlayerTurn ? isP1MatchDart : isP2MatchDart;
  const isSetDart = isSetsFormat && !isMatchDart && (isPlayerTurn ? isP1SetDart : isP2SetDart);

  return (
    <div className="w-full max-w-5xl mx-auto mb-2 bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-slate-200">
      {/* Televised Broadcast Top Header Banner */}
      <div className={`px-3 py-1.5 border-b border-neutral-800 flex flex-wrap items-center justify-between text-xs uppercase tracking-wider text-neutral-400 gap-2 ${
        isAllyPally
          ? 'bg-gradient-to-r from-purple-950/80 via-neutral-900 to-amber-950/80 border-b-amber-500/30'
          : 'bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          {isAllyPally ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
              <span>👑 ALLY PALLY</span>
            </span>
          ) : (
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          )}

          <span className="font-black text-white text-[11px] sm:text-xs">{tournamentName}</span>
          <span className="text-neutral-600">•</span>

          {isSetsFormat ? (
            <span className="text-amber-400 font-bold text-[11px]">
              First to {setsNeeded} Sets (Best of {bestOfSets}) • {legsPerSet} Legs / Set
            </span>
          ) : (
            <span className="text-amber-400 font-bold text-[11px]">
              First to {firstToLegs} (Best of {bestOfLegs})
            </span>
          )}

          {isDoubleInLeg && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[9px] font-black tracking-widest">
              Double-In
            </span>
          )}
          {isTieBreakActive && (
            <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[9px] font-black tracking-widest animate-pulse">
              ⚡ Overtime: 2 Clear Legs
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isNineDarterPotential && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-400" />
              9-Darter!
            </span>
          )}
          {isSetsFormat && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-[10px]">
              Set {p1Sets + p2Sets + 1}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono font-bold text-[10px]">
            Leg {legNumber}
          </span>
          <span className="text-[10px] font-mono text-neutral-400">
            Dart {activeTurnDarts + 1}
          </span>
        </div>
      </div>

      {/* Main Dual Player Columns - Compact High-Density View */}
      <div className="grid grid-cols-2 divide-x divide-neutral-800">
        {/* Player 1 Column */}
        <div className={`p-2 sm:p-3 transition-all duration-200 ${isPlayerTurn ? 'bg-amber-500/5 ring-1 ring-inset ring-amber-500/30' : 'opacity-85'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base text-white tracking-wide">{player.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                  is2Player
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {is2Player ? 'P1' : 'YOU'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">{player.nationality}</p>
            </div>

            {/* Score Counters: Sets & Legs Badges */}
            <div className="flex items-center gap-1.5">
              {isSetsFormat ? (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg text-center" title="Sets Won">
                    <span className="text-[9px] font-bold text-amber-400/80 block uppercase tracking-wider">Sets</span>
                    <span className="font-mono font-black text-sm text-amber-300 leading-none">{p1Sets}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded-lg text-center" title="Legs in Current Set">
                    <span className="text-[9px] font-bold text-neutral-500 block uppercase tracking-wider">Legs</span>
                    <span className="font-mono font-black text-sm text-emerald-400 leading-none">{p1LegsInSet}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 bg-neutral-950 px-2.5 py-1 rounded-xl border border-neutral-800 shadow-inner">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono font-black text-sm text-amber-400">{legsWon[player.id] || 0}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">/ {p1Target}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Remaining Score & Checkout */}
          <div className="my-1 flex items-center justify-between">
            <div className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${isPlayerTurn ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'text-neutral-200'}`}>
              {playerScore}
            </div>

            <div className="text-right space-y-0.5">
              {isDoubleInLeg && !p1HasDoubledIn && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[9px] font-black uppercase">
                  D-In Needed
                </span>
              )}
              {playerCheckout && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                  <Target className="w-3 h-3 text-amber-400" />
                  <span>OUT: {playerCheckout.join(' ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ultra-compact Broadcast Performance Stats */}
          <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-neutral-800/80 text-center text-[10px]">
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-amber-400 font-black block text-xs">{p1Avg}</span>
              <span className="text-[9px] text-neutral-500 uppercase">Avg</span>
            </div>
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-neutral-200 font-black block text-xs">{p1180s}</span>
              <span className="text-[9px] text-neutral-500 uppercase">180s</span>
            </div>
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-neutral-200 font-bold block truncate">{p1DoublePct.split(' ')[0]}</span>
              <span className="text-[9px] text-neutral-500 uppercase">Dbl %</span>
            </div>
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-neutral-200 font-bold block">{p1HighFinish || '-'}</span>
              <span className="text-[9px] text-neutral-500 uppercase">Hi Out</span>
            </div>
          </div>
        </div>

        {/* Player 2 / Opponent Column */}
        <div className={`p-2 sm:p-3 transition-all duration-200 ${!isPlayerTurn ? 'bg-amber-500/5 ring-1 ring-inset ring-amber-500/30' : 'opacity-85'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base text-white tracking-wide">{opponent.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                  is2Player
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}>
                  {is2Player ? 'P2' : 'OPP'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">{opponent.nationality}</p>
            </div>

            {/* Score Counters: Sets & Legs Badges */}
            <div className="flex items-center gap-1.5">
              {isSetsFormat ? (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg text-center" title="Sets Won">
                    <span className="text-[9px] font-bold text-amber-400/80 block uppercase tracking-wider">Sets</span>
                    <span className="font-mono font-black text-sm text-amber-300 leading-none">{p2Sets}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded-lg text-center" title="Legs in Current Set">
                    <span className="text-[9px] font-bold text-neutral-500 block uppercase tracking-wider">Legs</span>
                    <span className="font-mono font-black text-sm text-emerald-400 leading-none">{p2LegsInSet}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 bg-neutral-950 px-2.5 py-1 rounded-xl border border-neutral-800 shadow-inner">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono font-black text-sm text-amber-400">{legsWon[opponent.id] || 0}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">/ {p2Target}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Remaining Score & Checkout */}
          <div className="my-1 flex items-center justify-between">
            <div className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${!isPlayerTurn ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'text-neutral-200'}`}>
              {opponentScore}
            </div>

            <div className="text-right space-y-0.5">
              {isDoubleInLeg && !p2HasDoubledIn && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[9px] font-black uppercase">
                  D-In Needed
                </span>
              )}
              {opponentCheckout && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                  <Target className="w-3 h-3 text-amber-400" />
                  <span>OUT: {opponentCheckout.join(' ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ultra-compact Broadcast Performance Stats */}
          <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-neutral-800/80 text-center text-[10px]">
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-amber-400 font-black block text-xs">{p2Avg}</span>
              <span className="text-[9px] text-neutral-500 uppercase">Avg</span>
            </div>
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-neutral-200 font-black block text-xs">{p2180s}</span>
              <span className="text-[9px] text-neutral-500 uppercase">180s</span>
            </div>
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-neutral-200 font-bold block truncate">{p2DoublePct.split(' ')[0]}</span>
              <span className="text-[9px] text-neutral-500 uppercase">Dbl %</span>
            </div>
            <div className="bg-neutral-950/60 py-1 px-0.5 rounded-lg border border-neutral-800/60">
              <span className="font-mono text-neutral-200 font-bold block">{p2HighFinish || '-'}</span>
              <span className="text-[9px] text-neutral-500 uppercase">Hi Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Televised PDC Broadcast Lower-Third Checkout Banner */}
      {(() => {
        const activeCheckout = isPlayerTurn ? playerCheckout : opponentCheckout;
        const activeScore = isPlayerTurn ? playerScore : opponentScore;

        if (!activeCheckout && !isMatchDart && !isSetDart) return null;

        return (
          <div
            className={`border-t px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 transition-all ${
              isMatchDart
                ? 'bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border-amber-500/50 shadow-lg shadow-amber-500/10'
                : isSetDart
                ? 'bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-emerald-950/80 border-emerald-500/40'
                : 'bg-neutral-950 border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {isMatchDart ? (
                <div className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <Trophy className="w-3 h-3" />
                  <span>Match Dart</span>
                </div>
              ) : isSetDart ? (
                <div className="flex items-center gap-1 bg-emerald-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <Award className="w-3 h-3" />
                  <span>Set Dart</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-neutral-800 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Target className="w-3 h-3" />
                  <span>On A Finish</span>
                </div>
              )}

              <span className="text-xs font-bold text-slate-200">
                <span className="text-amber-400 font-black">{activeTurnPlayer.name}</span> requires{' '}
                <span className="font-mono font-black text-white text-xs sm:text-sm">{activeScore}</span>
              </span>
            </div>

            {activeCheckout && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mr-0.5">
                  Route:
                </span>
                {activeCheckout.map((segment, idx) => {
                  const isTreble = segment.startsWith('T');
                  const isDouble = segment.startsWith('D');
                  const isBull = segment.toLowerCase().includes('bull');

                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={`font-mono text-xs font-black px-1.5 py-0.5 rounded border shadow-sm ${
                          isTreble
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : isDouble
                            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-400/30'
                            : isBull
                            ? 'bg-rose-500/25 text-rose-300 border-rose-500/50'
                            : 'bg-neutral-800 text-neutral-200 border-neutral-700'
                        }`}
                      >
                        {segment}
                      </span>
                      {idx < activeCheckout.length - 1 && (
                        <span className="text-neutral-500 text-[10px] font-bold">➔</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
