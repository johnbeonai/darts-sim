import React, { useState } from 'react';
import { CareerManager, WeeklyResolutionResult } from '../../core/career/CareerManager';
import { TournamentConfig } from '../../core/tournament/Tournament';
import { TrainingType } from '../../core/career/TrainingManager';
import { TravelBookingModal } from '../components/TravelBookingModal';
import {
  Trophy, Calendar as CalendarIcon, BatteryCharging, Zap,
  Award, DollarSign, Dumbbell, ShieldAlert,
  ChevronRight, Sparkles, Save, Home, User, BarChart3, Users, Swords, CheckCircle2, Play,
  ArrowRight, RotateCcw, ShoppingBag, Lock, Tv, Star, Stethoscope, ArrowUp, Target
} from 'lucide-react';
import { UpcomingScheduleWidget } from '../components/UpcomingScheduleWidget';
import { NewsFeedWidget } from '../components/NewsFeedWidget';
import { OcheGazetteNews } from '../../core/media/OcheGazetteNews';

interface CareerDashboardProps {
  career: CareerManager;
  onEnterTournament: (config: TournamentConfig) => void;
  onAdvanceWeek: () => void;
  onTrain: (type: TrainingType) => void;
  onSaveGame: () => void;
  onReturnToMainMenu: () => void;
  onOpenProfile: () => void;
  onOpenRecords: () => void;
  onOpenRankings: () => void;
  onOpenCalendar?: () => void;
  onOpenPremierLeague?: () => void;
  onOpenShop: () => void;
  onOpenFinances?: () => void;
  onOpenStaff?: () => void;
  onOpenMedical?: () => void;
  onOpenPractice?: () => void;
  onOpenInteractiveDrills?: () => void;
  onOpenSkillTree?: () => void;
  onResumeTournament?: () => void;
}

interface PendingWeeklyChoice {
  action: 'tournament' | 'train' | 'rest';
  tournamentConfig?: TournamentConfig;
  trainingType?: TrainingType;
  title: string;
  subtitle: string;
}

