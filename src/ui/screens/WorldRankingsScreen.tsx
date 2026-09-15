import React, { useState } from 'react';
import { CareerManager } from '../../core/career/CareerManager';
import { CareerTier } from '../../core/player/Player';
import {
  Trophy, Search, ArrowUp, ArrowDown, Minus,
  ChevronLeft, Award, Globe, Flame, Shield, User, Users, AlertTriangle, Sparkles, TrendingDown
} from 'lucide-react';

interface WorldRankingsScreenProps {
  career: CareerManager;
  onBack: () => void;
}

type FilterView = 'all' | 'top16' | 'top32' | 'top64' | 'relegation' | CareerTier;

export const WorldRankingsScreen: React.FC<WorldRankingsScreenProps> = ({
  career,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterView>('all');

  const p1 = career.players[0];
  const p2 = career.isTwoPlayer && career.players.length > 1 ? career.players[1] : null;

  const p1Rank = career.ranking.getPlayerRank(p1.id);
  const p2Rank = p2 ? career.ranking.getPlayerRank(p2.id) : null;

  let rankings = career.ranking.getRankings();

  // Filter by view selection
  if (selectedFilter === 'top16') {
    rankings = rankings.filter(r => r.currentRank <= 16);
  } else if (selectedFilter === 'top32') {
    rankings = rankings.filter(r => r.currentRank <= 32);
  } else if (selectedFilter === 'top64') {
    rankings = rankings.filter(r => r.currentRank <= 64);
  } else if (selectedFilter === 'relegation') {
    rankings = rankings.filter(r => r.currentRank > 64 && r.currentRank <= 128);
  } else if (selectedFilter !== 'all') {
    rankings = rankings.filter(r => r.tier === selectedFilter);
  }

  // Filter by search term
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    rankings = rankings.filter(r =>
      r.playerName.toLowerCase().includes(q) ||
      r.nationality.toLowerCase().includes(q)
    );
  }

  const worldNumberOne = career.ranking.getRankings({ limit: 1 })[0];
  const cutoffs = career.ranking.getCutoffBoundaries();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Glassmorphic Navigation Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official PDC 2-Year Rolling Order of Merit • Week {career.calendar.currentWeek}, {career.calendar.currentYear}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide pt-1">
              WORLD RANKINGS & TOUR SEEDS
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-2 self-start sm:self-auto shadow"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Snapshot Cards: World #1, Player Ranks, and Tour Card Cutoff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* World Number 1 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-amber-500/30 shadow-xl rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              World Number One
            </span>
            <h4 className="text-base font-black text-white mt-1 truncate max-w-[150px]">
              {worldNumberOne?.playerName ?? 'Elite Champion'}
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
              £{worldNumberOne?.prizeMoney.toLocaleString() ?? '0'}
            </span>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            #1
          </div>
        </div>

        {/* Player 1 Rank */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-amber-500/50 shadow-xl rounded-2xl p-4 flex items-center justify-between ring-1 ring-amber-500/20">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Player 1: {p1.name}
            </span>
            <h4 className="text-base font-black text-white mt-1">
              Rank #{p1Rank?.currentRank ?? '—'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-emerald-400">
                £{p1Rank?.rollingPrizeMoney ? p1Rank.rollingPrizeMoney.toLocaleString() : p1.prizeMoneyTotal.toLocaleString()}
              </span>
              {p1Rank?.defendingPrizeMoney && p1Rank.defendingPrizeMoney > 0 ? (
                <span className="text-[10px] text-amber-400/90 font-mono">
                  (Defending: £{p1Rank.defendingPrizeMoney.toLocaleString()})
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {p1Rank && p1Rank.rankChange > 0 && (
              <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                {p1Rank.rankChange}
              </span>
            )}
            {p1Rank && p1Rank.rankChange < 0 && (
              <span className="text-xs font-bold text-rose-400 flex items-center bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                {Math.abs(p1Rank.rankChange)}
              </span>
            )}
            {(!p1Rank || p1Rank.rankChange === 0) && (
              <span className="text-xs font-bold text-slate-500 flex items-center bg-white/5 px-2 py-1 rounded-lg">
                <Minus className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Player 2 Rank (if 2P) or Top 16 Major Cutoff */}
        {p2 ? (
          <div className="bg-slate-900/60 backdrop-blur-md border border-purple-500/40 shadow-xl rounded-2xl p-4 flex items-center justify-between ring-1 ring-purple-500/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Player 2: {p2.name}
              </span>
              <h4 className="text-base font-black text-white mt-1">
                Rank #{p2Rank?.currentRank ?? '—'}
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                £{p2Rank?.rollingPrizeMoney ? p2Rank.rollingPrizeMoney.toLocaleString() : p2.prizeMoneyTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {p2Rank && p2Rank.rankChange > 0 && (
                <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                  {p2Rank.rankChange}
                </span>
              )}
              {p2Rank && p2Rank.rankChange < 0 && (
                <span className="text-xs font-bold text-rose-400 flex items-center bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                  {Math.abs(p2Rank.rankChange)}
                </span>
              )}
              {(!p2Rank || p2Rank.rankChange === 0) && (
                <span className="text-xs font-bold text-slate-500 flex items-center bg-white/5 px-2 py-1 rounded-lg">
                  <Minus className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                👑 Top 16 Major Seed Line
              </span>
              <h4 className="text-base font-black text-white mt-1">
                Televised Major Cutoff
              </h4>
              <span className="text-xs font-mono font-bold text-slate-300 block mt-0.5">
                Boundary: £{cutoffs.top16CutoffMoney.toLocaleString()}
              </span>
            </div>
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              #16
            </span>
          </div>
        )}

        {/* Top 64 Tour Card Survival Safety Line */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-sky-500/30 shadow-xl rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Tour Card Safety Line
            </span>
            <h4 className="text-base font-black text-white mt-1">
              Top 64 Retention
            </h4>
            <span className="text-xs font-mono font-bold text-slate-300 block mt-0.5">
              Safety Cutoff: £{cutoffs.top64CutoffMoney.toLocaleString()}
            </span>
          </div>
          <span className="text-xs font-mono font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30">
            #64
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter View Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Players' },
            { id: 'top16', label: '👑 Top 16 (Majors)' },
            { id: 'top32', label: '⭐ Top 32 (Seeds)' },
            { id: 'top64', label: '🛡️ Top 64 (Card Safe)' },
            { id: 'relegation', label: '⚠️ Danger Zone (65+)' },
            { id: 'pro', label: 'Pro Tour' },
            { id: 'semi_pro', label: 'Semi-Pro' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id as FilterView)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player or nation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Order of Merit Table */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-3 w-16 text-center">Move</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Nation</th>
                <th className="py-3.5 px-3">Tour Tier</th>
                <th className="py-3.5 px-4 text-right">Defending (12w)</th>
                <th className="py-3.5 px-4 text-right">2-Year Rolling OOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rankings.map((entry, idx) => {
                const isP1 = entry.playerId === p1.id;
                const isP2 = p2 ? entry.playerId === p2.id : false;

                // Visual boundary lines
                const showTop16Divider = selectedFilter === 'all' && entry.currentRank === 17 && idx > 0;
                const showTop32Divider = selectedFilter === 'all' && entry.currentRank === 33 && idx > 0;
                const showTop64Divider = selectedFilter === 'all' && entry.currentRank === 65 && idx > 0;

                return (
                  <React.Fragment key={entry.playerId}>
                    {showTop16Divider && (
                      <tr className="bg-amber-500/15 border-y border-amber-500/40">
                        <td colSpan={7} className="py-2 px-4 text-center text-xs font-black text-amber-300 uppercase tracking-widest">
                          👑 Top 16 Automatic Televised Major Cutoff Line
                        </td>
                      </tr>
                    )}
                    {showTop32Divider && (
                      <tr className="bg-emerald-500/15 border-y border-emerald-500/40">
                        <td colSpan={7} className="py-2 px-4 text-center text-xs font-black text-emerald-300 uppercase tracking-widest">
                          ⭐ Top 32 Seeded Tournament Cutoff Line
                        </td>
                      </tr>
                    )}
                    {showTop64Divider && (
                      <tr className="bg-rose-500/20 border-y border-rose-500/50">
                        <td colSpan={7} className="py-2 px-4 text-center text-xs font-black text-rose-300 uppercase tracking-widest flex items-center justify-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Top 64 PDC Tour Card Cutoff Line • Ranks Below Face Relegation to Q-School</span>
                        </td>
                      </tr>
                    )}

                    <tr
                      className={`transition-colors ${
                        isP1
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 border-l-4 border-l-amber-500'
                          : isP2
                          ? 'bg-purple-500/10 hover:bg-purple-500/20 border-l-4 border-l-purple-500'
                          : entry.currentRank <= 16
                          ? 'hover:bg-white/[0.04] bg-white/[0.01]'
                          : entry.currentRank > 64
                          ? 'hover:bg-white/[0.04] bg-rose-950/10'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                        <span className={
                          entry.currentRank <= 3
                            ? 'text-amber-400 font-black text-base'
                            : entry.currentRank <= 16
                            ? 'text-amber-300 font-bold'
                            : entry.currentRank <= 64
                            ? 'text-white'
                            : 'text-rose-400 font-semibold'
                        }>
                          #{entry.currentRank}
                        </span>
                      </td>

                      {/* Movement */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        {entry.rankChange > 0 && (
                          <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                            <ArrowUp className="w-3 h-3 mr-0.5" />
                            {entry.rankChange}
                          </span>
                        )}
                        {entry.rankChange < 0 && (
                          <span className="inline-flex items-center text-rose-400 font-bold text-[11px]">
                            <ArrowDown className="w-3 h-3 mr-0.5" />
                            {Math.abs(entry.rankChange)}
                          </span>
                        )}
                        {entry.rankChange === 0 && (
                          <span className="text-slate-600 font-bold">
                            —
                          </span>
                        )}
                      </td>

                      {/* Player Name */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isP1
                              ? 'bg-amber-500 text-slate-950'
                              : isP2
                              ? 'bg-purple-500 text-white'
                              : entry.currentRank <= 16
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 text-slate-300'
                          }`}>
                            {entry.playerName.charAt(0)}
                          </div>
                          <div>
                            <span className={`text-sm ${isP1 ? 'text-amber-300 font-black' : isP2 ? 'text-purple-300 font-black' : 'text-white'}`}>
                              {entry.playerName}
                            </span>
                            {isP1 && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                                Player 1
                              </span>
                            )}
                            {isP2 && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-black uppercase tracking-wider shadow">
                                Player 2
                              </span>
                            )}
                            {entry.currentRank <= 16 && !isP1 && !isP2 && (
                              <span className="ml-2 text-[9px] uppercase font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                Major Seed
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nationality */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {entry.nationality}
                      </td>

                      {/* Tour Tier */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                          {entry.tier}
                        </span>
                      </td>

                      {/* Defending Prize Money (in upcoming weeks) */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs">
                        {entry.defendingPrizeMoney && entry.defendingPrizeMoney > 0 ? (
                          <span className="text-amber-400 font-bold flex items-center justify-end gap-1">
                            <TrendingDown className="w-3 h-3 text-amber-400" />
                            £{entry.defendingPrizeMoney.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-600">£0</span>
                        )}
                      </td>

                      {/* Official 2-Year Rolling Prize Money */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                        £{entry.prizeMoney.toLocaleString()}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
