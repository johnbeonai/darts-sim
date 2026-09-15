import React, { useEffect, useState } from 'react';
import { Player } from '../../core/player/Player';
import { AudioManager } from '../../core/audio/AudioManager';
import { Swords, Trophy, Target, Flag, Flame, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { HeadToHeadRecord } from '../../core/rivalry/RivalryManager';

interface MatchWalkOnModalProps {
  player: Player;
  opponent: Player;
  tournamentName?: string;
  tournamentLocation?: string;
  bestOfLegs: number;
  bestOfSets?: number;
  legsPerSet?: number;
  isSetsFormat?: boolean;
  h2hRecord?: HeadToHeadRecord | null;
  onStartMatch: () => void;
}

export const MatchWalkOnModal: React.FC<MatchWalkOnModalProps> = ({
  player,
  opponent,
  tournamentName = 'Exhibition Match',
  tournamentLocation = 'The Oche Arena',
  bestOfLegs,
  bestOfSets,
  legsPerSet,
  isSetsFormat = false,
  h2hRecord,
  onStartMatch,
}) => {
  const isAllyPally =
    tournamentName.toLowerCase().includes('world darts') ||
    tournamentName.toLowerCase().includes('ally pally') ||
    tournamentLocation.toLowerCase().includes('alexandra palace');

  const [pyroActive, setPyroActive] = useState<boolean>(isAllyPally);
  const firstToLegs = Math.ceil(bestOfLegs / 2);
  const firstToSets = bestOfSets ? Math.ceil(bestOfSets / 2) : 0;

  useEffect(() => {
    AudioManager.playCrowdCheer(3.0);
    if (isAllyPally) {
      const pyroTimer = setInterval(() => {
        setPyroActive(prev => !prev);
      }, 700);
      return () => clearInterval(pyroTimer);
    }
  }, [isAllyPally]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Ambient background glow & lasers */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {isAllyPally && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Pulsing flame jets left & right */}
            <div className={`absolute bottom-4 left-4 transition-all duration-300 ${pyroActive ? 'scale-125 opacity-100' : 'scale-90 opacity-60'}`}>
              <div className="w-12 h-28 bg-gradient-to-t from-orange-600 via-amber-400 to-transparent rounded-full blur-sm animate-pulse" />
              <div className="text-xl -mt-6">🔥</div>
            </div>
            <div className={`absolute bottom-4 right-4 transition-all duration-300 ${pyroActive ? 'scale-125 opacity-100' : 'scale-90 opacity-60'}`}>
              <div className="w-12 h-28 bg-gradient-to-t from-orange-600 via-amber-400 to-transparent rounded-full blur-sm animate-pulse" />
              <div className="text-xl -mt-6">🔥</div>
            </div>
            {/* Arena laser beams */}
            <div className="absolute top-0 left-1/4 w-0.5 h-full bg-cyan-400/40 rotate-12 blur-[1px] animate-pulse" />
            <div className="absolute top-0 right-1/4 w-0.5 h-full bg-purple-400/40 -rotate-12 blur-[1px] animate-pulse" />
          </div>
        )}

        {/* Broadcast Header Badge */}
        <div className="flex flex-col items-center gap-1.5 border-b border-neutral-800 pb-4 relative z-10">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${
            isAllyPally
              ? 'bg-gradient-to-r from-purple-900/80 via-amber-900/80 to-purple-900/80 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/20'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{isAllyPally ? '👑 PDC WORLD DARTS CHAMPIONSHIP' : tournamentName}</span>
            {isAllyPally && <Sparkles className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-neutral-300 font-medium">
            {tournamentLocation} • {isSetsFormat && bestOfSets ? `First to ${firstToSets} Sets (Best of ${bestOfSets}) • ${legsPerSet || 3} Legs per Set` : `First to ${firstToLegs} Legs (Best of ${bestOfLegs})`}
          </p>
          {isAllyPally && (
            <div className="text-[11px] font-mono font-bold text-amber-400/90 tracking-wide pt-0.5">
              🎤 "Ladies and Gentlemen... LIVE from Alexandra Palace... LET'S PLAY DARTS!"
            </div>
          )}
        </div>

        {/* Walk-On Stage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4">
          {/* Player 1 Card */}
          <div className="sm:col-span-2 p-5 rounded-2xl bg-neutral-950/80 border border-amber-500/30 shadow-lg flex flex-col items-center space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-2xl shadow-inner">
              🎯
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{player.name}</h3>
              <p className="text-xs text-amber-400 font-semibold">{player.nationality}</p>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-neutral-800 font-mono">
                Scoring: {player.attributes.scoring}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 font-mono">
                Doubling: {player.attributes.doubling}
              </span>
            </div>
          </div>

          {/* VS Center Pillar */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center gap-1">
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shadow-md">
              <Swords className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-neutral-500">VS</span>
          </div>

          {/* Opponent Card */}
          <div className="sm:col-span-2 p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 shadow-lg flex flex-col items-center space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center justify-center font-black text-2xl shadow-inner">
              🎯
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{opponent.name}</h3>
              <p className="text-xs text-neutral-400 font-semibold">{opponent.nationality}</p>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-neutral-800 font-mono">
                Scoring: {opponent.attributes.scoring}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 font-mono">
                Doubling: {opponent.attributes.doubling}
              </span>
            </div>
          </div>
        </div>

        {/* Head-to-Head Sub-Banner */}
        {h2hRecord && h2hRecord.matchesPlayed > 0 && (
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between px-4">
            <span className="text-neutral-400 flex items-center gap-1.5 font-semibold">
              <Flame className="w-4 h-4 text-orange-400" />
              Head-to-Head History:
            </span>
            <span className="font-mono text-white font-bold">
              {h2hRecord.playerWins} Wins • {h2hRecord.opponentWins} Losses ({h2hRecord.matchesPlayed} Meetings)
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartMatch}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
          >
            <span>Step to the Oche</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
