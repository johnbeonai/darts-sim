import React, { useState } from 'react';
import { CareerManager } from '../../core/career/CareerManager';
import { Calendar } from '../../core/career/Calendar';
import { CalendarSchedule } from '../../core/career/CalendarSchedule';
import { TournamentConfig } from '../../core/tournament/Tournament';
import {
  Calendar as CalendarIcon,
  Trophy,
  ArrowLeft,
  Tv,
  MapPin,
  PoundSterling,
  CheckCircle2,
  Lock,
  Star,
  ChevronRight,
  Filter,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { QSchoolHubModal } from '../components/QSchoolHubModal';

interface CalendarScreenProps {
  career: CareerManager;
  onBack: () => void;
  onSelectCurrentTournament?: (tournamentConfig: TournamentConfig) => void;
}

type EventFilter = 'all' | 'major' | 'premier_league' | 'protour' | 'q_school' | 'pub_amateur';

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  career,
  onBack,
  onSelectCurrentTournament,
}) => {
  const currentWeek = career.calendar.currentWeek;
  const currentYear = career.calendar.currentYear;
  const currentMonth = career.calendar.currentMonth;
  const player = career.players[career.activePlayerIndex] || career.player;

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);
  const [filter, setFilter] = useState<EventFilter>('all');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek);
  const [showQSchoolModal, setShowQSchoolModal] = useState<boolean>(false);
  const [selectedQSchoolTournament, setSelectedQSchoolTournament] = useState<TournamentConfig | null>(null);

  // Generate full 52-week schedule
  const fullYearSchedule = React.useMemo(() => {
    const schedule: { week: number; month: number; monthName: string; tournaments: TournamentConfig[] }[] = [];
    for (let w = 1; w <= 52; w++) {
      const m = Calendar.getMonthForWeek(w);
      const tournaments = CalendarSchedule.getTournamentsForWeek(w, currentYear);
      schedule.push({
        week: w,
        month: m,
        monthName: Calendar.getMonthName(m),
        tournaments,
      });
    }
    return schedule;
  }, [currentYear]);

  // Check if player satisfies tournament requirements
  const checkEligibility = (config: TournamentConfig): { eligible: boolean; reason: string } => {
    const req = config.requirements;
    if (!req) return { eligible: true, reason: 'Open to all players' };

    if (req.tourCardRequired && !player.hasTourCard) {
      return { eligible: false, reason: 'PDC Tour Card Required' };
    }

    if (req.nonCardHoldersOnly && player.hasTourCard) {
      return { eligible: false, reason: 'Non-Tour Card Holders only' };
    }

    if (req.maxRank) {
      const rank = player.ranking || 999;
      if (rank > req.maxRank) {
        return { eligible: false, reason: `Rank Top ${req.maxRank} Required (Current: #${rank})` };
      }
    }

    return { eligible: true, reason: req.description || 'Eligible to enter' };
  };

  // Filtered weeks
  const displayedWeeks = fullYearSchedule.filter(item => {
    if (selectedMonth !== 'all' && item.month !== selectedMonth) {
      return false;
    }

    if (filter === 'all') return true;

    return item.tournaments.some(t => {
      if (filter === 'major') return t.isMajor || t.category === 'major';
      if (filter === 'premier_league') return t.id.includes('premier-league');
      if (filter === 'protour') return t.tier === 'pro' || t.tier === 'elite';
      if (filter === 'q_school') return t.isQSchool || t.id.includes('challenge-tour');
      if (filter === 'pub_amateur') return t.tier === 'pub' || t.tier === 'amateur';
      return true;
    });
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-amber-500/15 border-amber-500/50 text-amber-300';
      case 'pro':
        return 'bg-blue-500/15 border-blue-500/50 text-blue-300';
      case 'semi_pro':
        return 'bg-purple-500/15 border-purple-500/50 text-purple-300';
      case 'amateur':
        return 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
      case 'pub':
      default:
        return 'bg-neutral-800 border-neutral-700 text-neutral-300';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 font-sans">
      {/* Header Bar */}
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
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-black text-white">OFFICIAL TOUR CALENDAR</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentYear} Season
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Full 52-week professional darts schedule, televised majors, and qualification cutoffs.
            </p>
          </div>
        </div>

        {/* Jump to Current Week Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedMonth(currentMonth);
              setExpandedWeek(currentWeek);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Jump to Week {currentWeek}</span>
          </button>
        </div>
      </div>

      {/* Current Active Week Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-neutral-900 to-neutral-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black font-black text-sm flex items-center justify-center shadow-md">
            W{currentWeek}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              CURRENT ACTIVE WEEK • {Calendar.getMonthName(currentMonth).toUpperCase()} {currentYear}
            </span>
            <h3 className="text-base font-black text-white">
              {player.name} • {player.hasTourCard ? 'PDC Tour Card Holder' : 'Associate Non-Card Holder'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-neutral-400 block text-[10px]">Rank</span>
            <span className="font-mono font-bold text-amber-400">#{player.ranking || '—'}</span>
          </div>
          <div className="text-right">
            <span className="text-neutral-400 block text-[10px]">Order of Merit</span>
            <span className="font-mono font-bold text-emerald-400">£{player.prizeMoneyTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Month Filter Selector (12 Months + All) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2 flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedMonth('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedMonth === 'all'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Year (52 Wks)
        </button>

        {Calendar.MONTH_NAMES.map((name, idx) => {
          const monthNum = idx + 1;
          const isCurrentMonth = monthNum === currentMonth;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedMonth(monthNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedMonth === monthNum
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>{name.slice(0, 3)}</span>
              {isCurrentMonth && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1 text-neutral-500 font-bold uppercase text-[10px] mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>

        {[
          { id: 'all', label: 'All Categories' },
          { id: 'major', label: '🏆 PDC Majors' },
          { id: 'premier_league', label: 'BetMGM Premier League' },
          { id: 'protour', label: 'ProTour & Euro Tour' },
          { id: 'q_school', label: 'Q-School & Challenge Tour' },
          { id: 'pub_amateur', label: 'Pub & Amateur Opens' },
        ].map(pill => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setFilter(pill.id as EventFilter)}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all border ${
              filter === pill.id
                ? 'bg-neutral-800 text-amber-400 border-amber-500/50 shadow'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Week-by-Week Accordion List */}
      <div className="space-y-3">
        {displayedWeeks.map(item => {
          const isCurrent = item.week === currentWeek;
          const isPast = item.week < currentWeek;
          const isExpanded = expandedWeek === item.week;

          // Check if week has any major
          const hasMajor = item.tournaments.some(t => t.isMajor);

          return (
            <div
              key={item.week}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isCurrent
                  ? 'bg-neutral-900 border-amber-500 ring-2 ring-amber-500/30 shadow-xl'
                  : hasMajor
                  ? 'bg-neutral-900/90 border-amber-500/40'
                  : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              {/* Week Row Header */}
              <div
                onClick={() => setExpandedWeek(isExpanded ? null : item.week)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-black border ${
                      isCurrent
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                        : isPast
                        ? 'bg-neutral-950 text-neutral-600 border-neutral-800'
                        : hasMajor
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                    }`}
                  >
                    <span className="text-[9px] uppercase leading-none opacity-80">Wk</span>
                    <span className="text-base leading-tight">{item.week}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {item.monthName} {currentYear}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-black animate-pulse">
                          Active Week
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-mono text-neutral-500 bg-neutral-950 border border-neutral-800">
                          Past
                        </span>
                      )}
                      {hasMajor && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Major
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-white mt-0.5">
                      {item.tournaments.length} {item.tournaments.length === 1 ? 'Event' : 'Events'} Scheduled
                      {hasMajor && ` • ${item.tournaments.find(t => t.isMajor)?.name}`}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 hidden sm:inline">
                    {isExpanded ? 'Hide Details' : 'View Events'}
                  </span>
                  <div className={`p-2 rounded-xl bg-neutral-950 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Expanded Tournaments in Week */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-1 space-y-3 border-t border-neutral-800/80 animate-fade-in">
                  {item.tournaments.map(tournament => {
                    const eligibility = checkEligibility(tournament);

                    return (
                      <div
                        key={tournament.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          tournament.isMajor
                            ? 'bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950 border-amber-500/40 shadow-inner'
                            : 'bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider border ${getTierColor(tournament.tier)}`}>
                                {tournament.tier.replace('_', ' ')}
                              </span>

                              {tournament.isMajor && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500 text-black flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  Major Championship
                                </span>
                              )}

                              {tournament.tvBroadcastName && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 flex items-center gap-1">
                                  <Tv className="w-3 h-3 text-sky-400" />
                                  {tournament.tvBroadcastName}
                                </span>
                              )}
                            </div>

                            <h5 className="text-lg font-black text-white">
                              {tournament.name}
                            </h5>

                            <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                                {tournament.location}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                                <PoundSterling className="w-3.5 h-3.5" />
                                Winner: £{tournament.prizePool.winner.toLocaleString()}
                              </span>
                              <span>•</span>
                              <span className="text-neutral-400 font-mono">
                                Fee: {tournament.entryFee > 0 ? `£${tournament.entryFee}` : 'Free'}
                              </span>
                            </div>
                          </div>

                          {/* Eligibility Badge & Enter Action */}
                          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                              eligibility.eligible
                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                            }`}>
                              {eligibility.eligible ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Eligible</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                                  <span>{eligibility.reason}</span>
                                </>
                              )}
                            </div>

                            {isCurrent && eligibility.eligible && onSelectCurrentTournament && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (tournament.isQSchool) {
                                    setSelectedQSchoolTournament(tournament);
                                    setShowQSchoolModal(true);
                                  } else {
                                    onSelectCurrentTournament(tournament);
                                  }
                                }}
                                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow flex items-center gap-1"
                              >
                                <span>{tournament.isQSchool ? 'Enter Q-School Hub 🎖️' : `Enter Week ${currentWeek}`}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Format & Requirements Footer */}
                        {tournament.requirements?.description && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-900 text-[11px] text-neutral-400 flex items-center gap-2">
                            <span className="font-bold text-neutral-300">Criteria:</span>
                            <span>{tournament.requirements.description}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Q-School Standings & Qualification Drama Hub Modal */}
      {showQSchoolModal && (
        <QSchoolHubModal
          career={career}
          onEnterStage={() => {
            setShowQSchoolModal(false);
            if (selectedQSchoolTournament && onSelectCurrentTournament) {
              onSelectCurrentTournament(selectedQSchoolTournament);
            }
          }}
          onClose={() => setShowQSchoolModal(false)}
        />
      )}
    </div>
  );
};
