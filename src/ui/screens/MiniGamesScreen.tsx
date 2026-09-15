import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Award,
  Undo2,
  RotateCcw,
  Trophy,
  Check,
  X,
  Flame,
  Sparkles,
  Swords,
  User,
  Bot,
  ArrowLeft,
  Dumbbell,
  Zap,
  Info,
  ChevronRight,
  Grid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareerManager } from '../../core/career/CareerManager';
import { PlayerFactory } from '../../core/player/PlayerFactory';
import { AudioManager } from '../../core/audio/AudioManager';
import { PrecisionThrowOche } from '../components/PrecisionThrowOche';
import { AroundTheClockGame, ATCMode } from '../../core/minigames/AroundTheClockGame';
import { CricketGame, CricketMode } from '../../core/minigames/CricketGame';
import { Checkout121Game } from '../../core/minigames/Checkout121Game';
import { ShanghaiGame, ShanghaiMode } from '../../core/minigames/ShanghaiGame';

type MiniGameTab = 'atc' | 'cricket' | '121' | 'shanghai';

interface MiniGamesScreenProps {
  career?: CareerManager | null;
  onBack: () => void;
  onApplyCareerTrainingReward?: (gameName: string, attribute: 'scoring' | 'doubling' | 'pressure', amount: number) => void;
}

