import React from 'react';
import { Target, Play, FolderOpen, Swords, Trophy, ShieldCheck, Settings } from 'lucide-react';
import { SaveManager } from '../../storage/SaveManager';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onSingleMatch: () => void;
  onOpenPractice: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onContinue,
  onSingleMatch,
  onOpenPractice,
  onOpenSettings,
}) => {
  const slots = SaveManager.listSlots();
  const activeCount = slots.filter(s => s.exists).length;

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-10 text-center animate-fade-in">
      {/* Brand Hero */}
      <div className="mb-10">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-2xl shadow-amber-500/30 ring-1 ring-amber-300/40">
          <Target className="w-11 h-11 text-neutral-950 stroke-[2.5]" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase font-sans">
          DARTS CAREER SIM
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
          The definitive professional darts simulation. Play full careers with real-dart hybrid scoring or fast statistical simulation.
        </p>
      </div>

      {/* Main Menu Action Buttons */}
      <div className="space-y-3.5 max-w-md mx-auto">
        {/* Continue Career / Select Save Slot */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 fill-current" />
            <span>Select Game Save</span>
          </div>
          {activeCount > 0 ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-950/20 text-neutral-950 font-mono font-bold">
              {activeCount} {activeCount === 1 ? 'Active Save' : 'Active Saves'}
            </span>
          ) : (
            <span className="text-xs text-neutral-950/60 font-medium">4 Empty Slots</span>
          )}
        </button>

        {/* New Career (Solo or 2-Player) */}
        <button
          type="button"
          onClick={onNewGame}
          className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-white font-bold text-base uppercase tracking-wider rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-amber-400 fill-current" />
            <span>New Career</span>
          </div>
          <span className="text-xs text-amber-400 font-bold">Solo or 2-Player</span>
        </button>

        {/* Single Match Exhibition */}
        <button
          type="button"
          onClick={onSingleMatch}
          className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-blue-500/50 text-white font-bold text-base uppercase tracking-wider rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Swords className="w-5 h-5 text-blue-400" />
            <span>Single Match</span>
          </div>
          <span className="text-xs text-neutral-500 font-normal">CPU, Calibration, 2P</span>
        </button>

        {/* Practice Oche & Mini-Games */}
        <button
          type="button"
          onClick={onOpenPractice}
          className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 text-white font-bold text-base uppercase tracking-wider rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>Practice Oche & Mini-Games</span>
          </div>
          <span className="text-xs text-emerald-400 font-bold">Around the Clock, Cricket, 121, Shanghai</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full py-3.5 px-6 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-semibold text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Game Settings</span>
          </div>
          <span className="text-xs text-neutral-500 font-normal">Audio & Keypad</span>
        </button>
      </div>

      {/* Feature Badges Footer */}
      <div className="mt-12 pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>4 Offline Save Slots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-amber-400" />
          <span>Hybrid + Sim Modes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>180 Audio & Calibration</span>
        </div>
      </div>
    </div>
  );
};
