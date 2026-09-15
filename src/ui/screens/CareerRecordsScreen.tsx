import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { CareerManager } from '../../core/career/CareerManager';
import { TrophyAward, TROPHY_CATALOG } from '../../core/trophies/Trophy';
import { ACHIEVEMENT_CATALOG, AchievementManager } from '../../core/achievements/Achievement';
import { HeadToHeadRecord, RivalryStatus } from '../../core/rivalry/RivalryManager';
import {
  Trophy, Award, TrendingUp, DollarSign, Target,
  ArrowLeft, Flame, Star, CheckCircle, BarChart3, Users,
  Swords, Shield, Search, Zap, Crown, Sparkles, Filter, Lock
} from 'lucide-react';

interface CareerRecordsScreenProps {
  career: CareerManager;
  onBack: () => void;
}

type RecordsTab = 'stats' | 'trophies' | 'achievements' | 'rivalries' | 'hall_of_fame';

export const CareerRecordsScreen: React.FC<CareerRecordsScreenProps> = ({ career, onBack }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(career.activePlayerIndex);
  const [activeTab, setActiveTab] = useState<RecordsTab>('stats');
  const [trophyFilter, setTrophyFilter] = useState<'all' | 'major' | 'pro_tour' | 'pub_amateur'>('all');
  const [rivalrySearch, setRivalrySearch] = useState<string>('');
  const [rivalryStatusFilter, setRivalryStatusFilter] = useState<string>('all');

  const p = career.players[selectedIdx] || career.player;
  const stats = p.stats;

  const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;
  const legWinRate = stats.legsPlayed > 0 ? Math.round((stats.legsWon / stats.legsPlayed) * 100) : 0;

  // In official darts, highest possible checkout is 170 (T20, T20, Bull).
  const safeCheckout = (stats.highestCheckout > 0 && stats.highestCheckout <= 170) ? stats.highestCheckout : 0;

  // 1. Trophy Data
  const playerTrophies = (career.trophyAwards || []).filter(t => t.playerId === p.id);
  const filteredTrophies = playerTrophies.filter(t => {
    if (trophyFilter === 'major') return t.tier === 'major';
    if (trophyFilter === 'pro_tour') return t.tier === 'pro_tour' || t.tier === 'european_tour';
    if (trophyFilter === 'pub_amateur') return t.tier === 'pub' || t.tier === 'amateur' || t.tier === 'challenge' || t.tier === 'special';
    return true;
  });

  const majorTrophyCount = playerTrophies.filter(t => t.tier === 'major').length;
  const proTourTrophyCount = playerTrophies.filter(t => t.tier === 'pro_tour' || t.tier === 'european_tour').length;

  // 2. Achievement Data
  const achievementsMap = (career.playerAchievements && career.playerAchievements[p.id])
    || AchievementManager.initPlayerAchievements();
  const achievementList = Object.values(ACHIEVEMENT_CATALOG);
  const unlockedAchievementsCount = achievementList.filter(def => achievementsMap[def.id]?.unlocked).length;

  // 3. Rivalry Data
  const h2hDict = (career.rivalryLedger && career.rivalryLedger[p.id]) || {};
  const allRivals: HeadToHeadRecord[] = Object.values(h2hDict).sort((a, b) => b.matchesPlayed - a.matchesPlayed);

  const filteredRivals = allRivals.filter(r => {
    const matchesSearch = r.opponentName.toLowerCase().includes(rivalrySearch.toLowerCase());
    const matchesStatus = rivalryStatusFilter === 'all' || r.status === rivalryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const nemesisCount = allRivals.filter(r => r.status === 'nemesis').length;
  const classicCount = allRivals.filter(r => r.status === 'classic' || r.status === 'heated').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Career Records & Honours</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Official Ledger
              </span>
            </div>
            <p className="text-xs text-neutral-400">Audited match statistics, silverware showroom, milestone achievements & rivalries</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 2-Player Switcher */}
          {career.isTwoPlayer && career.players.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl">
              {career.players.map((pl, idx) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedIdx === idx
                      ? idx === 0
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-cyan-500 text-black shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{pl.name}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance Statistics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trophies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'trophies'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Trophy Cabinet</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeTab === 'trophies' ? 'bg-black/30 text-black' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {playerTrophies.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'achievements'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Milestones & Badges</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeTab === 'achievements' ? 'bg-black/30 text-black' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {unlockedAchievementsCount}/{achievementList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rivalries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'rivalries'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Rivalry Ledger</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeTab === 'rivalries' ? 'bg-black/30 text-black' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {allRivals.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hall_of_fame')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'hall_of_fame'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Hall of Fame & 9-Darters</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeTab === 'hall_of_fame' ? 'bg-black/30 text-black' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {stats.nineDarters || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: STATISTICS & EFFICIENCY */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Hero Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
                <span>Career Average</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-3xl font-mono font-black text-amber-400">{p.careerAverage}</span>
              <span className="text-[11px] text-neutral-500 block mt-1">{stats.dartsThrown.toLocaleString()} darts thrown</span>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
                <span>Highest Checkout</span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-black text-emerald-400">
                  {safeCheckout > 0 ? safeCheckout : '—'}
                </span>
                {safeCheckout === 170 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    The Big Fish!
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 block mt-1">
                {safeCheckout === 170 ? 'Maximum 170 finish achieved' : safeCheckout > 0 ? 'Best match checkout (Max 170)' : 'No checkout registered yet'}
              </span>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
                <span>Match Record</span>
                <Award className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-3xl font-mono font-black text-white">
                {stats.matchesWon} <span className="text-base text-neutral-500 font-normal">/ {stats.matchesPlayed}</span>
              </span>
              <span className="text-[11px] text-blue-400 font-bold block mt-1">{winRate}% win rate</span>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
                <span>Career Prize Money</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-3xl font-mono font-black text-amber-400">£{p.prizeMoneyTotal.toLocaleString()}</span>
              <span className="text-[11px] text-neutral-500 block mt-1">{p.rankingPoints.toLocaleString()} Order of Merit pts</span>
            </div>
          </div>

          {/* Heavy Scoring Breakdown */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg text-white">Heavy Scoring Milestones</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block font-semibold">180s Hit (Maximums)</span>
                  <span className="text-3xl font-mono font-black text-amber-400 mt-1 block">{stats.total180s}</span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Classic maximum visits</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-black text-lg">
                  180
                </div>
              </div>

              <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block font-semibold">140+ Power Visits</span>
                  <span className="text-3xl font-mono font-black text-blue-400 mt-1 block">{stats.total140s}</span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Visits scoring 140 to 177</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-black text-lg">
                  140+
                </div>
              </div>

              <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block font-semibold">100+ Ton Visits</span>
                  <span className="text-3xl font-mono font-black text-emerald-400 mt-1 block">{stats.total100s}</span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Visits scoring 100 to 139</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-black text-lg">
                  100+
                </div>
              </div>
            </div>
          </div>

          {/* Leg & Efficiency Analysis */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg text-white">Leg Breakdown & Finishing Efficiency</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-2xl font-mono font-black text-white">{stats.legsPlayed}</span>
                <span className="text-xs text-neutral-500 block mt-1">Total Legs Played</span>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-2xl font-mono font-black text-emerald-400">{stats.legsWon}</span>
                <span className="text-xs text-neutral-500 block mt-1">Legs Won</span>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-2xl font-mono font-black text-rose-400">{stats.legsPlayed - stats.legsWon}</span>
                <span className="text-xs text-neutral-500 block mt-1">Legs Conceded</span>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800">
                <span className="text-2xl font-mono font-black text-blue-400">{legWinRate}%</span>
                <span className="text-xs text-neutral-500 block mt-1">Leg Win Ratio</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TROPHY CABINET */}
      {activeTab === 'trophies' && (
        <div className="space-y-6">
          {/* Summary & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-5 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{p.name}'s Silverware Collection</h3>
                <p className="text-xs text-neutral-400">
                  {playerTrophies.length} Total Titles • {majorTrophyCount} Televised Majors • {proTourTrophyCount} ProTour Shields
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setTrophyFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trophyFilter === 'all' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({playerTrophies.length})
              </button>
              <button
                type="button"
                onClick={() => setTrophyFilter('major')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trophyFilter === 'major' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Majors ({majorTrophyCount})
              </button>
              <button
                type="button"
                onClick={() => setTrophyFilter('pro_tour')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trophyFilter === 'pro_tour' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                ProTour ({proTourTrophyCount})
              </button>
              <button
                type="button"
                onClick={() => setTrophyFilter('pub_amateur')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trophyFilter === 'pub_amateur' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Grassroots
              </button>
            </div>
          </div>

          {/* Trophy Grid */}
          {filteredTrophies.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/40">
              <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-neutral-300">No Silverware in This Category Yet</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                Compete in weekly knockouts, ProTour floor events, and televised majors to lift authentic trophies.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrophies.map((trophy) => {
                const isMajor = trophy.tier === 'major';
                const isProTour = trophy.tier === 'pro_tour' || trophy.tier === 'european_tour';

                return (
                  <div
                    key={trophy.id}
                    className={`relative overflow-hidden rounded-3xl p-5 border transition-all hover:scale-[1.01] shadow-xl ${
                      isMajor
                        ? 'bg-gradient-to-b from-amber-500/15 via-neutral-900 to-neutral-950 border-amber-500/40 shadow-amber-500/10'
                        : isProTour
                        ? 'bg-gradient-to-b from-cyan-500/10 via-neutral-900 to-neutral-950 border-cyan-500/30 shadow-cyan-500/5'
                        : 'bg-gradient-to-b from-neutral-800/20 via-neutral-900 to-neutral-950 border-neutral-800'
                    }`}
                  >
                    {/* Header Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isMajor
                          ? 'bg-amber-500 text-black font-black'
                          : isProTour
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {trophy.tier.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Week {trophy.week}, {trophy.year}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-3.5 my-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                        isMajor
                          ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-black shadow-amber-500/30'
                          : isProTour
                          ? 'bg-gradient-to-tr from-cyan-600 to-cyan-400 text-black shadow-cyan-500/30'
                          : 'bg-neutral-800 border border-neutral-700'
                      }`}>
                        {trophy.icon || '🏆'}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-white leading-tight">{trophy.trophyName}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5 font-medium">{trophy.tournamentName}</p>
                      </div>
                    </div>

                    {/* Lore description */}
                    <p className="text-[11px] text-neutral-400 italic bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 mb-3 line-clamp-2">
                      "{trophy.description}"
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                      <span className="text-neutral-500">{trophy.venue || 'Circuit Arena'}</span>
                      <span className="font-mono font-bold text-amber-400">
                        £{trophy.prizeWon ? trophy.prizeWon.toLocaleString() : '0'} Prize
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MILESTONES & BADGES */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                ⭐
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Historic Darts Milestones</h3>
                <p className="text-xs text-neutral-400">
                  {unlockedAchievementsCount} of {achievementList.length} achievements unlocked ({Math.round((unlockedAchievementsCount / achievementList.length) * 100)}%)
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-40 hidden sm:block">
              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedAchievementsCount / achievementList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementList.map((def) => {
              const prog = achievementsMap[def.id] || { achievementId: def.id, unlocked: false, currentProgress: 0 };
              const isUnlocked = prog.unlocked;

              return (
                <div
                  key={def.id}
                  className={`relative rounded-3xl p-5 border transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-neutral-900/50 border-neutral-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-black shadow-amber-500/20'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}>
                        {def.badgeIcon}
                      </div>
                      <div>
                        <h4 className={`font-black text-sm ${isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                          {def.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          {def.category}
                        </span>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-500 border border-neutral-700 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400 mt-3">
                    {def.description}
                  </p>

                  {/* Progress Bar or Unlock Date */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px]">
                    {isUnlocked ? (
                      <div className="text-amber-400/90 font-medium">
                        {prog.details ? prog.details : `Unlocked Week ${prog.unlockedAtWeek}, ${prog.unlockedAtYear}`}
                      </div>
                    ) : def.targetProgress > 1 ? (
                      <div>
                        <div className="flex justify-between text-neutral-500 mb-1">
                          <span>Progress</span>
                          <span className="font-mono">{prog.currentProgress.toLocaleString()} / {def.targetProgress.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className="bg-neutral-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, (prog.currentProgress / def.targetProgress) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-500 italic">Complete match requirement to unlock</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RIVALRY LEDGER (HEAD-TO-HEAD) */}
      {activeTab === 'rivalries' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{p.name}'s Head-to-Head Rivalry Ledger</h3>
                  <p className="text-xs text-neutral-400">
                    {allRivals.length} Opponents Faced • {nemesisCount} Nemesis Threats • {classicCount} Epic Rivalries
                  </p>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRivalryStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    rivalryStatusFilter === 'all' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({allRivals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRivalryStatusFilter('nemesis')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    rivalryStatusFilter === 'nemesis' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Nemesis ({nemesisCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRivalryStatusFilter('classic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    rivalryStatusFilter === 'classic' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Classic
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rivalrySearch}
                onChange={(e) => setRivalrySearch(e.target.value)}
                placeholder="Search rivals by name..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Rivals List */}
          {filteredRivals.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/40">
              <Swords className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-neutral-300">No Opponents in This Filter</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                Compete against circuit players and tournament rivals to build your competitive head-to-head history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRivals.map((record) => {
                const total = record.matchesPlayed;
                const winPct = total > 0 ? Math.round((record.playerWins / total) * 100) : 0;
                const isNemesis = record.status === 'nemesis';
                const isClassic = record.status === 'classic';
                const isDominated = record.status === 'dominated';

                return (
                  <div
                    key={record.opponentId}
                    className={`rounded-3xl p-5 border transition-all shadow-lg ${
                      isNemesis
                        ? 'bg-gradient-to-b from-rose-950/20 via-neutral-900 to-neutral-950 border-rose-500/40'
                        : isClassic
                        ? 'bg-gradient-to-b from-amber-950/20 via-neutral-900 to-neutral-950 border-amber-500/40'
                        : isDominated
                        ? 'bg-gradient-to-b from-emerald-950/20 via-neutral-900 to-neutral-950 border-emerald-500/30'
                        : 'bg-neutral-900/80 border-neutral-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base text-white">{record.opponentName}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-800 text-neutral-400 uppercase">
                            {record.opponentTier}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          Last played: {record.lastTournamentName} (W{record.lastEncounterWeek}, {record.lastEncounterYear})
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isNemesis
                          ? 'bg-rose-500 text-white shadow-rose-500/30'
                          : isClassic
                          ? 'bg-amber-500 text-black'
                          : isDominated
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {isNemesis ? '🔥 Nemesis' : isClassic ? '⭐ Classic' : isDominated ? '✓ Dominated' : record.status}
                      </span>
                    </div>

                    {/* Win/Loss Record Bar */}
                    <div className="bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800/80 space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">{record.playerWins} Wins</span>
                        <span className="text-[11px] text-neutral-500 font-mono">{winPct}% Win Rate</span>
                        <span className="font-bold text-rose-400">{record.opponentWins} Losses</span>
                      </div>
                      <div className="w-full bg-rose-950/40 h-2.5 rounded-full overflow-hidden border border-neutral-800 flex">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${winPct}%` }}
                        />
                        <div
                          className="bg-rose-500 h-full transition-all"
                          style={{ width: `${100 - winPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
                        <span className="text-neutral-500 text-[10px] block">Leg Record</span>
                        <span className="font-mono font-bold text-white mt-0.5 block">
                          {record.legsWon} - {record.legsLost}
                        </span>
                      </div>
                      <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
                        <span className="text-neutral-500 text-[10px] block">Best H2H Avg</span>
                        <span className="font-mono font-bold text-amber-400 mt-0.5 block">
                          {record.bestAverageInH2H > 0 ? record.bestAverageInH2H.toFixed(2) : '—'}
                        </span>
                      </div>
                      <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
                        <span className="text-neutral-500 text-[10px] block">Highest Finish</span>
                        <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                          {record.highestCheckoutInH2H > 0 ? record.highestCheckoutInH2H : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Form Pills */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                      <span className="text-neutral-500 text-[11px]">Recent Encounters:</span>
                      <div className="flex items-center gap-1">
                        {record.recentResults.map((res, i) => (
                          <span
                            key={i}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                              res === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HALL OF FAME & 9-DARTER IMMORTALITY */}
      {activeTab === 'hall_of_fame' && (
        <div className="space-y-6">
          {/* Hero 9-Darter Spotlight */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-neutral-900 to-black border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                  <Zap className="w-9 h-9 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">The 9-Darter Immortals Club</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
                      Oche Perfection
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Achieving 501 in exactly 9 darts on the televised stage is the ultimate badge of darts mastery.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-black/40 border border-white/5 rounded-2xl p-4 self-start sm:self-auto">
                <div className="text-center">
                  <div className="text-3xl font-black text-amber-400">{stats.nineDarters || 0}</div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Career 9-Darters</div>
                </div>
                <div className="h-10 w-[1px] bg-neutral-800" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">
                    {(stats.nineDarters || 0) > 0 ? 'Certified Member' : 'Seeking First 9-Darter'}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {(stats.nineDarters || 0) > 0 ? 'Inducted into Club' : 'Best finish: 501 in 10-12 darts'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The Triple Crown Showcase */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">The PDC Triple Crown Wing</h4>
              </div>
              <span className="text-xs text-neutral-400">Winning darts' three greatest televised titles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const wonWorld = playerTrophies.some(t => t.tournamentName.toLowerCase().includes('world darts') || t.tournamentName.toLowerCase().includes('ally pally'));
                const wonMatchplay = playerTrophies.some(t => t.tournamentName.toLowerCase().includes('matchplay'));
                const wonPL = playerTrophies.some(t => t.tournamentName.toLowerCase().includes('premier league'));

                return (
                  <>
                    <div className={`p-4 rounded-2xl border transition-all ${
                      wonWorld ? 'bg-amber-500/10 border-amber-500/40' : 'bg-black/30 border-white/5 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">👑</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          wonWorld ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {wonWorld ? 'Secured' : 'Locked'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">World Darts Championship</div>
                      <div className="text-[11px] text-neutral-400">Sid Waddell Trophy • Alexandra Palace</div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      wonMatchplay ? 'bg-amber-500/10 border-amber-500/40' : 'bg-black/30 border-white/5 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🎯</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          wonMatchplay ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {wonMatchplay ? 'Secured' : 'Locked'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">World Matchplay</div>
                      <div className="text-[11px] text-neutral-400">Phil Taylor Trophy • Winter Gardens</div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      wonPL ? 'bg-amber-500/10 border-amber-500/40' : 'bg-black/30 border-white/5 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🏆</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          wonPL ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {wonPL ? 'Secured' : 'Locked'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">Premier League Darts</div>
                      <div className="text-[11px] text-neutral-400">Play-Off Championship • The O2 Arena</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Hall of Fame Criteria & Induction Standards */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">PDC Hall of Fame Induction Standards</h4>
              </div>
              <span className="text-xs text-neutral-400">Audited criteria for legend status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1: Career Earnings */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Career Earnings</span>
                  <span className="font-bold text-amber-400">£{p.prizeMoneyTotal.toLocaleString()} / £500k</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (p.prizeMoneyTotal / 500000) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-500">Target: £500,000+ career prize money</div>
              </div>

              {/* Metric 2: Major Titles */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Major Titles</span>
                  <span className="font-bold text-amber-400">{majorTrophyCount} / 3 Majors</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (majorTrophyCount / 3) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-500">Target: 3+ PDC televised major titles</div>
              </div>

              {/* Metric 3: Perfection or World No. 1 */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">PDC World Rank #1 or 9-Dart</span>
                  <span className={`font-bold ${p.ranking === 1 || (stats.nineDarters || 0) > 0 ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {p.ranking === 1 ? 'World #1' : (stats.nineDarters || 0) > 0 ? '9-Darter' : 'In Pursuit'}
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.ranking === 1 || (stats.nineDarters || 0) > 0 ? 'bg-emerald-500 w-full' : 'bg-neutral-700 w-1/4'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-neutral-500">Target: Reach World #1 or hit a televised 9-darter</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
