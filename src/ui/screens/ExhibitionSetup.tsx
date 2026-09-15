import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { PlayerFactory } from '../../core/player/PlayerFactory';
import { Bot, User, Users, Play, ArrowLeft, Gauge } from 'lucide-react';

export type ExhibitionMatchMode = 'vs_cpu' | 'local_2p' | 'calibration';

interface ExhibitionSetupProps {
  onStartMatch: (player1: Player, player2: Player, isLocal2P: boolean, bestOfLegs: number, isCalibration?: boolean, isHybrid?: boolean) => void;
  onBack: () => void;
}

export const ExhibitionSetup: React.FC<ExhibitionSetupProps> = ({
  onStartMatch,
  onBack,
}) => {
  const [matchMode, setMatchMode] = useState<ExhibitionMatchMode>('vs_cpu');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [cpuTier, setCpuTier] = useState<'pub' | 'amateur' | 'semi_pro' | 'pro' | 'elite'>('pub');
  const [bestOfLegs, setBestOfLegs] = useState<number>(3);
  const [isHybrid, setIsHybrid] = useState<boolean>(false);

  const handleLaunch = () => {
    const factory = new PlayerFactory();

    const p1 = factory.createPlayer({
      name: player1Name,
      gender: 'male',
      nationality: 'England',
      archetype: 'balanced'
    });

    let p2: Player;
    let legs = bestOfLegs;

    if (matchMode === 'calibration') {
      // 3-leg assessment match against benchmark test opponent
      p2 = factory.createAIOpponent('amateur', 'Benchmark Bot');
      legs = 3;
    } else if (matchMode === 'vs_cpu') {
      p2 = factory.createAIOpponent(cpuTier);
    } else {
      p2 = factory.createPlayer({
        name: player2Name,
        gender: 'male',
        nationality: 'Scotland',
        archetype: 'balanced'
      }, `p2-${Date.now()}`);
    }

    onStartMatch(p1, p2, matchMode === 'local_2p', legs, matchMode === 'calibration', isHybrid);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-2xl font-black text-white">Single Match Exhibition</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Standalone 501 match outside of career mode</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Menu
        </button>
      </div>

      {/* Mode Switcher: VS CPU / Local 2P / Calibration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setMatchMode('vs_cpu')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${matchMode === 'vs_cpu' ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'}`}
        >
          <Bot className="w-5 h-5 text-amber-400 mb-2" />
          <div>
            <span className="block font-bold text-xs text-white">Play vs CPU</span>
            <span className="text-[11px] text-neutral-500">Pick any AI difficulty</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMatchMode('calibration')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${matchMode === 'calibration' ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'}`}
        >
          <Gauge className="w-5 h-5 text-emerald-400 mb-2" />
          <div>
            <span className="block font-bold text-xs text-emerald-300">Skill Calibration (3 Legs)</span>
            <span className="text-[11px] text-neutral-500">Find your recommended tier</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMatchMode('local_2p')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${matchMode === 'local_2p' ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'}`}
        >
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <div>
            <span className="block font-bold text-xs text-white">Local 2-Player</span>
            <span className="text-[11px] text-neutral-500">Pass-and-play oche</span>
          </div>
        </button>
      </div>

      {matchMode === 'calibration' && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
          <span className="font-bold block">🎯 3-Leg Skill Assessment</span>
          <p className="text-neutral-300 text-[11px]">
            Throw 3 legs of 501. The game will analyse your 3-dart average, double checkout percentage, and scoring consistency, then give you an exact suggested difficulty for Career Mode and Singles matches.
          </p>
        </div>
      )}

      {/* Players Setup */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2">
            Player Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"
            />
          </div>
        </div>

        {matchMode === 'local_2p' && (
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2">
              Player 2 Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"
              />
            </div>
          </div>
        )}

        {matchMode === 'vs_cpu' && (
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2">
              CPU Opponent Difficulty
            </label>
            <select
              value={cpuTier}
              onChange={(e) => setCpuTier(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-white"
            >
              <option value="pub">Pub Level (Avg ~40-48)</option>
              <option value="amateur">Amateur Circuit (Avg ~48-58)</option>
              <option value="semi_pro">Semi-Pro (Avg ~60-72)</option>
              <option value="pro">PDC Pro Tour (Avg ~75-85)</option>
              <option value="elite">World Elite (Avg ~90-100)</option>
            </select>
          </div>
        )}

        {matchMode !== 'calibration' && (
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2">
              Match Length
            </label>
            <select
              value={bestOfLegs}
              onChange={(e) => setBestOfLegs(parseInt(e.target.value, 10))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-white"
            >
              <option value="1">Single Leg (1st to 1)</option>
              <option value="3">Best of 3 Legs (1st to 2)</option>
              <option value="5">Best of 5 Legs (1st to 3)</option>
              <option value="7">Best of 7 Legs (1st to 4)</option>
              <option value="9">Best of 9 Legs (1st to 5)</option>
            </select>
          </div>
        )}

        {/* Real Dartboard Companion Mode Toggle */}
        <div
          onClick={() => setIsHybrid(!isHybrid)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            isHybrid
              ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🎯 Real Dartboard Hybrid Companion</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">V1</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Throw darts at your physical board at home while the CPU plays on screen.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isHybrid}
            onChange={() => {}}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-900 border-neutral-700 pointer-events-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleLaunch}
        className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-current" />
        {matchMode === 'calibration' ? 'Begin 3-Leg Assessment' : 'Step to the Oche (Play Match)'}
      </button>
    </div>
  );
};
