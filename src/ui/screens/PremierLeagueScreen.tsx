import React from 'react';
import { Trophy, ChevronLeft, MapPin, Calendar, CheckCircle2, Award, Sparkles, Flame } from 'lucide-react';
import { PremierLeagueManager, PREMIER_LEAGUE_VENUES, PremierLeagueStandingsEntry } from '../../core/tournament/PremierLeagueManager';
import { CareerManager } from '../../core/career/CareerManager';

interface PremierLeagueScreenProps {
  career: CareerManager;
  onBack: () => void;
  onPlayPremierLeagueNight?: () => void;
}

export const PremierLeagueScreen: React.FC<PremierLeagueScreenProps> = ({
  career,
  onBack,
  onPlayPremierLeagueNight
}) => {
  const pl = career.premierLeague;

  // Initialize season if empty
  if (pl.standings.length === 0) {
    pl.initializeSeason([...career.world.getAllAIPlayers(), ...career.players], career.player.id);
  }

  const currentNightNum = Math.min(16, pl.currentNightIndex + 1);
  const currentVenue = PREMIER_LEAGUE_VENUES[pl.currentNightIndex] || PREMIER_LEAGUE_VENUES[15];
  const isPlayOffsActive = pl.currentNightIndex === 16;
  const isSeasonFinished = pl.isPlayOffsCompleted || pl.currentNightIndex >= 17;

  const humanPlayerIds = career.humanPlayerIds;
  const isHumanContestant = pl.isContestant(career.player.id);

  const championPlayer = pl.championId
    ? [...career.world.getAllAIPlayers(), ...career.players].find(p => p.id === pl.championId)
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition text-sm font-semibold text-neutral-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              16-Week Roadshow & Play-Offs
            </span>
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-bold font-mono">
              Season {pl.year}
            </span>
          </div>
        </div>

        {/* Hero Title & Roadshow Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/20 via-neutral-900 to-neutral-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-black tracking-widest text-xs uppercase">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>PDC Premier League Darts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                BetMGM Premier League
              </h1>
              <p className="text-sm text-neutral-300 max-w-xl">
                The world's premier 16-week traveling roadshow. 8 elite contenders compete across Europe for points, glory, and a place at the £275,000 O2 Arena Play-Offs.
              </p>
            </div>

            {/* Current Stop Badge / Card */}
            <div className="bg-neutral-950/80 backdrop-blur border border-neutral-800 p-4 sm:p-5 rounded-2xl min-w-[260px] text-right space-y-1 shadow-inner">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {isSeasonFinished ? 'Season Concluded' : isPlayOffsActive ? 'Play-Offs Finals Night' : `Night ${currentNightNum} of 16`}
              </div>
              <div className="text-lg font-black text-white">
                {isSeasonFinished ? 'Champion Crowned' : isPlayOffsActive ? 'The O2 Arena, London' : `${currentVenue.arena}`}
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                {isSeasonFinished ? `Winner: ${championPlayer?.name || 'TBD'}` : isPlayOffsActive ? 'Finals Night: Top 4 Battle' : `${currentVenue.city}, ${currentVenue.country}`}
              </div>
            </div>
          </div>
        </div>

        {/* Live Standings Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Official League Table
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Top 4 players at the conclusion of Night 16 advance to The O2 Play-Offs.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-neutral-300">Play-Offs Position (1-4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-neutral-700 inline-block"></span>
                <span className="text-neutral-400">Eliminated (5-8)</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950/80 text-[11px] font-mono uppercase text-neutral-400 border-b border-neutral-800">
                  <th className="py-3 px-4 text-center">Pos</th>
                  <th className="py-3 px-4">Contender</th>
                  <th className="py-3 px-3 text-center">Pld</th>
                  <th className="py-3 px-3 text-center">N.Wins</th>
                  <th className="py-3 px-3 text-center">N.RU</th>
                  <th className="py-3 px-3 text-center">M.Won</th>
                  <th className="py-3 px-3 text-center">M.Lost</th>
                  <th className="py-3 px-3 text-center">LF</th>
                  <th className="py-3 px-3 text-center">LA</th>
                  <th className="py-3 px-3 text-center">+/-</th>
                  <th className="py-3 px-4 text-center">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm font-mono">
                {pl.standings.map((entry, idx) => {
                  const isTop4 = idx < 4;
                  const isHuman = humanPlayerIds.includes(entry.playerId);

                  return (
                    <React.Fragment key={entry.playerId}>
                      <tr
                        className={`transition-colors ${
                          isHuman
                            ? 'bg-amber-500/10 hover:bg-amber-500/15'
                            : isTop4
                            ? 'hover:bg-neutral-800/40'
                            : 'hover:bg-neutral-800/20 opacity-90'
                        }`}
                      >
                        {/* Position */}
                        <td className="py-3 px-4 text-center font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                              isTop4
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>

                        {/* Player */}
                        <td className="py-3 px-4 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white tracking-wide">{entry.playerName}</span>
                            {isHuman && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider font-mono">
                                YOU
                              </span>
                            )}
                            <span className="text-xs text-neutral-500 font-mono">({entry.nationality})</span>
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="py-3 px-3 text-center text-neutral-300">{entry.playedNights}</td>
                        <td className="py-3 px-3 text-center font-bold text-amber-400">{entry.nightWins}</td>
                        <td className="py-3 px-3 text-center text-neutral-300">{entry.nightRunnerUps}</td>
                        <td className="py-3 px-3 text-center text-emerald-400">{entry.matchesWon}</td>
                        <td className="py-3 px-3 text-center text-red-400">{entry.matchesLost}</td>
                        <td className="py-3 px-3 text-center text-neutral-300">{entry.legsWon}</td>
                        <td className="py-3 px-3 text-center text-neutral-400">{entry.legsLost}</td>

                        {/* Leg Diff */}
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={entry.legDifference > 0 ? 'text-emerald-400' : entry.legDifference < 0 ? 'text-red-400' : 'text-neutral-400'}>
                            {entry.legDifference > 0 ? `+${entry.legDifference}` : entry.legDifference}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-base shadow">
                            {entry.points}
                          </span>
                        </td>
                      </tr>

                      {/* Cutoff visual separator after 4th place */}
                      {idx === 3 && (
                        <tr className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 border-y-2 border-emerald-500/50">
                          <td colSpan={11} className="py-2 px-4 text-center text-[10px] uppercase tracking-widest text-emerald-400 font-black">
                            ⚡ THE O2 ARENA PLAY-OFFS QUALIFICATION CUTOFF (TOP 4 ADVANCE) ⚡
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 16 Tour Stops Roadshow Calendar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                European Roadshow Tour Stops (16 Nights)
              </h2>
              <p className="text-xs text-neutral-400">
                Weekly mini-knockouts held across the UK and Europe. Winner earns 5 pts, Runner-up 3 pts, Semi-finalists 2 pts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PREMIER_LEAGUE_VENUES.map((v, i) => {
              const record = pl.nightRecords.find(r => r.nightNumber === v.nightNumber);
              const isPast = record !== undefined;
              const isCurrent = i === pl.currentNightIndex;

              const winnerPlayer = record
                ? [...career.world.getAllAIPlayers(), ...career.players].find(p => p.id === record.winnerId)
                : null;

              return (
                <div
                  key={v.nightNumber}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                      : isPast
                      ? 'bg-neutral-950/70 border-neutral-800/80'
                      : 'bg-neutral-950/40 border-neutral-800/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                    <span className="text-amber-400 font-bold">Night {v.nightNumber} • Wk {v.week}</span>
                    {isPast ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : isCurrent ? (
                      <span className="text-amber-300 font-bold animate-pulse">Next Stop</span>
                    ) : (
                      <span className="text-neutral-500">Upcoming</span>
                    )}
                  </div>

                  <div className="font-bold text-white text-sm truncate">{v.city}</div>
                  <div className="text-xs text-neutral-400 truncate mb-2">{v.arena}</div>

                  {isPast && winnerPlayer && (
                    <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>{winnerPlayer.name} (+5 pts)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Finals Night: The O2 Arena Showcase */}
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              Week 21 • London Finals Night
            </div>
            <h3 className="text-2xl font-black text-white">The O2 Arena Play-Offs</h3>
            <p className="text-xs text-neutral-400 max-w-lg">
              The climax of the Premier League season. Top 4 qualifiers battle in best-of-19 semi-finals and a best-of-21 Grand Final for £275,000 and the coveted trophy.
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-400 font-mono">£275,000</div>
            <div className="text-xs text-neutral-400 uppercase font-semibold">Champion Prize Money</div>
          </div>
        </div>
      </div>
    </div>
  );
};
