import React from 'react';
import { CareerManager } from '../../core/career/CareerManager';
import { Player } from '../../core/player/Player';
import { CalendarSchedule } from '../../core/career/CalendarSchedule';
import { Calendar } from '../../core/career/Calendar';
import {
  Calendar as CalendarIcon,
  Trophy,
  ArrowRight,
  MapPin,
  PoundSterling,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface UpcomingScheduleWidgetProps {
  career: CareerManager;
  player?: Player;
  onViewFullCalendar: () => void;
}

export const UpcomingScheduleWidget: React.FC<UpcomingScheduleWidgetProps> = ({
  career,
  player: propPlayer,
  onViewFullCalendar,
}) => {
  const player = propPlayer || career.players[career.activePlayerIndex] || career.player;
  const currentWeek = career.calendar.currentWeek;
  const currentYear = career.calendar.currentYear;

  // Get next 4 weeks
  const upcomingWeeks = career.calendar.getUpcomingWeeks(4);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4 font-sans">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold text-base text-white">Upcoming 4-Week Tour Schedule</h4>
        </div>

        <button
          type="button"
          onClick={onViewFullCalendar}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
        >
          <span>Full 52-Wk Calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-neutral-400">
        Preview of scheduled tournaments, televised majors, and qualification cutoffs for the next 4 weeks.
      </p>

      {/* 4-Week Horizontal / Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {upcomingWeeks.map((item, index) => {
          const tournaments = CalendarSchedule.getTournamentsForWeek(item.week, item.year);
          const majorEvent = tournaments.find(t => t.isMajor || t.category === 'major');
          const featuredEvent = majorEvent || tournaments.find(t => t.tier === 'pro' || t.tier === 'elite') || tournaments[0];

          const isEligible = (() => {
            if (!featuredEvent || !featuredEvent.requirements) return true;
            if (featuredEvent.requirements.tourCardRequired && !player.hasTourCard) return false;
            if (featuredEvent.requirements.nonCardHoldersOnly && player.hasTourCard) return false;
            if (featuredEvent.requirements.maxRank && (player.ranking || 999) > featuredEvent.requirements.maxRank) return false;
            return true;
          })();

          return (
            <div
              key={item.week}
              onClick={onViewFullCalendar}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between gap-3 ${
                majorEvent
                  ? 'bg-gradient-to-b from-amber-500/15 via-white/5 to-white/5 border-amber-500/40 hover:border-amber-400 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div>
                {/* Week & Timing Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-white/5 border border-white/10 text-amber-400">
                    Week {item.week}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    In {index + 1} {index === 0 ? 'week' : 'weeks'}
                  </span>
                </div>

                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                  {item.monthName} {item.year}
                </span>

                {/* Event Name */}
                <h5 className="text-sm font-black text-white mt-1 leading-snug line-clamp-2">
                  {featuredEvent ? featuredEvent.name : 'Tour Floor Event'}
                </h5>

                {/* Major Tag if applicable */}
                {majorEvent && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] font-black uppercase text-amber-400">
                    <Trophy className="w-3 h-3" />
                    <span>Televised Major</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Prize & Eligibility */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="font-mono text-emerald-400 font-bold">
                  {featuredEvent ? `£${featuredEvent.prizePool.winner.toLocaleString()}` : '—'}
                </span>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                    isEligible
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 text-neutral-400 border border-white/10'
                  }`}
                >
                  {isEligible ? 'Eligible' : 'Reqs'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