export const MiniGamesScreen: React.FC<MiniGamesScreenProps> = ({
  career,
  onBack,
  onApplyCareerTrainingReward,
}) => {
  const [activeTab, setActiveTab] = useState<MiniGameTab>('atc');
  const [inputStyle, setInputStyle] = useState<'virtual' | 'keypad'>('virtual');

  const activePlayer = career?.player || new PlayerFactory().createPlayer({
    name: 'Player',
    gender: 'male',
    nationality: 'English',
    archetype: 'balanced',
  });

  // Input Multiplier state for dart throwing
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1);

  // --- AROUND THE CLOCK STATE ---
  const [atcMode, setAtcMode] = useState<ATCMode>('standard');
  const [atcBonus, setAtcBonus] = useState<boolean>(true);
  const [atcGame, setAtcGame] = useState<AroundTheClockGame>(
    () => new AroundTheClockGame('standard', true)
  );

  // --- CRICKET STATE ---
  const [cricketMode, setCricketMode] = useState<CricketMode>('solo');
  const [cricketGame, setCricketGame] = useState<CricketGame>(
    () => new CricketGame('solo', career?.player.name || 'Player 1', 'CPU Bot')
  );
  const [cpuThrowing, setCpuThrowing] = useState<boolean>(false);

  // --- 121 CHECKOUT STATE ---
  const [checkoutGame, setCheckoutGame] = useState<Checkout121Game>(
    () => new Checkout121Game(121)
  );
  const [checkoutAlert, setCheckoutAlert] = useState<{ type: 'checkout' | 'bust' | 'failed'; message: string } | null>(null);

  // --- SHANGHAI STATE ---
  const [shanghaiMaxRounds, setShanghaiMaxRounds] = useState<7 | 20>(7);
  const [shanghaiMode, setShanghaiMode] = useState<ShanghaiMode>('solo');
  const [shanghaiGame, setShanghaiGame] = useState<ShanghaiGame>(
    () => new ShanghaiGame(7, 'solo', career?.player.name || 'Player 1', 'CPU Bot')
  );

  // Career reward claimed flag for current session
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Re-render tick
  const [, setRenderTick] = useState<number>(0);
  const forceUpdate = () => setRenderTick(t => t + 1);

  // Auto-switch ATC game when mode or bonus setting changes
  const handleAtcModeChange = (mode: ATCMode, bonus: boolean) => {
    setAtcMode(mode);
    setAtcBonus(bonus);
    setAtcGame(new AroundTheClockGame(mode, bonus));
    setMultiplier(mode === 'doubles_only' ? 2 : 1);
  };

  // Re-init Cricket game
  const handleCricketModeChange = (mode: CricketMode) => {
    setCricketMode(mode);
    setCricketGame(new CricketGame(mode, career?.player.name || 'Player 1', 'CPU Bot'));
  };

  // Re-init Shanghai game
  const handleShanghaiSettingsChange = (rounds: 7 | 20, mode: ShanghaiMode) => {
    setShanghaiMaxRounds(rounds);
    setShanghaiMode(mode);
    setShanghaiGame(new ShanghaiGame(
      rounds,
      mode,
      career?.player.name || 'Player 1',
      mode === 'two_player' ? (career?.players[1]?.name || 'Player 2') : 'CPU Bot'
    ));
  };

  // Handle CPU Throw logic in Cricket and Shanghai
  useEffect(() => {
    if (activeTab === 'cricket' && cricketMode === 'vs_cpu' && cricketGame.getActivePlayerIndex() === 1 && !cricketGame.getIsCompleted()) {
      setCpuThrowing(true);
      const timer = setTimeout(() => {
        const cpuMove = cricketGame.generateCpuDart(68);
        AudioManager.playDartThud();
        cricketGame.recordDart(cpuMove.segment, cpuMove.multiplier);
        forceUpdate();
        setCpuThrowing(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeTab, cricketMode, cricketGame, cricketGame.getActivePlayerIndex(), cricketGame.getIsCompleted()]);

  useEffect(() => {
    if (activeTab === 'shanghai' && shanghaiMode === 'vs_cpu' && shanghaiGame.getActivePlayerIndex() === 1 && !shanghaiGame.getIsCompleted()) {
      setCpuThrowing(true);
      const timer = setTimeout(() => {
        const cpuMove = shanghaiGame.generateCpuDart(68);
        AudioManager.playDartThud();
        shanghaiGame.recordDart(cpuMove.segment, cpuMove.multiplier);
        forceUpdate();
        setCpuThrowing(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeTab, shanghaiMode, shanghaiGame, shanghaiGame.getActivePlayerIndex(), shanghaiGame.getIsCompleted()]);

  // Throw Dart Handlers
  const handleThrowDart = (segment: number, forceMult?: 1 | 2 | 3) => {
    if (cpuThrowing) return;
    const m = forceMult || multiplier;
    AudioManager.playDartThud();

    if (activeTab === 'atc') {
      if (atcGame.getIsCompleted()) return;
      const res = atcGame.recordDart(segment, m);
      if (res.wasHit) {
        if (atcGame.getIsCompleted()) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          AudioManager.playCrowdCheer(2.5);
          AudioManager.speak('Winner!');
        }
      }
      forceUpdate();
    } else if (activeTab === 'cricket') {
      if (cricketGame.getIsCompleted()) return;
      cricketGame.recordDart(segment, m);
      if (cricketGame.getIsCompleted()) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        AudioManager.playCrowdCheer(2.5);
        AudioManager.speak('Winner!');
      }
      forceUpdate();
    } else if (activeTab === '121') {
      const res = checkoutGame.recordDart(segment, m);
      if (res.status === 'checkout') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        AudioManager.playCrowdCheer(2.0);
        AudioManager.speak(`Checkout on target ${res.newTarget - 1}!`);
        setCheckoutAlert({
          type: 'checkout',
          message: `🎯 Target checked out! Advanced to ${res.newTarget} (+9 Fresh Darts)`,
        });
      } else if (res.status === 'bust') {
        AudioManager.speak('Bust!');
        setCheckoutAlert({
          type: 'bust',
          message: `❌ BUST! Score restored to ${res.newRemaining}. Visit finished.`,
        });
      } else if (res.status === 'failed') {
        AudioManager.speak('Target missed!');
        setCheckoutAlert({
          type: 'failed',
          message: `⚠️ 9 Darts expired! Challenge reset to 121.`,
        });
      } else {
        setCheckoutAlert(null);
      }
      forceUpdate();
    } else if (activeTab === 'shanghai') {
      if (shanghaiGame.getIsCompleted()) return;
      const res = shanghaiGame.recordDart(segment, m);
      if (res.isShanghaiHit) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        AudioManager.playCrowdCheer(3.5);
        AudioManager.speak('SHANGHAI! What a magnificent finish!');
      } else if (shanghaiGame.getIsCompleted()) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        AudioManager.playCrowdCheer(2.0);
        AudioManager.speak('Game over!');
      }
      forceUpdate();
    }
  };

  const handleUndoDart = () => {
    if (activeTab === 'atc') {
      atcGame.undoLastDart();
    } else if (activeTab === 'cricket') {
      cricketGame.undoLastDart();
    } else if (activeTab === 'shanghai') {
      shanghaiGame.undoLastDart();
    }
    forceUpdate();
  };

  const handleResetGame = () => {
    setRewardClaimed(false);
    if (activeTab === 'atc') {
      atcGame.reset();
    } else if (activeTab === 'cricket') {
      cricketGame.reset();
    } else if (activeTab === '121') {
      checkoutGame.reset();
      setCheckoutAlert(null);
    } else if (activeTab === 'shanghai') {
      shanghaiGame.reset();
    }
    forceUpdate();
  };

  // Claim career training reward
  const handleClaimReward = (gameTitle: string, attribute: 'scoring' | 'doubling' | 'pressure', amount: number) => {
    if (career && !rewardClaimed) {
      const activeP = career.players[career.activePlayerIndex] || career.player;
      activeP.attributes[attribute] = Math.min(99, activeP.attributes[attribute] + amount);
      activeP.state.confidence = Math.min(100, activeP.state.confidence + 4);
      setRewardClaimed(true);
      if (onApplyCareerTrainingReward) {
        onApplyCareerTrainingReward(gameTitle, attribute, amount);
      }
      AudioManager.speak('Training boost applied!');
      forceUpdate();
    }
  };

  // Helper to determine highlighted targets for each game
  const getHighlightedSegment = (): number | null => {
    if (activeTab === 'atc') {
      const t = atcGame.getCurrentTarget();
      return t === 50 ? 25 : t;
    }
    if (activeTab === 'shanghai') {
      return shanghaiGame.getCurrentRound();
    }
    return null;
  };

  const currentHighlight = getHighlightedSegment();

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>

          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>PRACTICE OCHE</span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Official Routines
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Authentic PDC practice games, tactical cricket marks, and doubling calibration drills.
            </p>
          </div>
        </div>

        {/* Career Player Badge */}
        {career && (
          <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 px-3.5 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center">
              {career.player.name.charAt(0)}
            </div>
            <div>
              <span className="block text-xs font-bold text-white">{career.player.name}</span>
              <span className="text-[10px] text-amber-400 font-mono">
                Training Form: {career.player.state.confidence}/100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Game Mode Tab Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'atc' as MiniGameTab, label: 'Around the Clock', icon: '🎯', desc: '1 to 20 + Bullseye' },
          { id: 'cricket' as MiniGameTab, label: 'Cricket (15-20 & B)', icon: '🦗', desc: 'Tactical Mark Closing' },
          { id: '121' as MiniGameTab, label: '121 Challenge', icon: '💯', desc: '9-Dart Double Finishes' },
          { id: 'shanghai' as MiniGameTab, label: 'Shanghai', icon: '🏯', desc: 'Round Target + Instant Win' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setRewardClaimed(false);
              setMultiplier(tab.id === 'atc' && atcMode === 'doubles_only' ? 2 : 1);
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{tab.icon}</span>
              <span className="font-bold text-sm text-white">{tab.label}</span>
            </div>
            <span className="text-[11px] text-neutral-400 block mt-1">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE GAME PLAY AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Game Board & Scoring Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* ========================================================================= */}
          {/* GAME 1: AROUND THE CLOCK */}
          {/* ========================================================================= */}
          {activeTab === 'atc' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              {/* ATC Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                    Mode Settings
                  </span>
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAtcModeChange('standard', atcBonus)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        atcMode === 'standard' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Standard (1-20, Bull)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAtcModeChange('doubles_only', false)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        atcMode === 'doubles_only' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Doubles Only
                    </button>
                  </div>
                </div>

                {atcMode === 'standard' && (
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={atcBonus}
                      onChange={e => handleAtcModeChange('standard', e.target.checked)}
                      className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Bonus Steps (D=+2, T=+3)</span>
                  </label>
                )}
              </div>

              {/* Glowing Target Showcase */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950 border border-amber-500/30 shadow-inner">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
                    CURRENT TARGET
                  </span>
                  <div className="text-5xl font-black text-amber-400 font-mono tracking-tight mt-1 flex items-center gap-3">
                    <span>{atcGame.getCurrentTargetLabel()}</span>
                    {atcGame.getIsCompleted() && <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />}
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {atcMode === 'doubles_only'
                      ? 'Strike the double ring to advance!'
                      : atcBonus
                      ? 'Hit target! Double skips 2, Treble skips 3!'
                      : 'Hit any segment of the target to advance!'}
                  </span>
                </div>

                <div className="text-right flex flex-col items-center sm:items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Sequence Progress
                  </span>
                  <div className="text-3xl font-black text-white font-mono mt-0.5">
                    {atcGame.getProgressPercent()}%
                  </div>
                  <div className="w-32 h-2.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                      style={{ width: `${atcGame.getProgressPercent()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Target Sequence Visualizer Grid */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2 block">
                  Clock Sequence Ladder
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                  {atcGame.getTargetSequence().map((num, idx) => {
                    const isDone = idx < atcGame.getCurrentTargetIndex() || atcGame.getIsCompleted();
                    const isCurrent = idx === atcGame.getCurrentTargetIndex() && !atcGame.getIsCompleted();
                    const label = num === 25 ? 'B' : num === 50 ? 'DB' : `${num}`;

                    return (
                      <div
                        key={idx}
                        className={`h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-amber-500 text-black border-2 border-amber-300 font-black shadow-lg scale-105 animate-pulse'
                            : 'bg-neutral-950 text-neutral-500 border border-neutral-800'
                        }`}
                      >
                        {isDone ? '✓' : label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Victory Banner */}
              {atcGame.getIsCompleted() && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-scale-up">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-7 h-7 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">AROUND THE CLOCK COMPLETED!</h4>
                      <p className="text-xs text-neutral-300">
                        Total Darts: <strong>{atcGame.getDartsThrown()}</strong> • Hit Rate: <strong>{atcGame.getHitRate()}%</strong>
                      </p>
                    </div>
                  </div>

                  {career && !rewardClaimed && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward('Around the Clock', atcMode === 'doubles_only' ? 'doubling' : 'scoring', 2)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Claim +2 {atcMode === 'doubles_only' ? 'Doubling' : 'Scoring'} XP</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* GAME 2: CRICKET (15-20 & Bull) */}
          {/* ========================================================================= */}
          {activeTab === 'cricket' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              {/* Cricket Mode Selector */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Match Format
                </span>
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCricketModeChange('solo')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cricketMode === 'solo' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Solo Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCricketModeChange('vs_cpu')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cricketMode === 'vs_cpu' ? 'bg-purple-500 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    vs CPU Bot
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCricketModeChange('two_player')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cricketMode === 'two_player' ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    2-Player Local
                  </button>
                </div>
              </div>

              {/* Turn Indicator Banner */}
              {cricketMode !== 'solo' && !cricketGame.getIsCompleted() && (
                <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                  cricketGame.getActivePlayerIndex() === 0
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-ping ${
                      cricketGame.getActivePlayerIndex() === 0 ? 'bg-amber-400' : 'bg-purple-400'
                    }`} />
                    <span>
                      {cricketGame.getActivePlayerIndex() === 0
                        ? `${cricketGame.playerNames[0]}'s Turn (Player 1)`
                        : `${cricketGame.playerNames[1]}'s Turn (${cricketMode === 'vs_cpu' ? 'CPU' : 'Player 2'})`}
                    </span>
                  </div>
                  <span>Visit Darts: {cricketGame.getCurrentVisitDarts().length} / 3</span>
                </div>
              )}

              {/* Authentic Cricket Chalkboard */}
              <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl overflow-hidden shadow-inner font-mono">
                {/* Board Header */}
                <div className="grid grid-cols-7 bg-neutral-900/90 border-b border-neutral-800 p-3 text-center text-xs font-black">
                  <div className="col-span-3 text-amber-400 flex items-center justify-center gap-2">
                    <span>{cricketGame.playerNames[0]}</span>
                    <span className="text-base font-black text-white px-2 py-0.5 rounded bg-neutral-800">
                      {cricketGame.getPlayerScores()[0]}
                    </span>
                  </div>

                  <div className="col-span-1 text-neutral-400 font-sans uppercase tracking-widest text-[10px] flex items-center justify-center">
                    Target
                  </div>

                  <div className="col-span-3 text-purple-400 flex items-center justify-center gap-2">
                    <span className="text-base font-black text-white px-2 py-0.5 rounded bg-neutral-800">
                      {cricketGame.getPlayerScores()[1]}
                    </span>
                    <span>{cricketMode === 'solo' ? 'SOLO' : cricketGame.playerNames[1]}</span>
                  </div>
                </div>

                {/* Target Rows (20, 19, 18, 17, 16, 15, Bull) */}
                <div className="divide-y divide-neutral-800/80">
                  {CricketGame.TARGETS.map(target => {
                    const p1Marks = cricketGame.getPlayerMarks(0)[target] || 0;
                    const p2Marks = cricketGame.getPlayerMarks(1)[target] || 0;
                    const isDead = cricketGame.isTargetDead(target);

                    const formatMark = (marks: number) => {
                      if (marks === 0) return <span className="text-neutral-700">·</span>;
                      if (marks === 1) return <span className="text-amber-400 font-black text-lg">/</span>;
                      if (marks === 2) return <span className="text-amber-400 font-black text-lg">✕</span>;
                      return (
                        <span className="text-emerald-400 font-black text-lg flex items-center justify-center gap-1">
                          <span>⨂</span>
                          {marks > 3 && <span className="text-[10px] text-emerald-300">+{marks - 3}</span>}
                        </span>
                      );
                    };

                    const formatP2Mark = (marks: number) => {
                      if (marks === 0) return <span className="text-neutral-700">·</span>;
                      if (marks === 1) return <span className="text-purple-400 font-black text-lg">/</span>;
                      if (marks === 2) return <span className="text-purple-400 font-black text-lg">✕</span>;
                      return (
                        <span className="text-emerald-400 font-black text-lg flex items-center justify-center gap-1">
                          <span>⨂</span>
                          {marks > 3 && <span className="text-[10px] text-emerald-300">+{marks - 3}</span>}
                        </span>
                      );
                    };

                    return (
                      <div
                        key={target}
                        className={`grid grid-cols-7 items-center p-2.5 text-center transition-colors ${
                          isDead ? 'bg-neutral-900/40 opacity-70' : 'hover:bg-neutral-900/30'
                        }`}
                      >
                        {/* P1 Marks */}
                        <div className="col-span-3 flex items-center justify-center">
                          {formatMark(p1Marks)}
                        </div>

                        {/* Center Target Number */}
                        <div className="col-span-1 flex items-center justify-center">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider ${
                            isDead
                              ? 'bg-neutral-800 text-neutral-500 line-through'
                              : 'bg-neutral-900 text-white border border-neutral-700 shadow-sm'
                          }`}>
                            {target === 25 ? 'BULL' : target}
                          </span>
                        </div>

                        {/* P2 Marks */}
                        <div className="col-span-3 flex items-center justify-center">
                          {cricketMode === 'solo' ? (
                            <span className="text-neutral-600 text-xs">
                              {p1Marks >= 3 ? 'CLOSED' : `${3 - p1Marks} to close`}
                            </span>
                          ) : (
                            formatP2Mark(p2Marks)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cricket Victory Banner */}
              {cricketGame.getIsCompleted() && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-scale-up">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-7 h-7 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {cricketMode === 'solo'
                          ? 'CRICKET BOARD COMPLETED!'
                          : `${cricketGame.playerNames[cricketGame.getWinnerIndex() || 0]} WINS CRICKET!`}
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Final Score: <strong>{cricketGame.getPlayerScores()[0]}</strong> - <strong>{cricketGame.getPlayerScores()[1]}</strong>
                      </p>
                    </div>
                  </div>

                  {career && !rewardClaimed && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward('Cricket', 'scoring', 2)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Claim +2 Scoring XP</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* GAME 3: 121 CHECKOUT CHALLENGE */}
          {/* ========================================================================= */}
          {activeTab === '121' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              {/* Challenge Top Status */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  PDC Professional Practice Routine
                </span>
                <span className="text-xs font-mono font-bold text-neutral-400">
                  9 Darts Limit per Target
                </span>
              </div>

              {/* LED Style Display Box */}
              <div className="p-6 rounded-2xl bg-black border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                    TARGET LEVEL
                  </span>
                  <div className="text-5xl font-black text-amber-400 font-mono tracking-tight mt-1">
                    {checkoutGame.getCurrentTarget()}
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    Checkouts Made: <strong className="text-white">{checkoutGame.getTotalCheckouts()}</strong>
                  </span>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                    REMAINDER TO CHECKOUT
                  </span>
                  <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight mt-1">
                    {checkoutGame.getCurrentRemainingScore()}
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    Finishing double required
                  </span>
                </div>
              </div>

              {/* 9-Dart Counter Strip */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Darts Remaining in Bracket: {checkoutGame.getDartsRemainingThisTarget()} of 9
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Throw up to 3 visits of 3 darts to take out target.
                  </span>
                </div>

                {/* 9 Dart Icons */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const isSpent = i < (9 - checkoutGame.getDartsRemainingThisTarget());
                    return (
                      <div
                        key={i}
                        className={`w-3.5 h-6 rounded-md transition-all ${
                          isSpent
                            ? 'bg-neutral-800 opacity-40'
                            : 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-md shadow-amber-500/20'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Suggested Checkout Routes */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                    Pro Route:
                  </span>
                  <span className="text-white font-mono font-bold">
                    {checkoutGame.getSuggestedRoutes().slice(0, 2).join('  •  ') || 'Reduce score'}
                  </span>
                </div>
              </div>

              {/* Alert Feedback Banner */}
              {checkoutAlert && (
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-scale-up ${
                  checkoutAlert.type === 'checkout'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : checkoutAlert.type === 'bust'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-amber-500/20 border-amber-500 text-amber-300'
                }`}>
                  <span>{checkoutAlert.message}</span>
                </div>
              )}

              {/* High Score Stats Bar */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">Current Streak</span>
                  <span className="text-lg font-mono font-bold text-amber-400">{checkoutGame.getCurrentStreak()}</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">Best Streak</span>
                  <span className="text-lg font-mono font-bold text-white">{checkoutGame.getBestStreak()}</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">Peak Target</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">{checkoutGame.getHighestTargetAchieved()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GAME 4: SHANGHAI */}
          {/* ========================================================================= */}
          {activeTab === 'shanghai' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              {/* Shanghai Settings */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Rounds:</span>
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleShanghaiSettingsChange(7, shanghaiMode)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        shanghaiMaxRounds === 7 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      7 Rounds
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShanghaiSettingsChange(20, shanghaiMode)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        shanghaiMaxRounds === 20 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      20 Rounds
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleShanghaiSettingsChange(shanghaiMaxRounds, 'solo')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      shanghaiMode === 'solo' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Solo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShanghaiSettingsChange(shanghaiMaxRounds, 'vs_cpu')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      shanghaiMode === 'vs_cpu' ? 'bg-purple-500 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    vs CPU
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShanghaiSettingsChange(shanghaiMaxRounds, 'two_player')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      shanghaiMode === 'two_player' ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    2P Local
                  </button>
                </div>
              </div>

              {/* Turn & Coin Toss Indicator (Multiplayer / vs CPU) */}
              {shanghaiMode !== 'solo' && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  shanghaiGame.getActivePlayerIndex() === 0
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    <span>Active Thrower: <strong>{shanghaiGame.playerNames[shanghaiGame.getActivePlayerIndex()]}</strong></span>
                  </span>
                  {shanghaiGame.getCurrentRound() === 1 && shanghaiGame.getCurrentVisitDarts().length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const w = shanghaiGame.performCoinToss();
                        AudioManager.speak(`${shanghaiGame.playerNames[w]} throws first!`);
                        forceUpdate();
                      }}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-white transition-all font-mono"
                    >
                      🪙 Coin Toss
                    </button>
                  )}
                </div>
              )}

              {/* Round Target Showcase */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950 border border-amber-500/30 flex items-center justify-between gap-6 shadow-inner">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                    ROUND {shanghaiGame.getCurrentRound()} OF {shanghaiGame.maxRounds}
                  </span>
                  <div className="text-5xl font-black text-amber-400 font-mono tracking-tight mt-1">
                    TARGET: {shanghaiGame.getCurrentRound()}
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    Only hits on segment {shanghaiGame.getCurrentRound()} count towards your score!
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                    {shanghaiGame.playerNames[0].toUpperCase()}
                  </span>
                  <div className="text-4xl font-black text-white font-mono mt-1">
                    {shanghaiGame.getPlayerScores()[0]}
                  </div>
                  {shanghaiMode !== 'solo' && (
                    <span className="text-xs text-purple-400 font-mono block mt-1">
                      {shanghaiGame.playerNames[1]}: {shanghaiGame.getPlayerScores()[1]}
                    </span>
                  )}
                </div>
              </div>

              {/* Shanghai Instant Win Rule Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-amber-400 block">
                      THE SHANGHAI INSTANT WIN RULE
                    </span>
                    <span className="text-[11px] text-neutral-300">
                      Hit a <strong>Single {shanghaiGame.getCurrentRound()}</strong>, <strong>Double {shanghaiGame.getCurrentRound()}</strong>, and <strong>Treble {shanghaiGame.getCurrentRound()}</strong> in the same visit for an instant victory!
                    </span>
                  </div>
                </div>

                {/* Shanghai Combo Tracker for this visit */}
                <div className="flex items-center gap-2 shrink-0">
                  {(() => {
                    const visit = shanghaiGame.getCurrentVisitDarts();
                    const round = shanghaiGame.getCurrentRound();
                    const hasSingle = visit.some(d => d.segment === round && d.multiplier === 1);
                    const hasDouble = visit.some(d => d.segment === round && d.multiplier === 2);
                    const hasTreble = visit.some(d => d.segment === round && d.multiplier === 3);

                    return (
                      <>
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          hasSingle ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          S{round}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          hasDouble ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          D{round}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          hasTreble ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          T{round}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Shanghai Jackpot Victory */}
              {shanghaiGame.getIsCompleted() && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-scale-up">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-7 h-7 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {shanghaiGame.getShanghaiAchievedBy() !== null
                          ? '👑 SHANGHAI HIT! INSTANT VICTORY!'
                          : 'SHANGHAI MATCH FINISHED!'}
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Final Score: <strong>{shanghaiGame.getPlayerScores()[0]}</strong>
                      </p>
                    </div>
                  </div>

                  {career && !rewardClaimed && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward('Shanghai', 'scoring', 2)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Claim +2 Scoring XP</span>
                    </button>
                  )}
                </div>
              )}

              {/* Shanghai Official Scorecard Matrix */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-amber-400" />
                    Official Shanghai Scorecard
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Rounds 1 – {shanghaiGame.maxRounds}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-[10px]">
                        <th className="pb-1.5 font-bold">RND</th>
                        <th className="pb-1.5 font-bold">TARGET</th>
                        <th className="pb-1.5 font-bold">{shanghaiGame.playerNames[0]}</th>
                        {shanghaiMode !== 'solo' && (
                          <th className="pb-1.5 font-bold">{shanghaiGame.playerNames[1]}</th>
                        )}
                        <th className="pb-1.5 text-right font-bold">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 font-mono">
                      {shanghaiGame.getRoundSummaries().map((r) => {
                        const isCurrent = r.round === shanghaiGame.getCurrentRound();
                        const formatDart = (d: any) =>
                          d.multiplier === 3 ? `T${d.segment}` : d.multiplier === 2 ? `D${d.segment}` : d.segment === 0 ? '0' : `S${d.segment}`;
                        return (
                          <tr key={r.round} className={`${isCurrent ? 'bg-amber-500/10 text-amber-300 font-bold' : 'text-neutral-300'}`}>
                            <td className="py-1">{r.round}</td>
                            <td className="py-1 text-amber-400 font-bold">{r.round}</td>
                            <td className="py-1">
                              {r.p1Darts.length > 0 ? (
                                <span className="flex items-center gap-1">
                                  <span>{r.p1Darts.map(formatDart).join(', ')}</span>
                                  <span className="text-neutral-500 text-[10px]">(+{r.p1RoundScore})</span>
                                  {r.shanghaiHitBy === 0 && <span className="text-amber-400 font-bold">👑 SHANGHAI</span>}
                                </span>
                              ) : isCurrent ? <span className="text-neutral-500 italic">Throwing...</span> : '—'}
                            </td>
                            {shanghaiMode !== 'solo' && (
                              <td className="py-1">
                                {r.p2Darts && r.p2Darts.length > 0 ? (
                                  <span className="flex items-center gap-1">
                                    <span>{r.p2Darts.map(formatDart).join(', ')}</span>
                                    <span className="text-neutral-500 text-[10px]">(+{r.p2RoundScore})</span>
                                    {r.shanghaiHitBy === 1 && <span className="text-amber-400 font-bold">👑 SHANGHAI</span>}
                                  </span>
                                ) : isCurrent && r.p1Darts.length >= 3 ? <span className="text-neutral-500 italic">Waiting...</span> : '—'}
                              </td>
                            )}
                            <td className="py-1 text-right font-bold text-white">
                              {r.p1CumulativeTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Virtual Board & Dart Throw Keypad (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mode Switcher: Interactive Board Throw vs Keypad Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setInputStyle('virtual')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                inputStyle === 'virtual'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Interactive Board Throw</span>
            </button>
            <button
              type="button"
              onClick={() => setInputStyle('keypad')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                inputStyle === 'keypad'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Keypad Numbers</span>
            </button>
          </div>

          {inputStyle === 'virtual' ? (
            <PrecisionThrowOche
              player={activePlayer}
              onConfirmVisit={() => {}}
              onDartThrown={(dart) => {
                handleThrowDart(dart.segment, dart.multiplier);
              }}
              disabled={cpuThrowing}
              targetSegment={currentHighlight}
              targetMultiplier={activeTab === 'atc' && atcMode === 'doubles_only' ? 2 : null}
            />
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              {/* Multiplier Modifier Selector */}
              <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Multiplier Ring
              </span>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMultiplier(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    multiplier === 1 ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Single (1x)
                </button>
                <button
                  type="button"
                  onClick={() => setMultiplier(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    multiplier === 2 ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Double (2x)
                </button>
                <button
                  type="button"
                  onClick={() => setMultiplier(3)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    multiplier === 3 ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Treble (3x)
                </button>
              </div>
            </div>

            {/* Current Visit 3 Darts Display */}
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400">Visit:</span>
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map(idx => {
                    let dart = null;
                    if (activeTab === 'atc') dart = atcGame.getCurrentVisitDarts()[idx];
                    else if (activeTab === 'cricket') dart = cricketGame.getCurrentVisitDarts()[idx];
                    else if (activeTab === '121') dart = checkoutGame.getCurrentVisitDarts()[idx];
                    else if (activeTab === 'shanghai') dart = shanghaiGame.getCurrentVisitDarts()[idx];

                    return (
                      <div
                        key={idx}
                        className={`w-14 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold border ${
                          dart
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                        }`}
                      >
                        {dart ? dart.label : `D${idx + 1}`}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Undo & Reset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndoDart}
                  title="Undo Last Dart"
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetGame}
                  title="Reset Game"
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Board Segment Keypad (1 to 20, Bull, Miss) */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(seg => {
                const isTarget = currentHighlight === seg;

                return (
                  <button
                    key={seg}
                    type="button"
                    disabled={cpuThrowing}
                    onClick={() => handleThrowDart(seg)}
                    className={`h-12 rounded-xl font-mono text-sm font-bold transition-all flex flex-col items-center justify-center ${
                      isTarget
                        ? 'bg-amber-500 text-black font-black border-2 border-amber-300 ring-2 ring-amber-500/40 shadow-lg scale-105 animate-pulse'
                        : 'bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white hover:border-amber-500/50'
                    }`}
                  >
                    <span>{seg}</span>
                    <span className="text-[9px] text-neutral-400 font-sans leading-none opacity-80">
                      {multiplier === 3 ? `T${seg}` : multiplier === 2 ? `D${seg}` : `S${seg}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bullseye, Outer Bull, and Miss Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80">
              {/* Outer Bull (25) */}
              <button
                type="button"
                disabled={cpuThrowing}
                onClick={() => handleThrowDart(25, 1)}
                className={`h-12 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center ${
                  currentHighlight === 25
                    ? 'bg-amber-500 text-black font-black border-2 border-amber-300 animate-pulse'
                    : 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                }`}
              >
                <span>OUTER BULL</span>
                <span className="text-[10px] font-mono text-emerald-400">25 pts</span>
              </button>

              {/* Double Bull (50) */}
              <button
                type="button"
                disabled={cpuThrowing}
                onClick={() => handleThrowDart(25, 2)}
                className={`h-12 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center ${
                  currentHighlight === 25
                    ? 'bg-amber-500 text-black font-black border-2 border-amber-300 animate-pulse'
                    : 'bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
                }`}
              >
                <span>BULLSEYE</span>
                <span className="text-[10px] font-mono text-rose-400">50 pts (D)</span>
              </button>

              {/* Miss (0) */}
              <button
                type="button"
                disabled={cpuThrowing}
                onClick={() => handleThrowDart(0, 1)}
                className="h-12 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold text-xs flex flex-col items-center justify-center transition-all"
              >
                <span>MISS</span>
                <span className="text-[10px] font-mono text-neutral-500">0 pts</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
