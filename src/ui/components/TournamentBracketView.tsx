import React from 'react';
import { Tournament, BracketMatch } from '../../core/tournament/Tournament';
import { Player } from '../../core/player/Player';
import { Trophy, Swords, Zap, Users, ArrowRight } from 'lucide-react';

interface TournamentBracketViewProps {
  tournament: Tournament;
  humanPlayer: Player;
  secondPlayer?: Player | null;
  allPlayers?: Player[];
  onPlayHybridMatch: (match: BracketMatch) => void;
  onSimulateMatch: (match: BracketMatch) => void;
  onLeaveTournament: () => void;
}

export const TournamentBracketView: React.FC<TournamentBracketViewProps> = ({
  tournament,
  humanPlayer,
  secondPlayer,
  allPlayers,
  onPlayHybridMatch,
  onSimulateMatch,
  onLeaveTournament,
}) => {
  // Only include human players that actually joined this tournament's bracket
  const candidateHumans = allPlayers && allPlayers.length > 0
    ? allPlayers
    : [humanPlayer, secondPlayer].filter((p): p is Player => Boolean(p));
  const uniqueHumans = Array.from(new Map(candidateHumans.map(p => [p.id, p])).values());
  const humanPlayers = uniqueHumans.filter(p => tournament.participants.some(tp => tp.id === p.id));
  const humanPlayerIds = humanPlayers.map(p => p.id);
  const isSharedEvent = humanPlayers.length > 1;

  const currentMatches = tournament.getCurrentRoundMatches();
  const pendingHumanMatches = tournament.getPendingHumanMatches(humanPlayerIds);

  // Check if all participating human players are eliminated from the tournament
  const allHumanPlayersEliminated = humanPlayers.length > 0 && humanPlayers.every(hp => {
    // Check if player lost in any completed match
    for (const round of tournament.rounds) {
      for (const m of round) {
        if (m.isCompleted && (m.player1.id === hp.id || m.player2.id === hp.id) && m.winner?.id !== hp.id) {
          return true;
        }
      }
    }
    // Or if not present in current round matches (and not champion)
    if (!tournament.isCompleted) {
      const inCurrent = currentMatches.some(m => m.player1.id === hp.id || m.player2.id === hp.id);
      return !inCurrent;
    }
    return tournament.winner?.id !== hp.id;
  });

  return (
    <div className="w-full max-w-5xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
      {/* Tournament Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4" />
            <span>Knockout Bracket • {tournament.config.tier.toUpperCase()}</span>
            {isSharedEvent && (
              <span className="ml-2 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Users className="w-3 h-3" />
                2-Player Shared Event
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black text-white">{tournament.config.name}</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {tournament.config.location} • Winner Prize: <strong className="text-emerald-400 font-mono">£{tournament.config.prizePool.winner}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {tournament.isCompleted ? (
            <button
              type="button"
              onClick={onLeaveTournament}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider"
            >
              Collect Rewards & Return
            </button>
          ) : allHumanPlayersEliminated ? (
            <button
              type="button"
              onClick={onLeaveTournament}
              className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl transition-all"
            >
              Tournament Concluded (Exit)
            </button>
          ) : null}
        </div>
      </div>

      {/* Tournament Status Alert */}
      {tournament.isCompleted && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-lg">
              🏆
            </div>
            <div>
              <span className="font-bold text-white text-base">Tournament Completed!</span>
              <p className="text-xs text-amber-300">
                Champion: <strong>{tournament.winner?.name}</strong>
              </p>
            </div>
          </div>
          <span className="font-mono font-bold text-amber-400 text-lg">
            £{tournament.config.prizePool.winner}
          </span>
        </div>
      )}

      {/* Pending Human Action Cards */}
      {!tournament.isCompleted && pendingHumanMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Pending Matches in Current Round
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingHumanMatches.map((m) => {
              const isH2H = tournament.isHeadToHead(m, humanPlayerIds);
              const activeHuman = humanPlayers.find(p => p.id === m.player1.id || p.id === m.player2.id);
              const opponent = activeHuman?.id === m.player1.id ? m.player2 : m.player1;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-lg ${
                    isH2H
                      ? 'bg-purple-950/20 border-purple-500/50 text-white'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                        {m.roundName}
                      </span>
                      {isH2H && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          ⚔️ Head-to-Head Clash
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white flex items-center gap-2">
                      <span className={humanPlayerIds.includes(m.player1.id) ? 'text-amber-400' : 'text-neutral-300'}>
                        {m.player1.name}
                      </span>
                      <span className="text-xs text-neutral-500 font-normal">vs</span>
                      <span className={humanPlayerIds.includes(m.player2.id) ? 'text-amber-400' : 'text-neutral-300'}>
                        {m.player2.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onPlayHybridMatch(m)}
                      className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <Swords className="w-4 h-4" />
                      <span>{isH2H ? 'Play Head-to-Head' : `Play (${activeHuman?.name.split(' ')[0]})`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSimulateMatch(m)}
                      className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 border border-neutral-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
                      title="Simulate this match"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sim</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Rounds Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {tournament.rounds.map((round, rIdx) => (
          <div key={rIdx} className="space-y-3">
            <div className="text-center pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {rIdx === 0 ? 'Quarter-Finals' : rIdx === 1 ? 'Semi-Finals' : 'Grand Final'}
              </span>
            </div>

            <div className="space-y-3">
              {round.map((match) => {
                const isHumanP1 = humanPlayerIds.includes(match.player1.id);
                const isHumanP2 = humanPlayerIds.includes(match.player2.id);
                const isCurrentRound = rIdx === tournament.currentRoundIndex;

                return (
                  <div
                    key={match.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      match.isCompleted
                        ? 'bg-neutral-950/60 border-neutral-800/80 opacity-90'
                        : isCurrentRound
                        ? 'bg-neutral-950 border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg'
                        : 'bg-neutral-950/30 border-neutral-800/40 opacity-50'
                    }`}
                  >
                    {/* Player 1 Row */}
                    <div className="flex items-center justify-between py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isHumanP1 ? 'bg-amber-400' : 'bg-neutral-600'}`} />
                        <span className={`font-semibold ${match.winner?.id === match.player1.id ? 'text-amber-400 font-bold' : isHumanP1 ? 'text-amber-200' : 'text-neutral-300'}`}>
                          {match.player1.name}
                        </span>
                      </div>
                      {match.isCompleted && match.winner?.id === match.player1.id && (
                        <span className="text-[10px] text-amber-400 font-bold uppercase">WIN</span>
                      )}
                    </div>

                    <div className="border-t border-neutral-800/60 my-1" />

                    {/* Player 2 Row */}
                    <div className="flex items-center justify-between py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isHumanP2 ? 'bg-amber-400' : 'bg-neutral-600'}`} />
                        <span className={`font-semibold ${match.winner?.id === match.player2.id ? 'text-amber-400 font-bold' : isHumanP2 ? 'text-amber-200' : 'text-neutral-300'}`}>
                          {match.player2.name}
                        </span>
                      </div>
                      {match.isCompleted && match.winner?.id === match.player2.id && (
                        <span className="text-[10px] text-amber-400 font-bold uppercase">WIN</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
