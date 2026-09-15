import React, { useState, useMemo } from 'react';
import { MatchController, MatchStateEvent } from '../../application/MatchController';
import { CheckoutTable } from '../../core/match/CheckoutTable';
import { DartResult } from '../../core/match/DartResult';
import { Visit } from '../../core/match/Visit';
import { AudioManager } from '../../core/audio/AudioManager';
import { Target, Zap, RotateCcw, Volume2, ArrowLeft, Trophy, Crown, Sparkles, Check, Delete } from 'lucide-react';
import { BroadcastDartboard } from '../components/BroadcastDartboard';
import { DartCoordinates } from '../../core/match/DartCoordinates';

interface HybridMatchScreenProps {
  controller: MatchController;
  matchState: MatchStateEvent;
  tournamentName?: string;
  onExitMatch: () => void;
}

export const HybridMatchScreen: React.FC<HybridMatchScreenProps> = ({
  controller,
  matchState,
  tournamentName = 'Physical Oche Companion Mode',
  onExitMatch
}) => {
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [entryMode, setEntryMode] = useState<'quick_total' | 'dart_by_dart'>('quick_total');
  const [selectedDarts, setSelectedDarts] = useState<DartResult[]>([]);
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1);

  const match = controller.match;
  const leg = match.currentLeg;
  const isMyTurn = matchState.isPlayerTurn;
  const isP1Turn = matchState.currentTurnPlayerId === controller.player.id;
  const activePlayerId = matchState.currentTurnPlayerId;
  const activePlayer = activePlayerId === controller.player.id ? controller.player : controller.opponent;

  const playerScore = leg.getRemainingScore(activePlayerId);
  const oppScore = leg.getRemainingScore(controller.opponent.id);

  const p1Legs = matchState.legsWon[controller.player.id] || 0;
  const p2Legs = matchState.legsWon[controller.opponent.id] || 0;
  const p1Sets = match.setsWon.get(controller.player.id) || 0;
  const p2Sets = match.setsWon.get(controller.opponent.id) || 0;

  const isSets = match.format.type === 'sets';
  const checkoutRoute = CheckoutTable.getRoute(playerScore);

  const cpuDartCoords = useMemo(() => {
    if (matchState.lastVisit?.playerId === controller.opponent.id) {
      return matchState.lastVisit.darts.map(d => DartCoordinates.getCoordinateForDart(d));
    }
    return [];
  }, [matchState.lastVisit, controller.opponent.id]);

  // Common quick total presets
  const quickPresets = [180, 140, 100, 85, 81, 60, 45, 41, 26];

  const handleQuickPreset = (total: number) => {
    if (!isMyTurn || controller.status === 'match_completed') return;
    const visit = Visit.fromTotal(activePlayerId, playerScore, total);
    controller.processPlayerVisit(visit);
  };

  const handleKeypadDigit = (digit: string) => {
    if (keypadInput.length >= 3) return;
    const nextVal = keypadInput + digit;
    const num = parseInt(nextVal, 10);
    if (num <= 180) {
      setKeypadInput(nextVal);
    }
  };

  const handleKeypadBackspace = () => {
    setKeypadInput(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setKeypadInput('');
  };

  const handleKeypadSubmit = () => {
    if (!isMyTurn || !keypadInput) return;
    const total = parseInt(keypadInput, 10);
    if (isNaN(total) || total < 0 || total > 180) return;

    const visit = Visit.fromTotal(activePlayerId, playerScore, total);
    controller.processPlayerVisit(visit);
    setKeypadInput('');
  };

  const handleBust = () => {
    if (!isMyTurn) return;
    const visit = Visit.fromTotal(activePlayerId, playerScore, 0);
    visit.isBust = true;
    visit.scoreAfter = playerScore;
    controller.processPlayerVisit(visit);
  };

  // Single-dart click handlers for dart-by-dart entry
  const handleDartSegmentClick = (segment: number) => {
    if (selectedDarts.length >= 3) return;
    try {
      const dart = new DartResult(activePlayerId, segment, multiplier);
      const newDarts = [...selectedDarts, dart];
      setSelectedDarts(newDarts);
      setMultiplier(1); // Reset to single

      if (newDarts.length === 3) {
        const visit = new Visit(activePlayerId, playerScore, newDarts);
        controller.processPlayerVisit(visit);
        setSelectedDarts([]);
      }
    } catch (e) {
      console.warn('Invalid dart', e);
    }
  };

  const handleUndoDart = () => {
    setSelectedDarts(prev => prev.slice(0, -1));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-fade-in pb-12">
      {/* Top Status & Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                REAL DARTBOARD COMPANION
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                LIVE
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{tournamentName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Entry Mode Toggle */}
          <div className="p-1 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setEntryMode('quick_total')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                entryMode === 'quick_total' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Quick Visit Total
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('dart_by_dart')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                entryMode === 'dart_by_dart' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dart by Dart
            </button>
          </div>

          <button
            type="button"
            onClick={onExitMatch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Match</span>
          </button>
        </div>
      </div>

      {/* Main Oche Broadcast Scoreboard: High-visibility for 8ft viewing */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 Card (Human) */}
        <div className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
          isP1Turn
            ? 'bg-slate-900/90 border-amber-500 shadow-2xl shadow-amber-500/10'
            : 'bg-neutral-900/60 border-neutral-800 opacity-80'
        }`}>
          {isP1Turn && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
              <span>AT THE OCHE</span>
            </div>
          )}

          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase mb-1">
            <span>{controller.player.name}</span>
            <div className="flex items-center gap-2">
              {isSets && <span className="text-amber-400">Sets: {p1Sets}</span>}
              <span className="text-white">Legs: {p1Legs}</span>
            </div>
          </div>

          <div className="text-6xl sm:text-7xl font-black text-amber-400 font-mono tracking-tight my-2">
            {playerScore}
          </div>

          {/* Checkout Guidance Route */}
          {checkoutRoute ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Checkout: {checkoutRoute}</span>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 font-medium">Setup scoring visit required</div>
          )}
        </div>

        {/* Player 2 Card (CPU / Opponent) */}
        <div className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
          !isP1Turn
            ? 'bg-slate-900/90 border-cyan-500 shadow-2xl shadow-cyan-500/10'
            : 'bg-neutral-900/60 border-neutral-800 opacity-80'
        }`}>
          {!isP1Turn && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
              <span>OPPONENT THROWING</span>
            </div>
          )}

          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase mb-1">
            <span>{controller.opponent.name}</span>
            <div className="flex items-center gap-2">
              {isSets && <span className="text-cyan-400">Sets: {p2Sets}</span>}
              <span className="text-white">Legs: {p2Legs}</span>
            </div>
          </div>

          <div className="text-6xl sm:text-7xl font-black text-cyan-400 font-mono tracking-tight my-2">
            {oppScore}
          </div>

          {/* Last Visit Info */}
          <div className="text-xs text-neutral-400">
            {matchState.lastVisit && matchState.lastVisit.playerId === controller.opponent.id
              ? `Last Visit: ${matchState.lastVisit.visitScore} pts (${matchState.lastVisit.darts.map(d => d.label).join(' • ')})`
              : 'Waiting for throw...'}
          </div>
          
          {/* Virtual Dartboard TV Graphic */}
          <div className="mt-4 flex justify-center">
            <BroadcastDartboard
              darts={cpuDartCoords}
              className="w-[180px] opacity-90 drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Input Interaction Section */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {entryMode === 'quick_total' ? (
          /* QUICK TOTAL ENTRY MODE */
          <div className="space-y-6">
            {/* Quick Presets Strip */}
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                One-Tap Visit Presets
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {quickPresets.map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    disabled={!isMyTurn || pts > playerScore}
                    onClick={() => handleQuickPreset(pts)}
                    className="py-3 px-2 rounded-2xl bg-neutral-800 hover:bg-amber-500 hover:text-black font-black text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-105 active:scale-95"
                  >
                    {pts}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!isMyTurn}
                  onClick={handleBust}
                  className="py-3 px-2 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white font-black text-base transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  Bust
                </button>
              </div>
            </div>

            {/* Exact Visit Keypad */}
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-white/10">
                <span className="text-xs font-bold text-neutral-400">Custom Visit Score:</span>
                <span className="text-3xl font-mono font-black text-amber-400">
                  {keypadInput || '0'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                  <button
                    key={d}
                    type="button"
                    disabled={!isMyTurn}
                    onClick={() => handleKeypadDigit(d)}
                    className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lg font-bold text-white transition-all active:scale-95"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!isMyTurn}
                  onClick={handleKeypadClear}
                  className="py-3 rounded-xl bg-neutral-800 hover:bg-red-900/50 text-xs font-bold text-red-400 transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={!isMyTurn}
                  onClick={() => handleKeypadDigit('0')}
                  className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lg font-bold text-white transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  disabled={!isMyTurn}
                  onClick={handleKeypadBackspace}
                  className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-all"
                >
                  <Delete className="w-4 h-4 mx-auto" />
                </button>
              </div>

              <button
                type="button"
                disabled={!isMyTurn || !keypadInput}
                onClick={handleKeypadSubmit}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Confirm Visit ({keypadInput || '0'})</span>
              </button>
            </div>
          </div>
        ) : (
          /* DART BY DART ENTRY MODE */
          <div className="space-y-4">
            {/* Dart Sequence Preview */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2].map((idx) => {
                const dart = selectedDarts[idx];
                return (
                  <div
                    key={idx}
                    className={`w-24 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      dart
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : idx === selectedDarts.length
                        ? 'bg-neutral-800 border-amber-400/50 border-dashed animate-pulse text-neutral-500'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider">Dart {idx + 1}</div>
                    <div className="text-lg font-black font-mono">
                      {dart ? dart.label : '—'}
                    </div>
                  </div>
                );
              })}

              {selectedDarts.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndoDart}
                  className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Multiplier Selector */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setMultiplier(1)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  multiplier === 1 ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Single (1x)
              </button>
              <button
                type="button"
                onClick={() => setMultiplier(2)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  multiplier === 2 ? 'bg-emerald-500 text-black shadow-lg' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Double (2x)
              </button>
              <button
                type="button"
                onClick={() => setMultiplier(3)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  multiplier === 3 ? 'bg-rose-500 text-white shadow-lg' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Treble (3x)
              </button>
            </div>

            {/* Dartboard Segments 1-20 & Bull */}
            <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5 max-w-2xl mx-auto">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((seg) => (
                <button
                  key={seg}
                  type="button"
                  disabled={!isMyTurn}
                  onClick={() => handleDartSegmentClick(seg)}
                  className={`py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
                    multiplier === 3
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/40'
                      : multiplier === 2
                      ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/40'
                      : 'bg-neutral-800 text-white hover:bg-amber-500 hover:text-black'
                  }`}
                >
                  {multiplier === 3 ? `T${seg}` : multiplier === 2 ? `D${seg}` : seg}
                </button>
              ))}
              <button
                type="button"
                disabled={!isMyTurn}
                onClick={() => handleDartSegmentClick(25)}
                className="py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black font-black text-sm transition-all"
              >
                {multiplier === 2 ? 'Bull (50)' : 'Outer (25)'}
              </button>
              <button
                type="button"
                disabled={!isMyTurn}
                onClick={() => handleDartSegmentClick(0)}
                className="py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 font-bold text-sm transition-all"
              >
                Miss (0)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
