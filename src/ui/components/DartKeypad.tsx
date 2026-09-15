import React, { useState } from 'react';
import { DartResult } from '../../core/match/DartResult';
import { AudioManager } from '../../core/audio/AudioManager';
import { Player } from '../../core/player/Player';
import { PlayerFactory } from '../../core/player/PlayerFactory';
import { SettingsManager } from '../../core/config/SettingsManager';
import { PrecisionThrowOche } from './PrecisionThrowOche';
import { Delete, CheckCircle, Keyboard, Grid, Target } from 'lucide-react';

interface DartKeypadProps {
  onConfirmVisit: (darts: DartResult[]) => void;
  onQuickTotal: (total: number) => void;
  disabled?: boolean;
  player?: Player;
  suggestedCheckout?: string | null;
  isMatchDart?: boolean;
  isDecidingLeg?: boolean;
  pressureMultiplier?: number;
}

export const DartKeypad: React.FC<DartKeypadProps> = ({
  onConfirmVisit,
  onQuickTotal,
  disabled = false,
  player,
  suggestedCheckout,
  isMatchDart = false,
  isDecidingLeg = false,
  pressureMultiplier = 1.0,
}) => {
  const defaultMode = SettingsManager.getSettings().defaultEntryMode;
  const initialMode: 'virtual' | 'keypad' | 'quick' =
    defaultMode === 'precision_throw' ? 'virtual' : defaultMode;
  const [entryMode, setEntryMode] = useState<'virtual' | 'keypad' | 'quick'>(initialMode);
  const [currentDarts, setCurrentDarts] = useState<DartResult[]>([]);
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1);
  const [quickInput, setQuickInput] = useState<string>('');

  const activePlayer = player || new PlayerFactory().createPlayer({
    name: 'Player',
    gender: 'male',
    nationality: 'English',
    archetype: 'balanced',
  });

  const handleSegmentClick = (segment: number) => {
    if (currentDarts.length >= 3 || disabled) return;

    try {
      AudioManager.playDartThud();
      const dart = new DartResult('player', segment, multiplier, 'manual', true);
      const updated = [...currentDarts, dart];
      setCurrentDarts(updated);
      setMultiplier(1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMiss = () => {
    if (currentDarts.length >= 3 || disabled) return;
    AudioManager.playDartThud();
    const dart = DartResult.miss('player', 'manual');
    setCurrentDarts([...currentDarts, dart]);
    setMultiplier(1);
  };

  const handleUndo = () => {
    setCurrentDarts(currentDarts.slice(0, -1));
  };

  const handleConfirmVisit = () => {
    if (currentDarts.length > 0) {
      onConfirmVisit(currentDarts);
      setCurrentDarts([]);
      setMultiplier(1);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(quickInput, 10);
    if (!isNaN(val) && val >= 0 && val <= 180) {
      AudioManager.playDartThud();
      onQuickTotal(val);
      setQuickInput('');
    }
  };

  const visitTotal = currentDarts.reduce((sum, d) => sum + d.score, 0);

  return (
    <div className={`w-full ${entryMode === 'virtual' ? 'max-w-5xl' : 'max-w-4xl'} mx-auto bg-neutral-900/90 border border-neutral-800 rounded-3xl p-3 sm:p-4 shadow-xl`}>
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setEntryMode('virtual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${entryMode === 'virtual' ? 'bg-amber-500 text-black shadow-md' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            <Target className="w-3.5 h-3.5" />
            Virtual Oche (On-Screen Throw)
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('keypad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${entryMode === 'keypad' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            <Grid className="w-3.5 h-3.5" />
            Dart-by-Dart Keypad
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('quick')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${entryMode === 'quick' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Quick Visit Total
          </button>
        </div>

        {/* Live Visit Preview Tray for Keypad & Quick modes */}
        {entryMode !== 'virtual' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => {
                const dart = currentDarts[idx];
                return (
                  <div
                    key={idx}
                    className={`w-14 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm border transition-all ${dart ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-neutral-950 border-neutral-800 text-neutral-600'}`}
                  >
                    {dart ? dart.label : `Dart ${idx + 1}`}
                  </div>
                );
              })}
            </div>
            <div className="text-right pl-2 border-l border-neutral-800">
              <span className="text-xs text-neutral-500 block">Total</span>
              <span className="font-mono font-black text-xl text-white">{visitTotal}</span>
            </div>
            {currentDarts.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <Delete className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVisit}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-lg transition-all shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm ({visitTotal})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {entryMode === 'virtual' ? (
        <PrecisionThrowOche
          player={activePlayer}
          onConfirmVisit={onConfirmVisit}
          disabled={disabled}
          suggestedCheckout={suggestedCheckout}
          isMatchDart={isMatchDart}
          isDecidingLeg={isDecidingLeg}
          pressureMultiplier={pressureMultiplier}
        />
      ) : entryMode === 'quick' ? (
        <form onSubmit={handleQuickSubmit} className="max-w-md mx-auto py-6 text-center">
          <label className="block text-sm font-medium text-neutral-400 mb-3">
            Enter Total Visit Score (0 - 180)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="180"
              disabled={disabled}
              placeholder="e.g. 140, 100, 60"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-2xl font-mono text-center text-white"
              autoFocus
            />
            <button
              type="submit"
              disabled={disabled || quickInput === ''}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Submit
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4 text-xs text-neutral-500">
            <span>Common:</span>
            {[26, 60, 85, 100, 140, 180].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => {
                  AudioManager.playDartThud();
                  onQuickTotal(score);
                }}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md font-mono"
              >
                {score}
              </button>
            ))}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setMultiplier(1)}
              className={`py-2 rounded-xl text-sm font-bold border transition-all ${multiplier === 1 ? 'bg-neutral-200 text-neutral-950 border-white shadow-lg' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'}`}
            >
              Single
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setMultiplier(2)}
              className={`py-2 rounded-xl text-sm font-bold border transition-all ${multiplier === 2 ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'}`}
            >
              Double (x2)
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setMultiplier(3)}
              className={`py-2 rounded-xl text-sm font-bold border transition-all ${multiplier === 3 ? 'bg-rose-500 text-white border-rose-400 shadow-lg' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'}`}
            >
              Treble (x3)
            </button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((seg) => (
              <button
                key={seg}
                type="button"
                disabled={disabled || currentDarts.length >= 3}
                onClick={() => handleSegmentClick(seg)}
                className="h-12 bg-neutral-950 hover:bg-amber-500/20 active:scale-95 disabled:opacity-30 border border-neutral-800 hover:border-amber-500/50 rounded-xl font-mono font-bold text-lg text-neutral-200 transition-all flex items-center justify-center"
              >
                {seg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              disabled={disabled || currentDarts.length >= 3}
              onClick={() => handleSegmentClick(25)}
              className="py-2.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl text-emerald-300 font-bold text-sm transition-all"
            >
              Outer Bull (25)
            </button>
            <button
              type="button"
              disabled={disabled || currentDarts.length >= 3}
              onClick={() => {
                setMultiplier(2);
                handleSegmentClick(25);
              }}
              className="py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 rounded-xl text-rose-300 font-bold text-sm transition-all"
            >
              D-Bull (50)
            </button>
            <button
              type="button"
              disabled={disabled || currentDarts.length >= 3}
              onClick={handleMiss}
              className="py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-400 font-bold text-sm transition-all"
            >
              Miss (0)
            </button>
            <button
              type="button"
              disabled={currentDarts.length === 0}
              onClick={handleUndo}
              className="py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-xl text-neutral-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Delete className="w-4 h-4" />
              Undo
            </button>
            <button
              type="button"
              disabled={currentDarts.length === 0}
              onClick={handleConfirmVisit}
              className="py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 sm:col-span-1 col-span-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm ({visitTotal})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
