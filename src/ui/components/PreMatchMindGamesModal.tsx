import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { HeadToHeadRecord } from '../../core/rivalry/RivalryManager';
import {
  MindGamesManager,
  MindGameStanceType,
  MindGameResult,
  MIND_GAME_STANCES
} from '../../core/rivalry/MindGamesManager';
import {
  Shield,
  Zap,
  Flame,
  Heart,
  Swords,
  Sparkles,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Users
} from 'lucide-react';

interface PreMatchMindGamesModalProps {
  player: Player;
  opponent: Player;
  tournamentName?: string;
  isRivalry?: boolean;
  h2hRecord?: HeadToHeadRecord | null;
  onConfirmStance: (stance: MindGameStanceType, result: MindGameResult) => void;
  onSkip: () => void;
}

export const PreMatchMindGamesModal: React.FC<PreMatchMindGamesModalProps> = ({
  player,
  opponent,
  tournamentName = 'PDC Tour Match',
  isRivalry = false,
  h2hRecord,
  onConfirmStance,
  onSkip
}) => {
  const [selectedStance, setSelectedStance] = useState<MindGameStanceType | null>(null);
  const [result, setResult] = useState<MindGameResult | null>(null);

  const stances = MindGamesManager.getAllStances();

  const handleSelectStance = (stanceType: MindGameStanceType) => {
    if (result) return; // already locked in
    setSelectedStance(stanceType);
    const res = MindGamesManager.applyStance(stanceType, player, opponent);
    setResult(res);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-emerald-400" />;
      default:
        return <Swords className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badges */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black tracking-widest uppercase mb-1">
            <Swords className="w-3.5 h-3.5" />
            <span>{isRivalry ? 'Fierce Rivalry Confrontation' : 'Backstage Tunnel Staredown'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pre-Match Psychological Stance
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Choose how you confront <span className="text-white font-bold">{opponent.name}</span> in the tunnel before stepping out to the stage lights.
          </p>
        </div>

        {/* Matchup strip */}
        <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between px-6">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">You</span>
            <span className="text-sm font-black text-white">{player.name}</span>
            <div className="text-[11px] text-amber-400 font-mono">Conf: {player.state.confidence}%</div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-neutral-600 uppercase">VS</span>
            {h2hRecord && (
              <span className="text-[10px] text-neutral-400 font-mono">
                {h2hRecord.playerWins}W - {h2hRecord.opponentWins}L
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Opponent</span>
            <span className="text-sm font-black text-white">{opponent.name}</span>
            <div className="text-[11px] text-cyan-400 font-mono">Conf: {opponent.state.confidence}%</div>
          </div>
        </div>

        {/* 4 Stance Selection Cards */}
        {!result ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {stances.map((stance) => (
              <button
                key={stance.id}
                type="button"
                onClick={() => handleSelectStance(stance.id)}
                className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-800/50 transition-all text-left space-y-2 group transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-amber-500/40">
                      {getIcon(stance.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                        {stance.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        {stance.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {stance.description}
                </p>

                <div className="pt-1 border-t border-neutral-800/80 text-[10px] space-y-0.5">
                  <div className="text-emerald-400 font-semibold">
                    • Player: {stance.playerEffectsSummary}
                  </div>
                  <div className="text-rose-400 font-semibold">
                    • Opponent: {stance.opponentEffectsSummary}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Stance Locked In Outcome */
          <div className="p-5 rounded-2xl bg-neutral-950/90 border border-amber-500/50 space-y-4 animate-fade-in text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                <CheckCircle2 className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                  Stance Executed
                </span>
                <h3 className="text-lg font-black text-white">{result.stance.title}</h3>
              </div>
            </div>

            <p className="text-xs text-neutral-300 italic border-l-2 border-amber-500 pl-3 leading-relaxed">
              "{result.dialogueNarrative}"
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Your Conf</span>
                <span className="font-mono font-bold text-emerald-400">
                  {result.playerConfidenceDelta >= 0 ? `+${result.playerConfidenceDelta}` : result.playerConfidenceDelta}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Opponent Conf</span>
                <span className="font-mono font-bold text-rose-400">
                  {result.opponentConfidenceDelta >= 0 ? `+${result.opponentConfidenceDelta}` : result.opponentConfidenceDelta}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Atmosphere</span>
                <span className="font-mono font-bold text-amber-300 text-[11px] truncate block">
                  {result.stance.crowdAtmosphere}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {!result ? (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-neutral-500 hover:text-neutral-300 font-semibold px-4 py-2 transition-colors"
            >
              Skip Mind Games (Standard Walk-On)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmStance(selectedStance!, result)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
            >
              <span>Proceed to Walk-On & Oche</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
