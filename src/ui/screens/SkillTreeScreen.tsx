import React from 'react';
import { Player } from '../../core/player/Player';
import { PERK_DEFINITIONS, PerkId } from '../../core/player/SkillTree';
import { ArrowLeft, Star, Lock, Unlock } from 'lucide-react';

interface SkillTreeScreenProps {
  player: Player;
  onUnlockPerk: (perk: PerkId) => void;
  onBack: () => void;
}

export const SkillTreeScreen: React.FC<SkillTreeScreenProps> = ({ player, onUnlockPerk, onBack }) => {
  const perks = Object.values(PERK_DEFINITIONS);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="w-6 h-6 text-neutral-300" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Player Skill Tree</h1>
            <p className="text-sm text-neutral-400 font-medium">Unlock situational perks with Training XP.</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Available XP</div>
          <div className="text-3xl font-black text-white font-mono">{player.xp}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {perks.map(perk => {
          const isUnlocked = player.perks.includes(perk.id);
          const canAfford = player.xp >= perk.xpCost;

          return (
            <div key={perk.id} className={`p-6 rounded-2xl border-2 transition-all ${
              isUnlocked 
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : canAfford 
                  ? 'bg-neutral-900 border-emerald-500/30 hover:border-emerald-500/60' 
                  : 'bg-neutral-900 border-neutral-800 opacity-70'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isUnlocked ? <Unlock className="w-5 h-5 text-amber-400" /> : <Lock className="w-5 h-5 text-neutral-500" />}
                  <h3 className={`text-lg font-black uppercase ${isUnlocked ? 'text-amber-400' : 'text-white'}`}>
                    {perk.name}
                  </h3>
                </div>
                {!isUnlocked && (
                  <div className={`text-sm font-mono font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                    {perk.xpCost} XP
                  </div>
                )}
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                {perk.description}
              </p>
              
              {!isUnlocked && (
                <button
                  disabled={!canAfford}
                  onClick={() => onUnlockPerk(perk.id)}
                  className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors ${
                    canAfford 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Unlock Perk' : 'Not Enough XP'}
                </button>
              )}
              {isUnlocked && (
                <div className="w-full py-2.5 text-center text-amber-500 text-xs font-black uppercase tracking-wider">
                  Active
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
