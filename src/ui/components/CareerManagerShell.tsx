import React, { useState, useEffect, useCallback } from 'react';
import { CareerManager } from '../../core/career/CareerManager';
import {
  Home,
  User,
  Calendar as CalendarIcon,
  BarChart3,
  Trophy,
  ShoppingBag,
  DollarSign,
  Users,
  Stethoscope,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  Save,
  LogOut,
  Sparkles,
  Swords,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import {
  CAREER_PAGES,
  CareerPageView,
  PageDef,
} from './CareerNavigationConfig';

export interface CareerManagerShellProps {
  career: CareerManager;
  currentView: CareerPageView | string;
  onNavigate: (view: CareerPageView) => void;
  onAdvanceWeek?: () => void;
  onSaveGame: () => void;
  onReturnToMainMenu: () => void;
  onResumeTournament?: () => void;
  children: React.ReactNode;
}

export const CareerManagerShell: React.FC<CareerManagerShellProps> = ({
  career,
  currentView,
  onNavigate,
  onAdvanceWeek,
  onSaveGame,
  onReturnToMainMenu,
  onResumeTournament,
  children,
}) => {
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const is2P = career.isTwoPlayer;
  const p1 = career.players[0];
  const p2 = is2P && career.players.length > 1 ? career.players[1] : null;
  const activePlayer = !is2P
    ? career.player
    : career.activePlayerIndex === 0
    ? p1
    : (p2 || p1);

  // Find index of current view
  const currentIndex = CAREER_PAGES.findIndex((p) => p.id === currentView);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentPage = CAREER_PAGES[safeIndex];

  const prevIndex = (safeIndex - 1 + CAREER_PAGES.length) % CAREER_PAGES.length;
  const nextIndex = (safeIndex + 1) % CAREER_PAGES.length;
  const prevPage = CAREER_PAGES[prevIndex];
  const nextPage = CAREER_PAGES[nextIndex];

  const handlePrev = useCallback(() => {
    onNavigate(prevPage.id);
  }, [onNavigate, prevPage.id]);

  const handleNext = useCallback(() => {
    onNavigate(nextPage.id);
  }, [onNavigate, nextPage.id]);

  // Keyboard navigation: [ and ] or Arrow keys (when not focused on inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '[' || (e.altKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ']' || (e.altKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const handleSave = () => {
    onSaveGame();
    setSaveToast(`Game Saved (Slot ${career.activeSlotId})`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Continue button action
  const handleContinueClick = () => {
    if (career.activeTournament && onResumeTournament) {
      onResumeTournament();
    } else if (currentView !== 'career_dashboard') {
      onNavigate('career_dashboard');
    } else if (onAdvanceWeek) {
      onAdvanceWeek();
    }
  };

  const hasActiveTourney = Boolean(career.activeTournament);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-fade-in pb-12 text-slate-100">
      {/* 1. TOP CM / LMA MANAGER CONTROL BAR */}
      <header className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-3 sticky top-2 z-30">
        {/* Left: Brand, Date & Active Player Snapshot */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start w-full lg:w-auto">
          {/* CM Retro Brand Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wider uppercase text-amber-300">
              Darts Manager
            </span>
          </div>

          {/* Date & Week Badge */}
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase inline-flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{career.calendar.dateString}</span>
            <span className="text-white/20">•</span>
            <span>Slot {career.activeSlotId}</span>
          </div>

          {/* Player Vitals Capsule */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white max-w-[130px] truncate">{activePlayer.name}</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              {`#${career.ranking.getPlayerRank(activePlayer.id)?.currentRank || activePlayer.ranking || 128}`}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
              {`£${activePlayer.bankBalance.toLocaleString()}`}
            </span>
            {is2P && (
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  career.activePlayerIndex === 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}
              >
                {career.activePlayerIndex === 0 ? 'P1 Turn' : 'P2 Turn'}
              </span>
            )}
          </div>
        </div>

        {/* Center: CM Page Stepper with Next / Prev Buttons */}
        <div className="flex items-center justify-center gap-2 bg-slate-950/70 border border-white/10 px-2 py-1 rounded-2xl shadow-inner w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all active:scale-90 flex items-center gap-1 text-xs font-semibold"
            title={`Previous Page: ${prevPage.shortTitle} (Press '[')`}
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline text-[11px] uppercase tracking-wider text-slate-400">Prev</span>
          </button>

          {/* Current Page Indicator */}
          <div className="px-3 py-1 flex items-center gap-2 text-xs font-bold text-slate-200">
            <span className="text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {`${String(safeIndex + 1).padStart(2, '0')} / ${String(CAREER_PAGES.length).padStart(2, '0')}`}
            </span>
            <span className="truncate max-w-[150px] sm:max-w-[180px] tracking-wide text-white">
              {currentPage.title}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all active:scale-90 flex items-center gap-1 text-xs font-semibold"
            title={`Next Page: ${nextPage.shortTitle} (Press ']')`}
          >
            <span className="hidden md:inline text-[11px] uppercase tracking-wider text-slate-400">Next</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Right: Save, Exit Menu & The Iconic CM "CONTINUE" Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Quick Save */}
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            title="Save Career Progress"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Main Menu */}
          <button
            type="button"
            onClick={onReturnToMainMenu}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            title="Return to Main Menu"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* THE ICONIC CM "CONTINUE >>" BUTTON */}
          <button
            type="button"
            onClick={handleContinueClick}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 shadow-xl active:scale-95 group ${
              hasActiveTourney
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-amber-500/25 hover:shadow-amber-500/40 animate-pulse ring-2 ring-amber-400/60'
                : is2P
                ? career.activePlayerIndex === 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-amber-500/20 hover:shadow-amber-500/35 ring-1 ring-amber-400'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-purple-500/20 hover:shadow-purple-500/35 ring-1 ring-purple-400'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-black shadow-emerald-500/25 hover:shadow-emerald-500/40 ring-1 ring-emerald-400'
            }`}
            title="Continue / Advance Game"
          >
            {hasActiveTourney ? (
              <>
                <span>Resume Cup</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </>
            ) : currentView !== 'career_dashboard' ? (
              <>
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : is2P ? (
              <>
                <span>{career.activePlayerIndex === 0 ? 'P1 Action' : 'Execute Week'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-500/90 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. CM HORIZONTAL SECTION TAB STRIP */}
      <nav
        aria-label="Career Navigation Sections"
        className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        {CAREER_PAGES.map((page) => {
          const Icon = page.icon;
          const isActive = page.id === currentView;
          const badge = page.getBadge ? page.getBadge(career) : null;
          const alert = page.hasAlert ? page.hasAlert(career) : false;

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onNavigate(page.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 active:scale-95 select-none ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
              <span>{page.shortTitle}</span>

              {/* Dynamic Context Badge */}
              {badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    isActive ? 'bg-black/20 text-black border-black/30' : badge.color
                  }`}
                >
                  {badge.text}
                </span>
              )}

              {/* Injury / Alert Dot */}
              {alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Medical Alert" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. MAIN PAGE CONTENT CONTAINER */}
      <main className="w-full transition-all duration-300">
        {children}
      </main>

      {/* 4. LMA-STYLE BOTTOM NAVIGATION STEPPER / FOOTER */}
      <footer className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <button
          type="button"
          onClick={handlePrev}
          className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-98 transition-all rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center sm:justify-start gap-2 group"
        >
          <ChevronLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>{`Previous: ${prevPage.shortTitle}`}</span>
        </button>

        {/* Page progress indicators (dots / pills) */}
        <div className="flex items-center gap-1.5">
          {CAREER_PAGES.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => onNavigate(page.id)}
              className={`h-2 rounded-full transition-all duration-300 ${
                page.id === currentView
                  ? 'w-6 bg-amber-400'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={page.shortTitle}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-98 transition-all rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center sm:justify-end gap-2 group"
        >
          <span>{`Next: ${nextPage.shortTitle}`}</span>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </footer>
    </div>
  );
};