export const CareerDashboard: React.FC<CareerDashboardProps> = ({
  career,
  onEnterTournament,
  onAdvanceWeek,
  onTrain,
  onSaveGame,
  onReturnToMainMenu,
  onOpenProfile,
  onOpenRecords,
  onOpenRankings,
  onOpenCalendar,
  onOpenPremierLeague,
  onOpenShop,
  onOpenFinances,
  onOpenStaff,
  onOpenMedical,
  onOpenPractice,
  onOpenInteractiveDrills,
  onOpenSkillTree,
  onResumeTournament,
}) => {
  const [, setRenderTick] = useState(0);
  const forceUpdate = () => setRenderTick(t => t + 1);

  const is2P = career.isTwoPlayer;
  const p1 = career.players[0];
  const p2 = is2P && career.players.length > 1 ? career.players[1] : null;

  // Active player determined by turn in 2P mode
  const activePlayer = !is2P
    ? career.player
    : career.activePlayerIndex === 0
    ? p1
    : (p2 || p1);

  const [pendingChoice, setPendingChoice] = useState<PendingWeeklyChoice | null>(null);
  const [resolutionResult, setResolutionResult] = useState<WeeklyResolutionResult | null>(null);
  const [pendingTravelTournament, setPendingTravelTournament] = useState<TournamentConfig | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'eligible' | 'pro' | 'amateur'>('all');
  const [highlightConfirm, setHighlightConfirm] = useState(false);

  // References for scrolling up to confirmation bar
  const confirmBarRef = React.useRef<HTMLDivElement>(null);
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null);

  const scrollToConfirm = () => {
    if (confirmBarRef.current) {
      confirmBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setHighlightConfirm(true);
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 350);
    setTimeout(() => {
      setHighlightConfirm(false);
    }, 2200);
  };

  // Action Resolution Modal state: prevents any action from skipping invisibly

  // Active decision state
  const p1Decision = career.weeklyDecisions.get(p1.id);
  const p2Decision = p2 ? career.weeklyDecisions.get(p2.id) : null;

  const getDecisionText = (d?: { action: string; trainingType?: string; tournamentConfig?: TournamentConfig } | null) => {
    if (!d || d.action === 'pending') return 'Awaiting Decision...';
    if (d.action === 'tournament') return `Tournament: ${d.tournamentConfig?.name || 'Tournament'}`;
    if (d.action === 'rest') return 'Full Rest Week';
    return `Practice: ${d.trainingType ? d.trainingType.toUpperCase() : 'Drill'}`;
  };

  // Solo mode training click or 2P pending selection
  const handleTrainClick = (type: TrainingType) => {
    if (!is2P) {
      career.recordPlayerDecision(career.player.id, {
        action: type === 'rest' ? 'rest' : 'train',
        trainingType: type
      });
      const res = career.resolveWeeklyPlans();
      setResolutionResult(res);
    } else {
      const isAlreadySelected =
        pendingChoice?.action !== 'tournament' &&
        pendingChoice?.trainingType === type;

      if (isAlreadySelected) {
        // Pressing a second time smoothly scrolls up to the confirm button
        scrollToConfirm();
        setNotice(`Jumping up to Confirm button for ${activePlayer.name.split(' ')[0]} ⬆`);
        setTimeout(() => setNotice(null), 2500);
        return;
      }

      const choice: PendingWeeklyChoice = {
        action: type === 'rest' ? 'rest' : 'train',
        trainingType: type,
        title: type === 'rest' ? 'Full Rest Week' : `${type.toUpperCase()} Practice Drill`,
        subtitle: type === 'rest' ? '-35% Fatigue, Mind Boost' : '+Attribute Development'
      };
      setPendingChoice(choice);
      setNotice(`Selected "${choice.title}". Press again to jump to Confirm at the top!`);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  // Solo mode tournament click or 2P pending selection
  const handleTournamentClick = (config: TournamentConfig) => {
    const eligibility = career.isPlayerEligibleForTournament(activePlayer, config);
    if (!eligibility.eligible) {
      setNotice(`Cannot enter: ${eligibility.reason}`);
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    setPendingTravelTournament(config);
  };

  const handleTravelConfirmed = () => {
    const config = pendingTravelTournament;
    if (!config) return;
    setPendingTravelTournament(null);

    if (!is2P) {
      onEnterTournament(config);
    } else {
      const choice: PendingWeeklyChoice = {
        action: 'tournament',
        tournamentConfig: config,
        title: config.name,
        subtitle: `Fee £${config.entryFee} • Winner £${config.prizePool.winner}`
      };
      setPendingChoice(choice);
      setNotice(`Selected "${config.name}". Press again to jump to Confirm at the top!`);
      setTimeout(() => setNotice(null), 3500);
      scrollToConfirm();
    }
  };

  // 2-Player: Step 1 Confirmation (Player 1)
  const handleConfirmPlayer1 = () => {
    if (!pendingChoice) return;
    career.recordPlayerDecision(p1.id, {
      action: pendingChoice.action,
      tournamentConfig: pendingChoice.tournamentConfig,
      trainingType: pendingChoice.trainingType
    });
    career.activePlayerIndex = 1;
    setPendingChoice(null);
    onSaveGame();
    forceUpdate();
    setNotice(`✓ ${p1.name}'s choice locked in! Switched to ${p2?.name ?? 'Player 2'}'s turn.`);
    setTimeout(() => setNotice(null), 4000);
  };

  // 2-Player: Step 2 Confirmation (Player 2) -> Executes both and displays Resolution Modal!
  const handleConfirmPlayer2 = () => {
    if (!pendingChoice || !p2) return;
    career.recordPlayerDecision(p2.id, {
      action: pendingChoice.action,
      tournamentConfig: pendingChoice.tournamentConfig,
      trainingType: pendingChoice.trainingType
    });
    setPendingChoice(null);

    // Resolve decisions and show Action Execution Modal
    const res = career.resolveWeeklyPlans();
    setResolutionResult(res);
  };

  // Switch back to Player 1 if Player 2 wants to re-pick
  const handleRePickPlayer1 = () => {
    career.recordPlayerDecision(p1.id, { action: 'pending' });
    career.activePlayerIndex = 0;
    setPendingChoice(null);
    onSaveGame();
    forceUpdate();
    setNotice(`Returned to Player 1's turn. Screen switched back to Amber.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveClick = () => {
    onSaveGame();
    setSaveNotice(`Career successfully saved to Slot ${career.activeSlotId}!`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const fatiguePercent = activePlayer.state.fatigue;

  // Filter available tournaments
  const filteredTournaments = career.availableTournaments.filter(tourney => {
    if (categoryFilter === 'eligible') {
      return career.isPlayerEligibleForTournament(activePlayer, tourney).eligible;
    }
    if (categoryFilter === 'pro') {
      return tourney.category === 'pro_tour' || tourney.isMajor;
    }
    if (categoryFilter === 'amateur') {
      return tourney.category === 'pub' || tourney.category === 'amateur' || tourney.category === 'challenge_tour';
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Top Banner: Date & Week Progression with Sleek Inline Badge */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase inline-flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{career.calendar.dateString}</span>
            <span className="text-white/20">•</span>
            <span>Slot {career.activeSlotId}</span>
            {is2P && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-purple-300">2P Circuit</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-emerald-400 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
            title="Save Career Progress"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={onReturnToMainMenu}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
            title="Return to Main Menu"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {!is2P && (
            <button
              type="button"
              onClick={onAdvanceWeek}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              title="Advance to Next Calendar Week"
            >
              <span>Next Week</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tour Operations & Navigation Hub Grid */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-300">
              Circuit Operations & Tour Hub
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
            PDC Pro Tour & Player Management
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
          >
            <span>{is2P ? `${activePlayer.name.split(' ')[0]} Profile & Attributes` : 'Character Profile & Stats'}</span>
            <User className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenRankings}
            className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
          >
            <div className="flex items-center gap-2">
              <span>World Rankings</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                #{career.ranking.getPlayerRank(activePlayer.id)?.currentRank ?? activePlayer.ranking}
              </span>
            </div>
            <BarChart3 className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
          </button>

          {onOpenPremierLeague && (
            <button
              type="button"
              onClick={onOpenPremierLeague}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <span>BetMGM Premier League</span>
              <Trophy className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
            </button>
          )}

          {onOpenCalendar && (
            <button
              type="button"
              onClick={onOpenCalendar}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <span>Full Season Calendar</span>
              <CalendarIcon className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenShop}
            className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
          >
            <span>Equipment Pro Shop</span>
            <ShoppingBag className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
          </button>

          {onOpenFinances && (
            <button
              type="button"
              onClick={onOpenFinances}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <div className="flex items-center gap-2">
                <span>Finances & Sponsors</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  £{activePlayer.bankBalance.toLocaleString()}
                </span>
              </div>
              <DollarSign className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
            </button>
          )}

          {onOpenStaff && (
            <button
              type="button"
              onClick={onOpenStaff}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <span>Support Staff Team</span>
              <Users className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
            </button>
          )}

          {onOpenMedical && (
            <button
              type="button"
              onClick={onOpenMedical}
              className={`w-full h-14 bg-white/5 hover:bg-white/10 border ${
                activePlayer.hasActiveInjury
                  ? 'border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300'
                  : 'border-white/10 hover:border-white/20 text-slate-200'
              } active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium group`}
            >
              <div className="flex items-center gap-2">
                <span>{activePlayer.hasActiveInjury ? 'Medical (Injured)' : 'Medical & Physio'}</span>
                {activePlayer.hasActiveInjury && (
                  <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                    Alert
                  </span>
                )}
              </div>
              <Stethoscope className={`${activePlayer.hasActiveInjury ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors w-5 h-5`} />
            </button>
          )}

          {onOpenPractice && (
            <button
              type="button"
              onClick={onOpenPractice}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <span>Practice Oche & Drills</span>
              <Target className="w-5 h-5 text-emerald-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </button>
          )}

          {onOpenSkillTree && (
            <button
              type="button"
              onClick={onOpenSkillTree}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <span>Player Skill Tree</span>
              <Star className="w-5 h-5 text-amber-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </button>
          )}

          {onOpenInteractiveDrills && (
            <button
              type="button"
              onClick={onOpenInteractiveDrills}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
            >
              <span>Interactive 2D Drills</span>
              <Play className="w-5 h-5 text-purple-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenRecords}
            className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
          >
            <span>Career Records & Honors</span>
            <Award className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleSaveClick}
            className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
          >
            <span>Save Career State</span>
            <Save className="text-slate-400 group-hover:text-emerald-400 transition-colors w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onReturnToMainMenu}
            className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group"
          >
            <span>Exit to Main Menu</span>
            <Home className="text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Tournament In-Progress Alert Banner */}
      {career.activeTournament && onResumeTournament && (
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-amber-500/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-2xl shadow-lg">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base">Tournament in Progress!</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black uppercase tracking-wider">
                  {career.activeTournament.config.tier}
                </span>
              </div>
              <p className="text-xs text-amber-300/90 mt-0.5 font-medium">
                {career.activeTournament.config.name} • {career.activeTournament.isCompleted ? 'Final completed! Ready to collect rewards.' : `Round ${career.activeTournament.currentRoundIndex + 1} matches pending.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResumeTournament}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Resume Knockout Bracket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2-PLAYER DEDICATED TURN & ACTION CONFIRMATION BAR AT TOP OF PAGE */}
      {is2P && p2 && (
        <div
          ref={confirmBarRef}
          className={`rounded-2xl backdrop-blur-md p-6 border-2 transition-all duration-700 shadow-2xl space-y-4 ${
            career.activePlayerIndex === 0
              ? 'bg-gradient-to-r from-amber-950/70 via-slate-900/80 to-amber-950/70 border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/30'
              : 'bg-gradient-to-r from-purple-950/70 via-slate-900/80 to-purple-950/70 border-purple-500 shadow-purple-500/10 ring-1 ring-purple-500/30'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border flex items-center gap-1.5 shadow-md ${
                    career.activePlayerIndex === 0
                      ? 'bg-amber-500 text-black border-amber-400 ring-2 ring-amber-500/40'
                      : 'bg-purple-500 text-white border-purple-400 ring-2 ring-purple-500/40'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                  <span>
                    {career.activePlayerIndex === 0
                      ? `Player 1's Go: ${p1.name}`
                      : `Player 2's Go: ${p2.name}`}
                  </span>
                </span>

                <span className="text-xs font-bold text-neutral-400">
                  {career.activePlayerIndex === 0
                    ? 'Step 1 of 2: Choose your weekly action below, then confirm here'
                    : 'Step 2 of 2: Choose your weekly action below, then confirm to execute week'}
                </span>
              </div>

              {/* Status & Intent display */}
              <div className="pt-1">
                {career.activePlayerIndex === 0 ? (
                  pendingChoice ? (
                    <div className="p-3 bg-neutral-950/80 border border-amber-500/50 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-sm font-black text-white flex items-center gap-2">
                            <span className="text-amber-400 uppercase text-xs">Selected:</span>
                            <span>{pendingChoice.title}</span>
                          </div>
                          <span className="text-xs text-neutral-400 block">{pendingChoice.subtitle}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        Ready to Lock
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-2xl text-xs text-neutral-300 flex items-center gap-2">
                      <span className="text-amber-400 text-base">👉</span>
                      <span>
                        <strong>{p1.name}</strong>: Click on a tournament card or practice/rest routine below. Your selection will appear here for confirmation.
                      </span>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-300 flex items-center gap-2 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
                      <span className="text-amber-400 font-bold">✓ {p1.name} Confirmed:</span>
                      <span className="font-semibold text-white">{getDecisionText(p1Decision)}</span>
                    </div>

                    {pendingChoice ? (
                      <div className="p-3 bg-neutral-950/80 border border-purple-500/50 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                          <div>
                            <div className="text-sm font-black text-white flex items-center gap-2">
                              <span className="text-purple-400 uppercase text-xs">Selected:</span>
                              <span>{pendingChoice.title}</span>
                              {p1Decision?.action === 'tournament' && pendingChoice.action === 'tournament' && p1Decision.tournamentConfig?.id === pendingChoice.tournamentConfig?.id && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-black flex items-center gap-1">
                                  <Swords className="w-3.5 h-3.5 text-amber-400" /> Rivalry Clash!
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400 block">{pendingChoice.subtitle}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                          Ready to Lock
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-2xl text-xs text-neutral-300 flex items-center gap-2">
                        <span className="text-purple-400 text-base">👉</span>
                        <span>
                          <strong>{p2.name}</strong>: Choose an action below. You can enter the same tournament as {p1.name.split(' ')[0]} to clash, enter another event, or train.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Confirmation Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              {career.activePlayerIndex === 1 && (
                <button
                  type="button"
                  onClick={handleRePickPlayer1}
                  className="px-4 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                  title="Re-open Player 1's turn"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-choose {p1.name.split(' ')[0]}</span>
                </button>
              )}

              {career.activePlayerIndex === 0 ? (
                <button
                  ref={confirmButtonRef}
                  type="button"
                  disabled={!pendingChoice}
                  onClick={handleConfirmPlayer1}
                  className={`px-6 py-4 rounded-2xl text-xs uppercase font-black tracking-wider transition-all flex items-center gap-2 shadow-2xl ${
                    pendingChoice
                      ? `bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30 scale-105 cursor-pointer ${
                          highlightConfirm ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-neutral-900 animate-bounce' : 'animate-pulse'
                        }`
                      : 'bg-neutral-800/80 text-neutral-500 border border-neutral-700/60 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {pendingChoice
                      ? `✓ Confirm ${p1.name.split(' ')[0]}'s Choice ➔ Hand Turn to ${p2.name.split(' ')[0]}`
                      : 'Select Action Below to Confirm'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  ref={confirmButtonRef}
                  type="button"
                  disabled={!pendingChoice}
                  onClick={handleConfirmPlayer2}
                  className={`px-6 py-4 rounded-2xl text-xs uppercase font-black tracking-wider transition-all flex items-center gap-2 shadow-2xl ${
                    pendingChoice
                      ? `bg-gradient-to-r from-purple-500 via-purple-400 to-emerald-400 hover:from-purple-400 hover:to-emerald-300 text-black shadow-purple-500/30 scale-105 cursor-pointer ${
                          highlightConfirm ? 'ring-4 ring-purple-300 ring-offset-2 ring-offset-neutral-900 animate-bounce' : 'animate-pulse'
                        }`
                      : 'bg-neutral-800/80 text-neutral-500 border border-neutral-700/60 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {pendingChoice
                      ? `✓ Confirm ${p2.name.split(' ')[0]}'s Choice & Execute Week ➔`
                      : 'Select Action Below to Confirm'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Save Notice Banner */}
      {saveNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Save className="w-4 h-4" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Active Player Status Card */}
      <div className={`bg-slate-900/60 backdrop-blur-md border shadow-2xl rounded-2xl p-6 sm:p-8 transition-all duration-700 ${
        is2P && career.activePlayerIndex === 1
          ? 'border-purple-500/60 ring-1 ring-purple-500/20'
          : 'border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-all duration-500 ${
              is2P && career.activePlayerIndex === 1
                ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-black'
                : 'bg-gradient-to-br from-amber-500 to-amber-700 text-black'
            }`}>
              {activePlayer.name.charAt(0)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-2xl font-black text-white">{activePlayer.name}</h3>
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-amber-400 font-bold border border-white/10">
                  {activePlayer.tier} tier
                </span>

                {/* Tour Card Status Badge */}
                {activePlayer.hasTourCard ? (
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm flex items-center gap-1">
                    <span>🎖️ PDC Tour Card</span>
                    <span className="text-emerald-400/80 font-normal">thru {activePlayer.tourCardExpiryYear || career.calendar.currentYear + 1}</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    Q-School Hopeful
                  </span>
                )}

                {is2P && (
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                    career.activePlayerIndex === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    Player {career.activePlayerIndex + 1}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300">
                  {activePlayer.nationality} • {activePlayer.age} yrs
                </span>

                <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium flex items-center gap-1.5">
                  <span className="text-slate-400">Rank:</span>
                  <strong className="text-white font-mono">#{career.ranking.getPlayerRank(activePlayer.id)?.currentRank ?? activePlayer.ranking}</strong>
                  {(() => {
                    const r = career.ranking.getPlayerRank(activePlayer.id);
                    if (r && r.rankChange > 0) return <span className="text-emerald-400 font-bold text-[10px]">▲{r.rankChange}</span>;
                    if (r && r.rankChange < 0) return <span className="text-rose-400 font-bold text-[10px]">▼{Math.abs(r.rankChange)}</span>;
                    return null;
                  })()}
                </div>

                <button
                  type="button"
                  onClick={onOpenShop}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                  title="Open Darts Pro Shop"
                >
                  <span>🎯</span>
                  <span>{activePlayer.equipment?.name || 'Standard Darts'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenFinances}
              className="text-right hover:scale-105 transition-all"
              title="Open Finances & Sponsorships"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block hover:text-emerald-400">
                Bank Balance ↗
              </span>
              <span className="text-xl font-mono font-black text-emerald-400">£{activePlayer.bankBalance.toLocaleString()}</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Form Rating</span>
              <span className="text-xl font-mono font-black text-amber-400">{activePlayer.state.confidence}/100</span>
            </div>
          </div>
        </div>

        {/* Dynamic Skill Ratings & Fatigue */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-xs text-neutral-400 block">Scoring Power</span>
            <span className="text-lg font-mono font-bold text-white mt-1 block">{activePlayer.attributes.scoring}</span>
            <span className="text-[10px] text-neutral-400">Triple 20 Accuracy</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-xs text-neutral-400 block">Checkout Skill</span>
            <span className="text-lg font-mono font-bold text-white mt-1 block">{activePlayer.attributes.doubling}</span>
            <span className="text-[10px] text-neutral-400">Outer Ring Finish</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-xs text-neutral-400 block">Mental Clutch</span>
            <span className="text-lg font-mono font-bold text-white mt-1 block">{activePlayer.attributes.pressure}</span>
            <span className="text-[10px] text-neutral-400">Deciding Legs</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400">Fatigue Load</span>
              <span className={`text-xs font-mono font-bold ${fatiguePercent > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {fatiguePercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${fatiguePercent > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, Math.max(0, fatiguePercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4-Week Upcoming Schedule Preview */}
      <UpcomingScheduleWidget
        career={career}
        player={activePlayer}
        onViewFullCalendar={onOpenCalendar || (() => {})}
      />

      {/* The Oche Gazette • Tour News Wire */}
      <NewsFeedWidget
        articles={OcheGazetteNews.generateWeeklyNews(
          career.calendar.currentWeek,
          career.calendar.currentYear,
          career.calendar.dateString,
          activePlayer.name,
          career.ranking.getPlayerRank(activePlayer.id)?.currentRank || activePlayer.ranking
        )}
      />

      {/* Available Circuit Tournaments */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-white">This Week's Circuit Tournaments</h3>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                categoryFilter === 'all' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('eligible')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                categoryFilter === 'eligible' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Eligible Only
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('pro')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                categoryFilter === 'pro' ? 'bg-purple-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pro Tour & Majors
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('amateur')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                categoryFilter === 'amateur' ? 'bg-amber-500/30 text-amber-300' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pub & Amateur
            </button>
          </div>
        </div>

        {/* Q-School Spotlight Banner (Weeks 1-2) */}
        {career.calendar.currentWeek <= 2 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border border-blue-500/40 shadow-lg flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xl font-bold">
                🎖️
              </div>
              <div>
                <h4 className="text-sm font-black text-white">PDC Qualifying School (Q-School) is LIVE!</h4>
                <p className="text-xs text-neutral-300 mt-0.5">
                  The ultimate battle for professional status! Win any stage outright to secure an official <strong>2-Year PDC Tour Card</strong>.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
              Week {career.calendar.currentWeek} of 2
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredTournaments.map((tourney) => {
            const eligibility = career.isPlayerEligibleForTournament(activePlayer, tourney);
            const isPendingThis = pendingChoice?.action === 'tournament' && pendingChoice.tournamentConfig?.id === tourney.id;
            const p1ConfirmedThis = p1Decision?.action === 'tournament' && p1Decision.tournamentConfig?.id === tourney.id;

            return (
              <div
                key={tourney.id}
                className={`bg-white/5 border rounded-xl p-5 flex flex-col justify-between transition-all shadow-md duration-200 ${
                  tourney.isMajor
                    ? 'border-amber-500/60 ring-1 ring-amber-500/20 bg-gradient-to-b from-amber-950/30 to-white/5'
                    : isPendingThis
                    ? career.activePlayerIndex === 0
                      ? 'border-amber-400 ring-2 ring-amber-500/50 bg-white/10 scale-[1.02]'
                      : 'border-purple-400 ring-2 ring-purple-500/50 bg-white/10 scale-[1.02]'
                    : is2P && career.activePlayerIndex === 1 && p1ConfirmedThis
                    ? 'border-purple-500/60 ring-1 ring-purple-500/30'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        tourney.isMajor
                          ? 'bg-amber-500 text-black border-amber-400 font-black'
                          : tourney.isQSchool
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : tourney.category === 'pro_tour'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-white/10 text-amber-400 border-white/10'
                      }`}>
                        {tourney.isMajor ? '👑 MAJOR' : tourney.isQSchool ? '🎖️ Q-SCHOOL' : tourney.tier}
                      </span>

                      {/* Eligibility Badge */}
                      {eligibility.eligible ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ✓ Qualified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Gated
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Winner: £{tourney.prizePool.winner.toLocaleString()}
                    </span>
                  </div>

                  {tourney.tvBroadcastName && (
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                      <Tv className="w-3 h-3 text-amber-400" />
                      <span>{tourney.tvBroadcastName}</span>
                    </div>
                  )}

                  <h4 className="font-black text-base text-white">{tourney.name}</h4>
                  <p className="text-xs text-neutral-400 mt-1">{tourney.location}</p>

                  {/* Requirements Explanation if gated */}
                  {!eligibility.eligible && eligibility.reason && (
                    <div className="mt-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                      {eligibility.reason}
                    </div>
                  )}

                  {/* 2-Player Rivalry Clash Badges */}
                  {is2P && career.activePlayerIndex === 1 && p1ConfirmedThis && !isPendingThis && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center gap-2 text-purple-200 text-xs font-bold animate-pulse">
                      <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{p1.name} entered this! Select to clash in opposite bracket halves!</span>
                    </div>
                  )}

                  {is2P && career.activePlayerIndex === 1 && p1ConfirmedThis && isPendingThis && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/30 border border-purple-500/50 flex items-center gap-2 text-white text-xs font-bold">
                      <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Rivalry Clash Selected! Confirm at top to lock in!</span>
                    </div>
                  )}

                  {isPendingThis && (!p1ConfirmedThis || career.activePlayerIndex === 0) && (
                    <div
                      onClick={scrollToConfirm}
                      className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300 text-[11px] font-bold cursor-pointer hover:bg-amber-500/20 transition-colors"
                      title="Click to jump up to confirmation button"
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Selected for {activePlayer.name.split(' ')[0]}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span>Jump to Top</span> <ArrowUp className="w-3 h-3 animate-bounce" />
                      </span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Entry Fee: £{tourney.entryFee}</span>
                    <span>Format: Best of {tourney.format.bestOfLegs || 3}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    disabled={!eligibility.eligible}
                    onClick={() => handleTournamentClick(tourney)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      !eligibility.eligible
                        ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/10'
                        : isPendingThis
                        ? career.activePlayerIndex === 0
                          ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                          : 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/20 hover:bg-purple-400'
                        : is2P && career.activePlayerIndex === 1 && p1ConfirmedThis
                        ? 'bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                    }`}
                  >
                    <span>
                      {!eligibility.eligible
                        ? 'Entry Locked'
                        : isPendingThis
                        ? '✓ Selected (Press again to Confirm ⬆)'
                        : is2P && career.activePlayerIndex === 1 && p1ConfirmedThis
                        ? '⚔️ Join & Clash in Tournament'
                        : is2P
                        ? `Select for ${activePlayer.name.split(' ')[0]}`
                        : 'Enter Tournament'}
                    </span>
                    {isPendingThis ? (
                      <ArrowUp className="w-4 h-4 animate-bounce shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Practice & Rest Routines */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-white">
              {is2P ? `${activePlayer.name.split(' ')[0]}: Weekly Training & Rest` : 'Weekly Training & Rest Routines'}
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            {is2P ? 'Click to select routine, then confirm at top' : 'Practice or rest advances the calendar week'}
          </span>
        </div>

        {/* Practice Oche Feature Card */}
        {onOpenPractice && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
                🎯
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Interactive Practice Oche & Mini-Games</h4>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Play Around the Clock, Cricket, 121 Checkout Challenge, or Shanghai to earn instant attribute XP & form boosts!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPractice}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 hover:scale-105"
            >
              <span>Play Practice Games</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { type: 'scoring' as TrainingType, label: 'Scoring Drill', desc: '+Scoring Power' },
            { type: 'doubling' as TrainingType, label: 'Double Out Drill', desc: '+Checkout Accuracy' },
            { type: 'consistency' as TrainingType, label: 'Grouping Practice', desc: '+Tight Scatter' },
            { type: 'stamina' as TrainingType, label: 'Oche Stamina', desc: '+Match Endurance' },
            { type: 'rest' as TrainingType, label: 'Full Rest Week', desc: '-35% Fatigue, +Mind' },
          ].map((item) => {
            const isPendingThis = pendingChoice?.action !== 'tournament' && pendingChoice?.trainingType === item.type;

            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleTrainClick(item.type)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isPendingThis
                    ? career.activePlayerIndex === 0
                      ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-500/40 text-white scale-105'
                      : 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/40 text-white scale-105'
                    : item.type === 'rest'
                    ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-500 hover:bg-emerald-950/40 text-white'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`block font-bold text-xs ${item.type === 'rest' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.label}
                    </span>
                    {isPendingThis && <ArrowUp className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-1 leading-tight">
                    {item.desc}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase mt-3 flex items-center justify-between">
                  <span className={isPendingThis ? 'text-amber-300 font-bold' : 'text-neutral-500'}>
                    {isPendingThis ? 'Selected (Tap again ⬆)' : item.type === 'rest' ? 'Recover' : '+Growth'}
                  </span>
                  {isPendingThis && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WEEKLY ACTION EXECUTION & RESULTS MODAL */}
      {/* Guarantees that actions NEVER skip without the player seeing what happened! */}
      {resolutionResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Weekly Action Execution
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    Week {career.calendar.currentWeek - (resolutionResult.type === 'week_advanced' ? 1 : 0)} Action Outcomes
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Season {career.calendar.currentYear}
              </span>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Player 1 Outcome */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center justify-center">
                      {p1.name.charAt(0)}
                    </div>
                    <span className="text-sm font-black text-white">{p1.name}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {resolutionResult.p1Action.action.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-amber-300">{resolutionResult.p1Action.title}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{resolutionResult.p1Action.description}</p>
                </div>

                {resolutionResult.p1Action.trainingResult && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    {resolutionResult.p1Action.trainingResult.gain > 0 && (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{resolutionResult.p1Action.trainingResult.gain} {resolutionResult.p1Action.trainingResult.attributeTrained} XP
                      </span>
                    )}
                    {resolutionResult.p1Action.trainingResult.fatigueChange !== 0 && (
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        resolutionResult.p1Action.trainingResult.fatigueChange > 0
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        {resolutionResult.p1Action.trainingResult.fatigueChange > 0 ? '+' : ''}
                        {resolutionResult.p1Action.trainingResult.fatigueChange}% Fatigue
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Player 2 Outcome (if 2P) */}
              {is2P && p2 && resolutionResult.p2Action && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center">
                        {p2.name.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-white">{p2.name}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {resolutionResult.p2Action.action.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-purple-300">{resolutionResult.p2Action.title}</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">{resolutionResult.p2Action.description}</p>
                  </div>

                  {resolutionResult.p2Action.trainingResult && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      {resolutionResult.p2Action.trainingResult.gain > 0 && (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          +{resolutionResult.p2Action.trainingResult.gain} {resolutionResult.p2Action.trainingResult.attributeTrained} XP
                        </span>
                      )}
                      {resolutionResult.p2Action.trainingResult.fatigueChange !== 0 && (
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          resolutionResult.p2Action.trainingResult.fatigueChange > 0
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        }`}>
                          {resolutionResult.p2Action.trainingResult.fatigueChange > 0 ? '+' : ''}
                          {resolutionResult.p2Action.trainingResult.fatigueChange}% Fatigue
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Continuation Buttons */}
            <div className="pt-2">
              {resolutionResult.type === 'tournament' && resolutionResult.tournament ? (
                <button
                  type="button"
                  onClick={() => {
                    const t = resolutionResult.tournament!;
                    setResolutionResult(null);
                    onEnterTournament(t.config);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Swords className="w-5 h-5" />
                  <span>Enter Tournament Bracket ({resolutionResult.tournament.config.name}) ➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResolutionResult(null);
                    onSaveGame();
                    forceUpdate();
                  }}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>Continue to Week {career.calendar.currentWeek} ➔</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Travel Booking Modal */}
      {pendingTravelTournament && (
        <TravelBookingModal
          player={activePlayer}
          tournament={pendingTravelTournament}
          onConfirm={handleTravelConfirmed}
          onCancel={() => setPendingTravelTournament(null)}
        />
      )}
    </div>
  );
};



