import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../../core/player/Player';
import { Tournament, BracketMatch } from '../../core/tournament/Tournament';
import { Match } from '../../core/match/Match';
import { PerformancePipeline } from '../../core/simulation/PerformancePipeline';
import { Trophy, Zap, FastForward, CheckCircle, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FastSimMatchViewProps {
  bracketMatch: BracketMatch;
  humanPlayer: Player;
  tournament: Tournament;
  onFinishSimulation: () => void;
}

export const FastSimMatchView: React.FC<FastSimMatchViewProps> = ({
  bracketMatch,
  humanPlayer,
  tournament,
  onFinishSimulation,
}) => {
  const [match] = useState<Match>(() => {
    return new Match(
      bracketMatch.id,
      [bracketMatch.player1.id, bracketMatch.player2.id],
      tournament.config.format
    );
  });

  const [isFinished, setIsFinished] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('Match underway in fast-simulation...');
  const [currentP1Score, setCurrentP1Score] = useState(501);
  const [currentP2Score, setCurrentP2Score] = useState(501);
  const [legsWon, setLegsWon] = useState<Record<string, number>>({
    [bracketMatch.player1.id]: 0,
    [bracketMatch.player2.id]: 0
  });

  const pipelineRef = useRef(new PerformancePipeline());
  const timerRef = useRef<any>(null);

  const opponent = bracketMatch.player1.id === humanPlayer.id ? bracketMatch.player2 : bracketMatch.player1;

  // Function to simulate a single turn in fast forward
  const stepSimulation = () => {
    if (match.status === 'finished') {
      finishMatch();
      return;
    }

    const leg = match.currentLeg;
    const turnPid = leg.currentTurnPlayerId;
    const activePlayer = turnPid === bracketMatch.player1.id ? bracketMatch.player1 : bracketMatch.player2;
    const oppPlayer = turnPid === bracketMatch.player1.id ? bracketMatch.player2 : bracketMatch.player1;

    const visit = pipelineRef.current.simulateVisit(
      activePlayer,
      {
        remainingScore: leg.getRemainingScore(activePlayer.id),
        opponentRemaining: leg.getRemainingScore(oppPlayer.id)
      },
      leg.doubleOutRequired,
      leg.doubleInRequired,
      leg.hasDoubledIn.get(activePlayer.id) ?? !leg.doubleInRequired
    );

    if (visit.visitScore === 180) {
      setLastAnnouncement(`💥 180! ${activePlayer.name} hits maximum!`);
    } else if (visit.isLegWinning) {
      setLastAnnouncement(`🎯 Game shot! ${activePlayer.name} wins the leg!`);
    } else if (visit.isBust) {
      setLastAnnouncement(`${activePlayer.name} bust!`);
    } else {
      setLastAnnouncement(`${activePlayer.name} scored ${visit.visitScore}`);
    }

    const res = leg.addVisit(visit);
    if (res.legWon) {
      match.onLegCompleted(activePlayer.id);
    }

    // Update state for UI
    setCurrentP1Score(match.currentLeg.getRemainingScore(bracketMatch.player1.id));
    setCurrentP2Score(match.currentLeg.getRemainingScore(bracketMatch.player2.id));
    setLegsWon({
      [bracketMatch.player1.id]: match.legsWon.get(bracketMatch.player1.id) || 0,
      [bracketMatch.player2.id]: match.legsWon.get(bracketMatch.player2.id) || 0
    });

    if ((match.status as string) === 'finished') {
      finishMatch();
    }
  };

  const finishMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    bracketMatch.match = match;
    bracketMatch.isCompleted = true;
    bracketMatch.winner = match.winnerId === bracketMatch.player1.id ? bracketMatch.player1 : bracketMatch.player2;

    setIsFinished(true);

    if (bracketMatch.winner.id === humanPlayer.id) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setLastAnnouncement(`Victory! ${humanPlayer.name} wins the match!`);
    } else {
      setLastAnnouncement(`Match to ${opponent.name}.`);
    }
  };

  // Instant Skip: runs all remaining visits in 1ms
  const handleInstantSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    while (match.status !== 'finished') {
      const leg = match.currentLeg;
      const turnPid = leg.currentTurnPlayerId;
      const activePlayer = turnPid === bracketMatch.player1.id ? bracketMatch.player1 : bracketMatch.player2;
      const oppPlayer = turnPid === bracketMatch.player1.id ? bracketMatch.player2 : bracketMatch.player1;

      const visit = pipelineRef.current.simulateVisit(
        activePlayer,
        {
          remainingScore: leg.getRemainingScore(activePlayer.id),
          opponentRemaining: leg.getRemainingScore(oppPlayer.id)
        },
        leg.doubleOutRequired,
        leg.doubleInRequired,
        leg.hasDoubledIn.get(activePlayer.id) ?? !leg.doubleInRequired
      );

      const res = leg.addVisit(visit);
      if (res.legWon) {
        match.onLegCompleted(activePlayer.id);
      }
    }

    setCurrentP1Score(0);
    setCurrentP2Score(0);
    setLegsWon({
      [bracketMatch.player1.id]: match.legsWon.get(bracketMatch.player1.id) || 0,
      [bracketMatch.player2.id]: match.legsWon.get(bracketMatch.player2.id) || 0
    });

    finishMatch();
  };

  useEffect(() => {
    // Run simulation tick every 200ms
    timerRef.current = setInterval(() => {
      stepSimulation();
    }, 220);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match]);

  const p1Stats = match.getOverallStats(bracketMatch.player1.id);
  const p2Stats = match.getOverallStats(bracketMatch.player2.id);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in relative">
      {/* Pop Up In Front Modal when Finished */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden ring-1 ring-amber-500/30">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Winner Announcement Icon & Header */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
                🏆
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Match Concluded • {bracketMatch.roundName}
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight mt-1">
                {bracketMatch.winner?.name} Wins!
              </h2>
              <p className="text-xs text-neutral-400">
                {tournament.config.name}
              </p>
            </div>

            {/* Scorecard Callout */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950 rounded-2xl border border-neutral-800 relative z-10">
              {/* Player 1 */}
              <div
                className={`p-3 rounded-xl border ${
                  bracketMatch.winner?.id === bracketMatch.player1.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold truncate">{bracketMatch.player1.name}</div>
                {bracketMatch.player1.id === humanPlayer.id && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">YOU</span>
                )}
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {legsWon[bracketMatch.player1.id] || 0}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Avg: <span className="text-neutral-200 font-bold font-mono">{p1Stats.average.toFixed(1)}</span>
                </div>
              </div>

              {/* Player 2 */}
              <div
                className={`p-3 rounded-xl border ${
                  bracketMatch.winner?.id === bracketMatch.player2.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold truncate">{bracketMatch.player2.name}</div>
                {bracketMatch.player2.id === humanPlayer.id && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">YOU</span>
                )}
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {legsWon[bracketMatch.player2.id] || 0}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Avg: <span className="text-neutral-200 font-bold font-mono">{p2Stats.average.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* In Front Prominent Continue Button */}
            <div className="relative z-10 pt-1">
              <button
                type="button"
                autoFocus
                onClick={onFinishSimulation}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Continue to Tournament</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner with Instant Skip OR Top Winner Announcement */}
      <div
        className={`rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          isFinished
            ? 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-500/50 ring-1 ring-amber-500/30'
            : 'bg-neutral-900 border border-neutral-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            {isFinished ? (
              <Trophy className="w-4 h-4 text-amber-400 fill-current" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            <span>
              {isFinished ? 'Match Complete • Winner Announced' : `Fast Match Simulation • ${bracketMatch.roundName}`}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isFinished ? `🏆 ${bracketMatch.winner?.name} Won!` : tournament.config.name}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isFinished
              ? `Final Result: ${legsWon[bracketMatch.player1.id]} - ${legsWon[bracketMatch.player2.id]} Legs (${tournament.config.name})`
              : 'Statistical simulation running at 5x speed'}
          </p>
        </div>

        {isFinished ? (
          <button
            type="button"
            onClick={onFinishSimulation}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Continue to Tournament</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleInstantSkip}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <FastForward className="w-4 h-4 fill-current" />
            Instant Skip to End
          </button>
        )}
      </div>

      {/* Live Announcement Ticker */}
      <div
        className={`p-3 text-center rounded-2xl text-xs font-semibold border transition-colors ${
          isFinished
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
            : 'bg-neutral-900 border border-neutral-800 text-amber-300'
        }`}
      >
        {isFinished
          ? `🏆 MATCH RESULT: ${bracketMatch.winner?.name} advances! (${legsWon[bracketMatch.player1.id]} - ${legsWon[bracketMatch.player2.id]})`
          : lastAnnouncement}
      </div>

      {/* Dual Live Scoreboard Display */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="grid grid-cols-2 divide-x divide-neutral-800">
          {/* Player 1 */}
          <div className="px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-bold text-base text-white">{bracketMatch.player1.name}</span>
              {bracketMatch.player1.id === humanPlayer.id && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">YOU</span>
              )}
            </div>
            <div className="text-6xl font-mono font-black text-amber-400 py-4">
              {currentP1Score}
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-neutral-950 text-xs font-mono font-bold text-neutral-300 border border-neutral-800">
              Legs: {legsWon[bracketMatch.player1.id] || 0}
            </div>
            <div className="mt-4 text-xs text-neutral-400">
              Avg: <span className="font-mono text-white font-bold">{p1Stats.average}</span>
            </div>
          </div>

          {/* Player 2 */}
          <div className="px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-bold text-base text-white">{bracketMatch.player2.name}</span>
              {bracketMatch.player2.id === humanPlayer.id && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">YOU</span>
              )}
            </div>
            <div className="text-6xl font-mono font-black text-amber-400 py-4">
              {currentP2Score}
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-neutral-950 text-xs font-mono font-bold text-neutral-300 border border-neutral-800">
              Legs: {legsWon[bracketMatch.player2.id] || 0}
            </div>
            <div className="mt-4 text-xs text-neutral-400">
              Avg: <span className="font-mono text-white font-bold">{p2Stats.average}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
