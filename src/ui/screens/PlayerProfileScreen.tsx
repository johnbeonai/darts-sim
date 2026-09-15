import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { CareerManager } from '../../core/career/CareerManager';
import {
  User, Shield, Flame, BatteryCharging, Sparkles,
  Award, ArrowLeft, Target, Dumbbell, Zap,
  CheckCircle2, Layers, HeartPulse, Globe, AlertTriangle
} from 'lucide-react';

interface PlayerProfileScreenProps {
  player: Player;
  secondPlayer?: Player | null;
  career?: CareerManager | null;
  onBack: () => void;
  onViewFullCalendar?: () => void;
}

export const PlayerProfileScreen: React.FC<PlayerProfileScreenProps> = ({
  player: initialPlayer,
  secondPlayer,
  career,
  onBack,
}) => {
  const [activePlayer, setActivePlayer] = useState<Player>(initialPlayer);
  const player = activePlayer;

  const is2P = Boolean(secondPlayer);
  const isP2 = is2P && activePlayer.id === secondPlayer?.id;

  // Overall rating calculation (mean of 5 core visible attributes)
  const ovr = Math.round(
    (player.attributes.scoring +
      player.attributes.doubling +
      player.attributes.consistency +
      player.attributes.pressure +
      player.attributes.stamina) / 5
  );

  const rankInfo = career ? career.ranking.getPlayerRank(player.id) : null;
  const currentRank = rankInfo ? rankInfo.currentRank : (player.ranking || 128);
  const rankChange = rankInfo ? rankInfo.rankChange : 0;

  const winRate = player.stats.matchesPlayed > 0
    ? Math.round((player.stats.matchesWon / player.stats.matchesPlayed) * 100)
    : 0;

  const attributesList = [
    {
      label: 'Scoring Power',
      val: player.attributes.scoring,
      desc: 'Treble 20 grouping consistency & ability to pile up 100+, 140+ and maximum 180 visits.',
      icon: Target,
    },
    {
      label: 'Doubling & Finishing',
      val: player.attributes.doubling,
      desc: 'Outer ring precision on critical checkout attempts and outer wire margin of error.',
      icon: CheckCircle2,
    },
    {
      label: 'Consistency & Grouping',
      val: player.attributes.consistency,
      desc: 'Scatter tightness around target. Prevents wild darts slipping into 1s and 5s.',
      icon: Layers,
    },
    {
      label: 'Pressure Composure',
      val: player.attributes.pressure,
      desc: 'Clutch performance in deciding legs, tournament match darts, and televised arenas.',
      icon: HeartPulse,
    },
    {
      label: 'Physical Stamina',
      val: player.attributes.stamina,
      desc: 'Resistance against arm fatigue across extended sets and multi-round tournament days.',
      icon: Dumbbell,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* 2-Player Switcher Tabs (if applicable) */}
      {secondPlayer && (
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActivePlayer(initialPlayer)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePlayer.id === initialPlayer.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{initialPlayer.name} (P1)</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlayer(secondPlayer)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePlayer.id === secondPlayer.id
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{secondPlayer.name} (P2)</span>
          </button>
        </div>
      )}

      {/* Hero Header Card */}
      <div className={`bg-slate-900/60 backdrop-blur-md border shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 transition-all duration-500 ${
        isP2 ? 'border-purple-500/40' : 'border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-all duration-500 shrink-0 ${
              isP2
                ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white ring-2 ring-purple-400/40'
                : 'bg-gradient-to-br from-amber-500 to-amber-700 text-black ring-2 ring-amber-400/40'
            }`}>
              {player.name.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{player.name}</h2>
                {is2P && (
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                    isP2 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {isP2 ? 'Player 2' : 'Player 1'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{player.nationality}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                  {`${player.age} Years Old`}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-black uppercase text-amber-300 tracking-wider">
                  {player.tier} Tier
                </span>

                {player.hasTourCard ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-300 flex items-center gap-1">
                    <span>🎖️ PDC Tour Card</span>
                    <span className="text-emerald-400/80 font-normal">thru {player.tourCardExpiryYear || (career ? career.calendar.currentYear + 1 : 2027)}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-400">
                    Q-School Hopeful
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-2 active:scale-[0.98] shadow-sm self-start sm:self-auto shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Injury Alert if active */}
        {player.hasActiveInjury && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-300 block">Active Injury</span>
                <span className="text-xs text-rose-200/90">{player.activeInjuries.map(i => i.name).join(', ')}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
              Throwing Penalty
            </span>
          </div>
        )}

        {/* Key Athletic Snapshot Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          <div className="bg-gradient-to-br from-amber-500/15 via-white/5 to-white/5 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">Overall Skill</span>
              <span className="text-2xl font-black font-mono text-white mt-0.5 block">{ovr}</span>
            </div>
            <span className="text-xs font-black font-mono text-amber-400 bg-amber-400/20 px-2 py-1 rounded-lg border border-amber-400/30">
              OVR
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">PDC Ranking</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black font-mono text-white">#{currentRank}</span>
                {rankChange > 0 && (
                  <span className="text-xs font-bold text-emerald-400">▲{rankChange}</span>
                )}
                {rankChange < 0 && (
                  <span className="text-xs font-bold text-rose-400">▼{Math.abs(rankChange)}</span>
                )}
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-400/60" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">3-Dart Avg</span>
              <span className="text-2xl font-black font-mono text-cyan-400 mt-0.5 block">
                {player.careerAverage > 0 ? player.careerAverage : '—'}
              </span>
            </div>
            <Target className="w-5 h-5 text-cyan-400/60" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Bankroll</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5 block">
                £{player.bankBalance.toLocaleString()}
              </span>
            </div>
            <Shield className="w-5 h-5 text-emerald-400/60" />
          </div>
        </div>
      </div>

      {/* Condition & Match Readiness Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Confidence */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Match Confidence</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-black text-amber-400">{player.state.confidence}%</span>
            <span className="text-xs text-slate-400 font-medium">Clutch Doubles</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, player.state.confidence))}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Current Form & Sharpness</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-black text-cyan-400">{player.state.form}%</span>
            <span className="text-xs text-slate-400 font-medium">Streak Multiplier</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, player.state.form))}%` }}
            />
          </div>
        </div>

        {/* Fatigue */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Fatigue Load</span>
            <BatteryCharging className={`w-5 h-5 ${player.state.fatigue > 60 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-mono font-black ${player.state.fatigue > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {player.state.fatigue}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {player.state.fatigue > 60 ? 'Exhausted' : 'Fresh Condition'}
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                player.state.fatigue > 60
                  ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, player.state.fatigue))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Athletic Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Visible Core Darts Attributes (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-black text-white">Core Darts Attributes</h3>
                <p className="text-xs text-slate-400">Official PDC player performance ratings (0 - 100 scale)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-300">
              5 Core Ratings
            </span>
          </div>

          <div className="space-y-3">
            {attributesList.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-3.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl space-y-2 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-white">{stat.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-mono font-black px-2 py-0.5 rounded border ${
                        stat.val >= 85
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-black'
                          : stat.val >= 70
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : stat.val >= 55
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}>
                        {stat.val}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.val >= 85
                          ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                          : stat.val >= 70
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                          : stat.val >= 55
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-400'
                          : 'bg-gradient-to-r from-slate-600 to-slate-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, stat.val))}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">{stat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Statistics, Equipment & Development (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Career Track Record & Stats Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">Career Statistics</h4>
              </div>
              <span className="text-xs font-mono text-slate-400">{player.stats.matchesPlayed} Matches</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">3-Dart Avg</span>
                <span className="text-xl font-mono font-black text-cyan-400 mt-0.5 block">
                  {player.careerAverage > 0 ? player.careerAverage : '—'}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Win Rate</span>
                <span className="text-xl font-mono font-black text-emerald-400 mt-0.5 block">{winRate}%</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total 180s</span>
                <span className="text-xl font-mono font-black text-amber-400 mt-0.5 block">{player.stats.total180s}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">High Finish</span>
                <span className="text-xl font-mono font-black text-purple-400 mt-0.5 block">
                  {player.stats.highestCheckout > 0 ? player.stats.highestCheckout : '—'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Match Record</span>
                <span className="font-mono font-bold">
                  {player.stats.matchesWon}W - {Math.max(0, player.stats.matchesPlayed - player.stats.matchesWon)}L
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Legs Record</span>
                <span className="font-mono font-bold">
                  {player.stats.legsWon}W - {Math.max(0, player.stats.legsPlayed - player.stats.legsWon)}L
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Power Visits (140+ / 100+)</span>
                <span className="font-mono font-bold">{player.stats.total140s} / {player.stats.total100s}</span>
              </div>
            </div>
          </div>

          {/* Active Equipment Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">Active Match Darts</h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{player.equipment.weightGrams}g Tungsten</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Loaded Barrels</span>
              <span className="text-sm font-bold text-white block">{player.equipment.name}</span>
              <span className="text-[11px] text-amber-400 font-mono block font-semibold">{player.equipment.weightGrams}g Weight</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Modifies release trajectory, grouping variance, and doubling touch. Upgrades available in Pro Shop.
            </p>
          </div>

          {/* Development & Potential Profile */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">Development Ceiling</h4>
              </div>
              <span className="text-xs font-mono text-amber-400">Ceiling {player.attributes.potential}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Career Potential</span>
                <span className="font-mono font-black text-amber-400">{player.attributes.potential} / 100</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Work Ethic &amp; Training</span>
                <span className="font-mono font-black text-white">{player.attributes.workEthic} / 100</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Professional Temperament</span>
                <span className="font-mono font-black text-white">{player.attributes.professionalism} / 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
