import React, { useState, useRef, useEffect } from 'react';
import { Player } from './core/player/Player';
import { PlayerFactory, PlayerArchetype, generateUniquePlayerId } from './core/player/PlayerFactory';
import { CareerManager } from './core/career/CareerManager';
import { TournamentConfig, BracketMatch } from './core/tournament/Tournament';
import { SaveManager } from './storage/SaveManager';
import { CITIES } from './core/world/Geography';
import { ManualInputProvider } from './input/ManualInputProvider';
import { StatisticalInputProvider } from './input/StatisticalInputProvider';
import { MatchController, MatchStateEvent } from './application/MatchController';
import { Scoreboard } from './ui/components/Scoreboard';
import { DartKeypad } from './ui/components/DartKeypad';
import { CareerDashboard } from './ui/screens/CareerDashboard';
import { TournamentBracketView } from './ui/components/TournamentBracketView';
import { MainMenu } from './ui/screens/MainMenu';
import { SaveSlotModal } from './ui/components/SaveSlotModal';
import { ExhibitionSetup } from './ui/screens/ExhibitionSetup';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { PlayerProfileScreen } from './ui/screens/PlayerProfileScreen';
import { CareerRecordsScreen } from './ui/screens/CareerRecordsScreen';
import { WorldRankingsScreen } from './ui/screens/WorldRankingsScreen';
import { EquipmentShopScreen } from './ui/screens/EquipmentShopScreen';
import { FinancesScreen } from './ui/screens/FinancesScreen';
import { StaffManagementScreen } from './ui/screens/StaffManagementScreen';
import { MedicalCentreScreen } from './ui/screens/MedicalCentreScreen';
import { PremierLeagueScreen } from './ui/screens/PremierLeagueScreen';
import { FastSimMatchView } from './ui/screens/FastSimMatchView';
import { MiniGamesScreen } from './ui/screens/MiniGamesScreen';
import { CalendarScreen } from './ui/screens/CalendarScreen';
import { MatchWalkOnModal } from './ui/components/MatchWalkOnModal';
import { MatchBoxScoreModal } from './ui/components/MatchBoxScoreModal';
import { TrophyCeremonyModal } from './ui/components/TrophyCeremonyModal';
import { TrophyAward } from './core/trophies/Trophy';
import { PdcAwardsGalaModal } from './ui/components/PdcAwardsGalaModal';
import { NineDarterSpectacleModal } from './ui/components/NineDarterSpectacleModal';
import { NarrativeDilemmaModal } from './ui/components/NarrativeDilemmaModal';
import { NarrativeDilemmaManager } from './core/career/NarrativeDilemmaManager';
import { HybridMatchScreen } from './ui/screens/HybridMatchScreen';
import { PreMatchMindGamesModal } from './ui/components/PreMatchMindGamesModal';
import { BroadcastDartboard } from './ui/components/BroadcastDartboard';
import { DartCoordinates } from './core/match/DartCoordinates';
import { TrainingMinigameScreen } from './ui/screens/TrainingMinigameScreen';
import { SkillTreeScreen } from './ui/screens/SkillTreeScreen';
import { TravelBookingModal } from './ui/components/TravelBookingModal';
import { MinigameResult } from './core/training/Minigames';
import { PERK_DEFINITIONS } from './core/player/SkillTree';
import { MindGameStanceType, MindGameResult } from './core/rivalry/MindGamesManager';

import { PostMatchPressModal } from './ui/components/PostMatchPressModal';
import { PressConferenceManager, PressQuestion, MatchPressContext } from './core/media/PressConferenceManager';
import { DebugModal } from './ui/components/DebugModal';
import { DebugTracker } from './core/debug/DebugTracker';
import { AudioManager } from './core/audio/AudioManager';
import { DartResult } from './core/match/DartResult';
import { Visit } from './core/match/Visit';
import { CareerManagerShell } from './ui/components/CareerManagerShell';
import { CareerPageView } from './ui/components/CareerNavigationConfig';
import confetti from 'canvas-confetti';
import { Target, User, Sparkles, ChevronRight, Home, ArrowLeft, Gauge, Award, Bug, Shield, Users } from 'lucide-react';

type AppView =
  | 'main_menu'
  | 'settings'
  | 'create_career'
  | 'career_dashboard'
  | 'career_calendar'
  | 'player_profile'
  | 'career_records'
  | 'world_rankings'
  | 'premier_league'
  | 'equipment_shop'
  | 'finances'
  | 'support_staff'
  | 'medical_centre'
  | 'practice_minigames'
  | 'tournament_bracket'
  | 'fast_sim_match'
  | 'exhibition_setup'
  | 'live_match'
  | 'training_minigame'
  | 'skill_tree'
  | 'travel_booking';

const isCareerView = (v: AppView): v is CareerPageView => {
  return [
    'career_dashboard',
    'player_profile',
    'career_calendar',
    'world_rankings',
    'premier_league',
    'equipment_shop',
    'finances',
    'support_staff',
    'medical_centre',
    'practice_minigames',
    'career_records',
    'training_minigame',
    'skill_tree'
  ].includes(v);
};

export default function App() {
  const [view, setView] = useState<AppView>('main_menu');
  const [practiceReturnView, setPracticeReturnView] = useState<'main_menu' | 'career_dashboard'>('main_menu');
  const [, setRefreshCount] = useState(0);

  // Save Slots Modal State
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotModalMode, setSlotModalMode] = useState<'load' | 'select_for_new'>('load');
  const [selectedSlotForNew, setSelectedSlotForNew] = useState<number>(1);

  // Career Creation State
  const [careerModeType, setCareerModeType] = useState<'solo' | 'two_player'>('solo');
  const [playerName, setPlayerName] = useState('John The Power');
  const [archetype, setArchetype] = useState<PlayerArchetype>('balanced');
  const [homeBaseId, setHomeBaseId] = useState<string>('london');
  const [player2HomeBaseId, setPlayer2HomeBaseId] = useState<string>('london');
  const [player2Name, setPlayer2Name] = useState('Rival Rob');
  const [player2Archetype, setPlayer2Archetype] = useState<PlayerArchetype>('heavy_scorer');

  // Loaded Career State
  const [career, setCareer] = useState<CareerManager | null>(null);

  // Match State
  const [isExhibition, setIsExhibition] = useState<boolean>(false);
  const [isLocal2P, setIsLocal2P] = useState<boolean>(false);
  const [isCalibration, setIsCalibration] = useState<boolean>(false);
  const [isHybridCompanionMode, setIsHybridCompanionMode] = useState<boolean>(false);
  const [showMindGames, setShowMindGames] = useState<boolean>(false);
  const [activeMindGameResult, setActiveMindGameResult] = useState<MindGameResult | null>(null);
  const [activeMatch, setActiveMatch] = useState<BracketMatch | null>(null);
  const [controller, setController] = useState<MatchController | null>(null);
  const [matchState, setMatchState] = useState<MatchStateEvent | null>(null);
  const [showWalkOn, setShowWalkOn] = useState<boolean>(false);
  const [activePressQuestions, setActivePressQuestions] = useState<PressQuestion[] | null>(null);
  const [pressPlayer, setPressPlayer] = useState<Player | null>(null);
  const [pendingPostMatchAction, setPendingPostMatchAction] = useState<(() => void) | null>(null);

  const [pendingTravelTournament, setPendingTravelTournament] = useState<TournamentConfig | null>(null);
  const [trainingGame, setTrainingGame] = useState<'around_the_clock' | 'bobs_27'>('around_the_clock');
  const [activeTrophyAward, setActiveTrophyAward] = useState<{
    trophy: TrophyAward;
    winner: Player;
    tournamentName: string;
    tournamentLocation: string;
    prizeMoney: number;
    rankingPoints: number;
    onContinue: () => void;
  } | null>(null);

  const [nineDarterCelebration, setNineDarterCelebration] = useState<{ playerName: string; tournamentName: string } | null>(null);


  const manualProviderRef = useRef<ManualInputProvider>(new ManualInputProvider());

  const forceRender = () => setRefreshCount(c => c + 1);

  const [showDebugModal, setShowDebugModal] = useState<boolean>(false);

  useEffect(() => {
    DebugTracker.getInstance().addLog('info', `Navigated to view: ${view}`);
  }, [view]);

  // 1. Slot Selection Handlers
  const handleSlotSelected = (slotId: number) => {
    if (slotModalMode === 'load') {
      const loaded = SaveManager.loadGame(slotId);
      if (loaded) {
        setCareer(loaded);
        setShowSlotModal(false);
        setView('career_dashboard');
      }
    } else {
      setSelectedSlotForNew(slotId);
      setShowSlotModal(false);
      setView('create_career');
    }
  };

  const handleNewGameInSlot = (slotId: number) => {
    setSelectedSlotForNew(slotId);
    setShowSlotModal(false);
    setView('create_career');
  };

  // 2. Career Creation
  const handleCreateCareer = () => {
    const factory = new PlayerFactory();
    const p1 = factory.createPlayer({
      name: playerName.trim() || 'Player 1',
      gender: 'male',
      nationality: 'England',
        homeBaseId: homeBaseId,
      archetype: archetype
    }, generateUniquePlayerId('p1'));

    const players: Player[] = [p1];

    if (careerModeType === 'two_player') {
      const p2 = factory.createPlayer({
        name: player2Name.trim() || 'Player 2',
        gender: 'male',
        nationality: 'Scotland',
          homeBaseId: player2HomeBaseId,
        archetype: player2Archetype
      }, generateUniquePlayerId('p2'));
      players.push(p2);
    }

    const newCareer = new CareerManager(players);
    newCareer.activeSlotId = selectedSlotForNew;
    SaveManager.saveGame(selectedSlotForNew, newCareer);

    setCareer(newCareer);
    setView('career_dashboard');
  };

  // 3. Tournament Entry
  const handleEnterTournament = (config: TournamentConfig) => {
    if (!career) return;
    if (!career.activeTournament) {
      career.enterTournament(config);
    }
    SaveManager.saveGame(career.activeSlotId, career);
    setView('tournament_bracket');
  };

  // 4. Play Hybrid Match (Throw Real Darts)
  const handlePlayHybridMatch = (bracketMatch: BracketMatch) => {
    if (!career) return;
    setIsExhibition(false);
    setIsCalibration(false);
    setActiveMatch(bracketMatch);

    const isH2H = career.isTwoPlayer &&
      career.humanPlayerIds.includes(bracketMatch.player1.id) &&
      career.humanPlayerIds.includes(bracketMatch.player2.id);

    setIsLocal2P(isH2H);

    let matchP1: Player;
    let matchP2: Player;
    let p1Provider: ManualInputProvider;
    let p2Provider: ManualInputProvider | StatisticalInputProvider;

    if (isH2H) {
      matchP1 = bracketMatch.player1;
      matchP2 = bracketMatch.player2;
      p1Provider = new ManualInputProvider();
      p2Provider = new ManualInputProvider();
      manualProviderRef.current = p1Provider;
    } else {
      // Single human vs CPU match: ensure MatchController.player is always the human
      const isP1Human = career.humanPlayerIds.includes(bracketMatch.player1.id);
      matchP1 = isP1Human ? bracketMatch.player1 : bracketMatch.player2;
      matchP2 = isP1Human ? bracketMatch.player2 : bracketMatch.player1;
      p1Provider = new ManualInputProvider();
      p2Provider = new StatisticalInputProvider(matchP2);
      manualProviderRef.current = p1Provider;
    }

    let matchFormat = career.activeTournament?.config.format || {
      type: 'legs',
      bestOfLegs: 3,
      startingScore: 501,
      doubleOutRequired: true
    };

    if (career.activeTournament?.config.id.includes('world-championship') || career.activeTournament?.config.name.includes('World Darts Championship')) {
      const bestOfSets = bracketMatch.roundName === 'Final' ? 13 : bracketMatch.roundName === 'Semi-Final' ? 11 : 9;
      matchFormat = {
        type: 'sets',
        bestOfSets,
        legsPerSet: 3,
        startingScore: 501,
        doubleOutRequired: true
      };
    }

    const newController = new MatchController(
      matchP1,
      matchP2,
      p1Provider,
      p2Provider,
      matchFormat
    );

    newController.subscribe((event) => {
      setMatchState({ ...event });
      if (event.isNineDarter) {
        setNineDarterCelebration({
          playerName: event.nineDarterPlayerName || 'The Player',
          tournamentName: career?.activeTournament?.config.name || 'PDC Circuit'
        });
      }
      if (event.status === 'match_completed') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    });

    setController(newController);
    setIsHybridCompanionMode(false);
    setActiveMindGameResult(null);

    const isRivalry = Boolean(career.rivalryLedger?.[matchP1.id]?.[matchP2.id]);
    const isMajor = career.activeTournament?.config.id.includes('world-championship') ||
                    career.activeTournament?.config.category === 'major' ||
                    bracketMatch.roundName === 'Final' ||
                    bracketMatch.roundName === 'Semi-Final';

    if (isRivalry || isMajor) {
      setShowMindGames(true);
      setShowWalkOn(false);
    } else {
      setShowMindGames(false);
      setShowWalkOn(true);
    }
    setView('live_match');
  };

  // 5. Statistically Simulate Match (Open Fast Sped-Up View)
  const handleSimulateMatch = (bracketMatch: BracketMatch) => {
    if (!career || !career.activeTournament) return;
    setActiveMatch(bracketMatch);
    setView('fast_sim_match');
  };

  // Conclude Fast Simulation Match
  const handleFastSimFinished = () => {
    if (!career || !career.activeTournament || !activeMatch) return;

    if (activeMatch.match && activeMatch.winner) {
      career.recordMatchStats(activeMatch.match, activeMatch.winner.id);
    }

    // Simulate rest of AI matches in current round
    career.activeTournament.simulateAIMatches(career.humanPlayerIds);

    const currentMatches = career.activeTournament.getCurrentRoundMatches();
    const hasUnfinishedMatches = currentMatches.some(m => !m.isCompleted);
    if (!hasUnfinishedMatches) {
      career.activeTournament.advanceRound();
    }

    if (career.activeTournament.isCompleted) {
      career.finalizeTournament(career.activeTournament);
    }

    const onFinishNavigation = () => {
      SaveManager.saveGame(career.activeSlotId, career);
      setActiveMatch(null);
      forceRender();

      if (career.activeTournament) {
        setView('tournament_bracket');
      } else {
        setView('career_dashboard');
      }
    };

    const isHumanChampion = Boolean(activeMatch.winner && career.activeTournament.isCompleted && career.humanPlayerIds.includes(activeMatch.winner.id));
    const championTrophy = isHumanChampion && career.trophyAwards.length > 0 ? career.trophyAwards[career.trophyAwards.length - 1] : null;

    if (activeMatch.match && activeMatch.winner) {
      const isHumanP1 = career.humanPlayerIds.includes(activeMatch.player1.id);
      const humanP = isHumanP1 ? activeMatch.player1 : activeMatch.player2;
      const oppP = isHumanP1 ? activeMatch.player2 : activeMatch.player1;
      const pStats = activeMatch.match.getOverallStats(humanP.id);
      const oppStats = activeMatch.match.getOverallStats(oppP.id);

      const pressCtx: MatchPressContext = {
        won: activeMatch.winner.id === humanP.id,
        playerAvg: pStats.average,
        opponentAvg: oppStats.average,
        isDecidingLeg: activeMatch.match.legs.length >= (activeMatch.match.format.bestOfLegs || 3),
        isRivalry: Boolean(career.rivalryLedger?.[humanP.id]?.[oppP.id]),
        rivalryRecord: career.rivalryLedger?.[humanP.id]?.[oppP.id] || null,
        opponentName: oppP.name,
        tournamentName: career.activeTournament?.config.name || 'Tour Knockout',
        doublesAttempted: pStats.doublesAttempted,
        doublesHit: pStats.doublesHit,
      };

      const questions = PressConferenceManager.generateQuestions(pressCtx);
      if (questions.length > 0) {
        setPressPlayer(humanP);
        setActivePressQuestions(questions);
        setPendingPostMatchAction(() => onFinishNavigation);
        return;
      }
    }

    if (championTrophy && activeMatch.winner) {
      setActiveTrophyAward({
        trophy: championTrophy,
        winner: activeMatch.winner,
        tournamentName: career.activeTournament.config.name,
        tournamentLocation: career.activeTournament.config.location,
        prizeMoney: career.activeTournament.config.prizePool.winner,
        rankingPoints: career.activeTournament.config.rankingPoints.winner,
        onContinue: () => {
          setActiveTrophyAward(null);
          onFinishNavigation();
        }
      });
      return;
    }

    onFinishNavigation();
  };

  // 6. Launch Exhibition Match
  const handleStartExhibitionMatch = (
    p1: Player,
    p2: Player,
    is2P: boolean,
    bestOfLegs: number,
    calibration: boolean = false,
    isHybrid: boolean = false
  ) => {
    setIsExhibition(true);
    setIsLocal2P(is2P);
    setIsCalibration(calibration);
    setIsHybridCompanionMode(isHybrid);
    setActiveMindGameResult(null);

    const p1Provider = new ManualInputProvider();
    const p2Provider = is2P ? new ManualInputProvider() : new StatisticalInputProvider(p2);

    const newController = new MatchController(
      p1,
      p2,
      p1Provider,
      p2Provider,
      { type: 'legs', bestOfLegs, startingScore: 501, doubleOutRequired: true }
    );

    newController.subscribe((event) => {
      setMatchState({ ...event });
      if (event.isNineDarter) {
        setNineDarterCelebration({
          playerName: event.nineDarterPlayerName || 'The Player',
          tournamentName: calibration ? 'Skill Calibration' : 'Exhibition Match'
        });
      }
      if (event.status === 'match_completed') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    });

    setController(newController);
    if (!calibration && !is2P && !isHybrid) {
      setShowMindGames(true);
      setShowWalkOn(false);
    } else {
      setShowMindGames(false);
      setShowWalkOn(true);
    }
    setView('live_match');
  };

  // 7. Conclude Hybrid Match
  const handleMatchConcluded = () => {
    AudioManager.stopAllSpeech();
    setShowMindGames(false);
    setActiveMindGameResult(null);
    setIsHybridCompanionMode(false);
    if (isExhibition) {
      setController(null);
      setMatchState(null);
      setIsCalibration(false);
      setView('main_menu');
      return;
    }

    if (!career || !career.activeTournament || !activeMatch || !matchState) return;

    const winnerId = matchState.winnerId!;
    career.activeTournament.completeHumanMatch(activeMatch.id, winnerId);

    if (controller?.match) {
      career.recordMatchStats(controller.match, winnerId);
    }

    career.activeTournament.simulateAIMatches(career.humanPlayerIds);

    const currentMatches = career.activeTournament.getCurrentRoundMatches();
    const hasUnfinishedMatches = currentMatches.some(m => !m.isCompleted);
    if (!hasUnfinishedMatches) {
      career.activeTournament.advanceRound();
    }

    if (career.activeTournament.isCompleted) {
      career.finalizeTournament(career.activeTournament);
    }

    const onFinishNavigation = () => {
      SaveManager.saveGame(career.activeSlotId, career);
      setController(null);
      setMatchState(null);
      setActiveMatch(null);
      forceRender();

      if (career.activeTournament) {
        setView('tournament_bracket');
      } else {
        setView('career_dashboard');
      }
    };

    const isHumanChampion = Boolean(controller && career.activeTournament.isCompleted && winnerId === controller.player.id);
    const championTrophy = isHumanChampion && career.trophyAwards.length > 0 ? career.trophyAwards[career.trophyAwards.length - 1] : null;

    const proceedWithPostMatch = () => {
      if (controller?.match) {
        const pStats = controller.match.getOverallStats(controller.player.id);
        const oppStats = controller.match.getOverallStats(controller.opponent.id);
        const pressCtx: MatchPressContext = {
          won: winnerId === controller.player.id,
          playerAvg: pStats.average,
          opponentAvg: oppStats.average,
          isDecidingLeg: controller.match.legs.length >= (controller.match.format.bestOfLegs || 3),
          isRivalry: Boolean(career.rivalryLedger?.[controller.player.id]?.[controller.opponent.id]),
          rivalryRecord: career.rivalryLedger?.[controller.player.id]?.[controller.opponent.id] || null,
          opponentName: controller.opponent.name,
          tournamentName: career.activeTournament?.config.name || 'Tour Knockout',
          doublesAttempted: pStats.doublesAttempted,
          doublesHit: pStats.doublesHit,
        };

        const questions = PressConferenceManager.generateQuestions(pressCtx);
        if (questions.length > 0) {
          setPressPlayer(controller.player);
          setActivePressQuestions(questions);
          setPendingPostMatchAction(() => onFinishNavigation);
          return;
        }
      }
      onFinishNavigation();
    };

    if (championTrophy && controller) {
      setActiveTrophyAward({
        trophy: championTrophy,
        winner: controller.player,
        tournamentName: career.activeTournament.config.name,
        tournamentLocation: career.activeTournament.config.location,
        prizeMoney: career.activeTournament.config.prizePool.winner,
        rankingPoints: career.activeTournament.config.rankingPoints.winner,
        onContinue: () => {
          setActiveTrophyAward(null);
          proceedWithPostMatch();
        }
      });
      return;
    }

    proceedWithPostMatch();
  };

  const handleConfirmVisit = (darts: DartResult[]) => {
    if (!controller) return;
    const leg = controller.match.currentLeg;
    const turnPlayer = leg.currentTurnPlayerId === controller.player.id ? controller.player : controller.opponent;
    const scoreBefore = leg.getRemainingScore(turnPlayer.id);
    const visit = new Visit(turnPlayer.id, scoreBefore, darts);
    controller.processPlayerVisit(visit);
  };

  const handleQuickTotal = (total: number) => {
    if (!controller) return;
    const leg = controller.match.currentLeg;
    const turnPlayer = leg.currentTurnPlayerId === controller.player.id ? controller.player : controller.opponent;
    const scoreBefore = leg.getRemainingScore(turnPlayer.id);
    const visit = Visit.fromTotal(turnPlayer.id, scoreBefore, total);
    controller.processPlayerVisit(visit);
  };

  const getRecommendation = (avg: number) => {
    if (avg < 48) {
      return { tier: 'Pub Circuit', range: 'Avg ~40 - 48', desc: 'Ideal starting tier to build scoring consistency and oche confidence.' };
    }
    if (avg < 60) {
      return { tier: 'Amateur Circuit', range: 'Avg ~48 - 58', desc: 'Competitive pub champions and amateur regional open competitors.' };
    }
    if (avg < 72) {
      return { tier: 'Semi-Pro Tour', range: 'Avg ~60 - 72', desc: 'High standard county players pushing for Q-School qualification.' };
    }
    if (avg < 85) {
      return { tier: 'PDC Pro Tour', range: 'Avg ~75 - 85', desc: 'Elite professional circuit. Heavy trebles and ruthless clinical finishes.' };
    }
    return { tier: 'World Elite', range: 'Avg ~88 - 100+', desc: 'World Championship contender. Frequent 180s and explosive ton-plus checkouts.' };
  };

  const is2PCareer = Boolean(career && career.isTwoPlayer);
  const activePIdx = career ? career.activePlayerIndex : 0;
  const isP2Turn = is2PCareer && activePIdx === 1;

  const appWrapperClass = !is2PCareer
    ? 'min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black transition-colors duration-700'
    : !isP2Turn
    ? 'min-h-screen bg-gradient-to-b from-amber-950/40 via-neutral-950 to-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black border-t-4 border-amber-500 shadow-[0_-12px_45px_rgba(245,158,11,0.25)] transition-colors duration-700'
    : 'min-h-screen bg-gradient-to-b from-purple-950/50 via-neutral-950 to-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white border-t-4 border-purple-500 shadow-[0_-12px_45px_rgba(168,85,247,0.3)] transition-colors duration-700';

  return (
    <div className={appWrapperClass}>
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div
          onClick={() => setView('main_menu')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Target className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
              DARTS CAREER SIM
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Hybrid + Sim
              </span>
            </h1>
            <p className="text-xs text-neutral-400">Master Core Concept • 4 Save Slots • 2-Player Shared Circuit</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Save Slot Selector Button */}
          <button
            type="button"
            onClick={() => {
              setSlotModalMode('load');
              setShowSlotModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-700/80 hover:border-amber-500/60 text-xs font-semibold text-neutral-300 transition-colors shadow-inner"
            title="Select or Switch Game Save Slot"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {career ? `Slot ${career.activeSlotId}: ${career.player.name.split(' ')[0]}` : 'Save Slots'}
            </span>
          </button>

          {/* 2-Player Turn / Tournament Indicator Header Badge */}
          {is2PCareer && career && career.players.length > 1 && (
            (() => {
              if (career.activeTournament) {
                const tourneyHumans = career.players.filter(p => career.activeTournament!.participants.some(tp => tp.id === p.id));
                if (tourneyHumans.length > 1) {
                  return (
                    <div className="px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/40 shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                      <span>⚔️ 2-Player Shared Tournament</span>
                    </div>
                  );
                } else if (tourneyHumans.length === 1) {
                  const solePlayer = tourneyHumans[0];
                  const isSoleP2 = solePlayer.id === career.players[1].id;
                  return (
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md ${
                      isSoleP2
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/40'
                        : 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${isSoleP2 ? 'bg-purple-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                      <span>🏆 {solePlayer.name.split(' ')[0]} ({isSoleP2 ? 'P2' : 'P1'}) Knockout</span>
                    </div>
                  );
                }
              }

              return (
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                    !isP2Turn
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40'
                      : 'bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/40'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    !isP2Turn ? 'bg-amber-400 animate-pulse' : 'bg-purple-400 animate-pulse'
                  }`} />
                  <span>
                    {!isP2Turn
                      ? `Turn: ${career.players[0].name.split(' ')[0]} (P1)`
                      : `Turn: ${career.players[1].name.split(' ')[0]} (P2)`}
                  </span>
                </div>
              );
            })()
          )}

          {/* Debug Tickbox Always Visible */}
          <label
            className="flex items-center gap-2 cursor-pointer bg-neutral-950/80 border border-neutral-700/80 hover:border-amber-500/60 px-3 py-1.5 rounded-xl transition-all select-none shadow-inner"
            title="Open Debug Diagnostics & State Inspector"
          >
            <input
              type="checkbox"
              checked={showDebugModal}
              onChange={(e) => setShowDebugModal(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-neutral-200">Debug</span>
            {DebugTracker.getInstance().getErrorCount() > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </label>

          {view !== 'main_menu' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('main_menu')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Main Menu
              </button>
              {career && view !== 'career_dashboard' && view !== 'live_match' && view !== 'fast_sim_match' && (
                <button
                  type="button"
                  onClick={() => setView('career_dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors"
                >
                  Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main View Container */}
      <main className={`flex-1 w-full mx-auto flex flex-col justify-center ${view === "live_match" ? "max-w-5xl p-1 sm:p-2 max-h-[calc(100vh-4rem)] overflow-hidden" : "max-w-5xl p-4 sm:p-6"}`}>
        {view === 'main_menu' && (
          <MainMenu
            onNewGame={() => {
              setSlotModalMode('select_for_new');
              setShowSlotModal(true);
            }}
            onContinue={() => {
              setSlotModalMode('load');
              setShowSlotModal(true);
            }}
            onSingleMatch={() => setView('exhibition_setup')}
            onOpenPractice={() => {
              setPracticeReturnView('main_menu');
              setView('practice_minigames');
            }}
            onOpenSettings={() => setView('settings')}
          />
        )}

        {view === 'settings' && (
          <SettingsScreen onBack={() => setView('main_menu')} />
        )}

        {view === 'exhibition_setup' && (
          <ExhibitionSetup
            onStartMatch={handleStartExhibitionMatch}
            onBack={() => setView('main_menu')}
          />
        )}

        {view === 'create_career' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto w-full animate-fade-in space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
                Create Career in Slot {selectedSlotForNew}
              </span>
              <button
                type="button"
                onClick={() => setView('main_menu')}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>

            {/* Mode Selection: Solo vs 2-Player */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2">
                Select Career Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCareerModeType('solo')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    careerModeType === 'solo'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/30'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    careerModeType === 'solo' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-white">Solo Career</span>
                    <span className="text-xs text-neutral-400">1 Player • Pub to World Champion</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCareerModeType('two_player')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    careerModeType === 'two_player'
                      ? 'bg-purple-500/10 border-purple-500 text-white shadow-lg ring-1 ring-purple-500/30'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    careerModeType === 'two_player' ? 'bg-purple-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-white">2-Player Rivalry</span>
                    <span className="text-xs text-neutral-400">Shared Circuit • Independent Weekly Turns</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Player 1 Setup */}
            <div className="space-y-4 pt-2 border-t border-neutral-800/80">
              <h3 className="text-xs uppercase font-bold tracking-wider text-amber-400">
                {careerModeType === 'two_player' ? 'Player 1 Details' : 'Player Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Player Name
    </label>
    <div className="relative">
      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"
      />
    </div>
  </div>
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Home Base / Travel Hub
    </label>
    <select
      value={homeBaseId}
      onChange={(e) => setHomeBaseId(e.target.value)}
      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
    >
      {Object.values(CITIES).map(city => (
        <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
      ))}
    </select>
  </div>
</div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-semibold">
                  Starting Strength / Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'heavy_scorer', label: 'Heavy Scorer', desc: 'High Trebles & 180s' },
                    { id: 'clinical_finisher', label: 'Finisher', desc: 'Clinical double out' },
                    { id: 'steady_grinder', label: 'Grinder', desc: 'Durable consistency' },
                    { id: 'balanced', label: 'Balanced', desc: 'Solid all-around traits' },
                    { id: 'raw_talent', label: 'Raw Talent', desc: 'High ceiling, volatile' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArchetype(item.id as PlayerArchetype)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        archetype === item.id
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="block font-bold text-xs text-amber-400">{item.label}</span>
                      <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Player 2 Setup (If 2-Player mode) */}
            {careerModeType === 'two_player' && (
              <div className="space-y-4 pt-4 border-t border-neutral-800/80 animate-fade-in">
                <h3 className="text-xs uppercase font-bold tracking-wider text-purple-400">
                  Player 2 Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Player 2 Name
    </label>
    <div className="relative">
      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
      <input
        type="text"
        value={player2Name}
        onChange={(e) => setPlayer2Name(e.target.value)}
        className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"
      />
    </div>
  </div>
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Home Base / Travel Hub
    </label>
    <select
      value={player2HomeBaseId}
      onChange={(e) => setPlayer2HomeBaseId(e.target.value)}
      className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
    >
      {Object.values(CITIES).map(city => (
        <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
      ))}
    </select>
  </div>
</div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-semibold">
                    Player 2 Archetype
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'heavy_scorer', label: 'Heavy Scorer', desc: 'High Trebles & 180s' },
                      { id: 'clinical_finisher', label: 'Finisher', desc: 'Clinical double out' },
                      { id: 'steady_grinder', label: 'Grinder', desc: 'Durable consistency' },
                      { id: 'balanced', label: 'Balanced', desc: 'Solid all-around traits' },
                      { id: 'raw_talent', label: 'Raw Talent', desc: 'High ceiling, volatile' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPlayer2Archetype(item.id as PlayerArchetype)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          player2Archetype === item.id
                            ? 'bg-purple-500/10 border-purple-500 text-white shadow-md'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <span className="block font-bold text-xs text-purple-400">{item.label}</span>
                        <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateCareer}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Launch {careerModeType === 'two_player' ? '2-Player Career' : 'Solo Career'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {career && isCareerView(view) ? (
          <CareerManagerShell
            career={career}
            currentView={view}
            onNavigate={(nextView) => setView(nextView)}
            onAdvanceWeek={() => {
              career.advanceWeek();
              SaveManager.saveGame(career.activeSlotId, career);
              forceRender();
            }}
            onSaveGame={() => {
              SaveManager.saveGame(career.activeSlotId, career);
            }}
            onReturnToMainMenu={() => {
              SaveManager.saveGame(career.activeSlotId, career);
              setView('main_menu');
            }}
            onResumeTournament={() => setView('tournament_bracket')}
          >
            {view === 'career_dashboard' && (
              <CareerDashboard
                career={career}
                onEnterTournament={handleEnterTournament}
                onAdvanceWeek={() => {
                  career.advanceWeek();
                  SaveManager.saveGame(career.activeSlotId, career);
                  forceRender();
                }}
                onTrain={() => {
                  SaveManager.saveGame(career.activeSlotId, career);
                  forceRender();
                }}
                onSaveGame={() => {
                  SaveManager.saveGame(career.activeSlotId, career);
                }}
                onReturnToMainMenu={() => {
                  SaveManager.saveGame(career.activeSlotId, career);
                  setView('main_menu');
                }}
                onOpenProfile={() => setView('player_profile')}
                onOpenRecords={() => setView('career_records')}
                onOpenRankings={() => setView('world_rankings')}
                onOpenCalendar={() => setView('career_calendar')}
                onOpenPremierLeague={() => setView('premier_league')}
                onOpenShop={() => setView('equipment_shop')}
                onOpenFinances={() => setView('finances')}
                onOpenStaff={() => setView('support_staff')}
                onOpenMedical={() => setView('medical_centre')}
                onOpenPractice={() => {
                  setPracticeReturnView('career_dashboard');
                  setView('practice_minigames');
                }}
                onOpenInteractiveDrills={() => setView('training_minigame')}
                onOpenSkillTree={() => setView('skill_tree')}
                onResumeTournament={() => setView('tournament_bracket')}
              />
            )}

            {view === 'career_calendar' && (
              <CalendarScreen
                career={career}
                onBack={() => setView('career_dashboard')}
                onSelectCurrentTournament={handleEnterTournament}
              />
            )}

            {view === 'player_profile' && (
              <PlayerProfileScreen
                player={career.players[0]}
                secondPlayer={career.isTwoPlayer && career.players.length > 1 ? career.players[1] : undefined}
                career={career}
                onViewFullCalendar={() => setView('career_calendar')}
                onBack={() => setView('career_dashboard')}
              />
            )}

            {view === 'career_records' && (
              <CareerRecordsScreen
                career={career}
                onBack={() => setView('career_dashboard')}
              />
            )}

            {view === 'world_rankings' && (
              <WorldRankingsScreen
                career={career}
                onBack={() => setView('career_dashboard')}
              />
            )}

            {view === 'equipment_shop' && (
              <EquipmentShopScreen
                career={career}
                onBack={() => setView('career_dashboard')}
                onSave={() => SaveManager.saveGame(career.activeSlotId, career)}
              />
            )}

            {view === 'finances' && (
              <FinancesScreen
                career={career}
                onBack={() => setView('career_dashboard')}
                onSave={() => SaveManager.saveGame(career.activeSlotId, career)}
              />
            )}

            {view === 'support_staff' && (
              <StaffManagementScreen
                career={career}
                onBack={() => setView('career_dashboard')}
                onSave={() => SaveManager.saveGame(career.activeSlotId, career)}
              />
            )}

            {view === 'medical_centre' && (
              <MedicalCentreScreen
                career={career}
                onBack={() => setView('career_dashboard')}
                onSave={() => SaveManager.saveGame(career.activeSlotId, career)}
              />
            )}

            {view === 'premier_league' && (
              <PremierLeagueScreen
                career={career}
                onBack={() => setView('career_dashboard')}
              />
            )}

            {view === 'practice_minigames' && (
              <MiniGamesScreen
                career={career}
                onBack={() => setView(practiceReturnView)}
                onApplyCareerTrainingReward={(gameName, attribute, amount) => {
                  career.addLog({
                    week: career.calendar.currentWeek,
                    year: career.calendar.currentYear,
                    title: `Training Complete: ${gameName}`,
                    description: `Gained +${amount} ${attribute} attribute and +4 Form from practice session.`,
                    type: 'training'
                  });
                  SaveManager.saveGame(career.activeSlotId, career);
                }}
              />
            )}

            {view === 'training_minigame' && (
              <TrainingMinigameScreen
                player={career.players[career.activePlayerIndex] || career.player}
                minigame={trainingGame}
                onCancel={() => setView('career_dashboard')}
                onComplete={(result: MinigameResult) => {
                  const p = career.players[career.activePlayerIndex] || career.player;
                  p.xp += result.xpEarned;
                  p.state.form = Math.min(100, Math.max(0, p.state.form + result.formChange));
                  career.addLog({
                    week: career.calendar.currentWeek,
                    year: career.calendar.currentYear,
                    title: `Interactive Drill: ${trainingGame}`,
                    description: `Scored ${result.score}. Earned ${result.xpEarned} XP. Form ${result.formChange > 0 ? '+' : ''}${result.formChange}.`,
                    type: 'training'
                  });
                  SaveManager.saveGame(career.activeSlotId, career);
                  setView('career_dashboard');
                }}
              />
            )}

            {view === 'skill_tree' && (
              <SkillTreeScreen
                player={career.players[career.activePlayerIndex] || career.player}
                onBack={() => setView('career_dashboard')}
                onUnlockPerk={(perkId) => {
                  const p = career.players[career.activePlayerIndex] || career.player;
                  const def = PERK_DEFINITIONS[perkId] || { xpCost: 1000, name: perkId };
                  if (p.xp >= def.xpCost && !p.perks.includes(perkId)) {
                    p.xp -= def.xpCost;
                    p.perks.push(perkId);
                    career.addLog({
                      week: career.calendar.currentWeek,
                      year: career.calendar.currentYear,
                      title: `Perk Unlocked: ${def.name}`,
                      description: `Spent ${def.xpCost} XP to unlock new abilities.`,
                      type: 'milestone'
                    });
                    SaveManager.saveGame(career.activeSlotId, career);
                    setRefreshCount(c => c + 1);
                  }
                }}
              />
            )}
          </CareerManagerShell>
        ) : (
          view === 'practice_minigames' && (
            <MiniGamesScreen
              career={career}
              onBack={() => setView(practiceReturnView)}
              onApplyCareerTrainingReward={(gameName, attribute, amount) => {
                if (career) {
                  SaveManager.saveGame(career.activeSlotId, career);
                }
                forceRender();
              }}
            />
          )
        )}

        {view === 'tournament_bracket' && career && career.activeTournament && (
          <TournamentBracketView
            tournament={career.activeTournament}
            humanPlayer={career.players[0]}
            secondPlayer={career.isTwoPlayer && career.players.length > 1 ? career.players[1] : undefined}
            allPlayers={career.players}
            onPlayHybridMatch={handlePlayHybridMatch}
            onSimulateMatch={handleSimulateMatch}
            onLeaveTournament={() => {
              if (career.activeTournament) {
                if (!career.activeTournament.isCompleted) {
                  career.activeTournament.simulateRestOfTournament();
                }
                career.finalizeTournament(career.activeTournament);
                career.activeTournament = null;
              }
              if (career.pendingTournaments.length > 0) {
                const next = career.pendingTournaments.shift()!;
                career.enterTournament(next.config, [next.player]);
                career.setActivePlayerById(next.player.id);
                SaveManager.saveGame(career.activeSlotId, career);
                forceRender();
                setView('tournament_bracket');
              } else {
                career.advanceWeek();
                SaveManager.saveGame(career.activeSlotId, career);
                forceRender();
                setView('career_dashboard');
              }
            }}
          />
        )}

        {view === 'fast_sim_match' && career && career.activeTournament && activeMatch && (
          <FastSimMatchView
            bracketMatch={activeMatch}
            humanPlayer={
              career.players.find(p => p.id === activeMatch.player1.id || p.id === activeMatch.player2.id) || career.player
            }
            tournament={career.activeTournament}
            onFinishSimulation={handleFastSimFinished}
          />
        )}

        {view === 'live_match' && controller && (
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-1 sm:px-2">
            {/* Pre-Match Mind Games Modal */}
            {showMindGames && (
              <PreMatchMindGamesModal
                player={controller.player}
                opponent={controller.opponent}
                tournamentName={career?.activeTournament?.config.name || (isCalibration ? 'Skill Calibration' : 'Exhibition Match')}
                isRivalry={Boolean(career?.rivalryLedger?.[controller.player.id]?.[controller.opponent.id])}
                h2hRecord={career?.rivalryLedger?.[controller.player.id]?.[controller.opponent.id] || null}
                onConfirmStance={(_stance, res) => {
                  setActiveMindGameResult(res);
                  setShowMindGames(false);
                  setShowWalkOn(true);
                }}
                onSkip={() => {
                  setShowMindGames(false);
                  setShowWalkOn(true);
                }}
              />
            )}

            {/* Walk-On Modal */}
            {showWalkOn && !showMindGames && (
              <MatchWalkOnModal
                player={controller.player}
                opponent={controller.opponent}
                tournamentName={career?.activeTournament?.config.name || (isCalibration ? 'Skill Calibration' : 'Exhibition Match')}
                tournamentLocation={career?.activeTournament?.config.location || 'The Oche Arena'}
                bestOfLegs={controller.match.format.bestOfLegs || 3}
                bestOfSets={controller.match.format.bestOfSets}
                legsPerSet={controller.match.format.legsPerSet}
                isSetsFormat={controller.match.format.type === 'sets'}
                h2hRecord={career?.rivalryLedger?.[controller.player.id]?.[controller.opponent.id] || null}
                onStartMatch={() => {
                  setShowWalkOn(false);
                  controller.startMatch();
                }}
              />
            )}

            {/* Match Header with Hybrid Toggle */}
            {!showMindGames && !showWalkOn && (
              <div className="w-full flex flex-col gap-2 mb-3 px-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {activeMindGameResult && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400">
                        ⚡ Stance: {activeMindGameResult.stance.title}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHybridCompanionMode(prev => !prev)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHybridCompanionMode ? '🎮 Virtual Dartboard' : '🎯 Real Board Companion'}</span>
                  </button>
                </div>
                
                {matchState?.message && (
                  <div className="inline-flex self-center items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 text-xs font-semibold tracking-wide animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{matchState.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Match Main Content */}
            {!showMindGames && !showWalkOn && (
              isHybridCompanionMode ? (
                <HybridMatchScreen
                  controller={controller}
                  matchState={matchState || {
                    status: controller.status,
                    currentTurnPlayerId: controller.match.currentLeg.currentTurnPlayerId,
                    isPlayerTurn: controller.match.currentLeg.currentTurnPlayerId === controller.player.id,
                    scoreRemaining: controller.match.currentLeg.getRemainingScore(controller.player.id),
                    opponentRemaining: controller.match.currentLeg.getRemainingScore(controller.opponent.id),
                    legsWon: Object.fromEntries(controller.match.legsWon),
                    setsWon: Object.fromEntries(controller.match.setsWon),
                    winnerId: controller.match.winnerId || null,
                    lastVisit: undefined,
                  }}
                  tournamentName={career?.activeTournament?.config.name || (isCalibration ? 'Skill Calibration' : 'Exhibition Match')}
                  onExitMatch={handleMatchConcluded}
                />
              ) : (
                <>
                  <Scoreboard
                    player={controller.player}
                    opponent={controller.opponent}
                    currentLeg={controller.match.currentLeg}
                    match={controller.match}
                    legsWon={matchState?.legsWon || {}}
                    bestOfLegs={controller.match.format.bestOfLegs || 3}
                    tournamentName={career?.activeTournament?.config.name || (isCalibration ? 'Skill Calibration' : 'Exhibition Match')}
                    is2Player={isLocal2P}
                  />

            {(() => {
              const match = controller.match;
              const isSets = match.format.type === 'sets';
              const bestOfSets = match.format.bestOfSets || 3;
              const setsNeeded = Math.ceil(bestOfSets / 2);
              const legsPerSet = match.format.legsPerSet || 3;
              const legsNeeded = Math.ceil((match.format.bestOfLegs || 3) / 2);

              const p1Sets = match.setsWon.get(controller.player.id) || 0;
              const p2Sets = match.setsWon.get(controller.opponent.id) || 0;
              const p1Legs = match.legsWon.get(controller.player.id) || (matchState?.legsWon[controller.player.id] || 0);
              const p2Legs = match.legsWon.get(controller.opponent.id) || (matchState?.legsWon[controller.opponent.id] || 0);

              const isDecidingSet = isSets && p1Sets === setsNeeded - 1 && p2Sets === setsNeeded - 1;
              const isDecidingLeg = isSets
                ? (isDecidingSet && p1Legs === legsPerSet - 1 && p2Legs === legsPerSet - 1)
                : (p1Legs === legsNeeded - 1 && p2Legs === legsNeeded - 1);

              const p1Score = match.currentLeg.getRemainingScore(controller.player.id);
              const isP1SetDart = isSets && p1Legs + 1 >= legsPerSet && p1Score <= 170;
              const isMatchDart = isSets
                ? (p1Sets + 1 >= setsNeeded && isP1SetDart)
                : (p1Legs + 1 >= legsNeeded && p1Score <= 170);

              return matchState?.status !== 'match_completed' ? (
                matchState?.isPlayerTurn || isLocal2P ? (
                  <DartKeypad
                    player={controller.player}
                    disabled={!isLocal2P && !matchState?.isPlayerTurn}
                    onConfirmVisit={handleConfirmVisit}
                    onQuickTotal={handleQuickTotal}
                    isMatchDart={isMatchDart}
                    isDecidingLeg={isDecidingLeg}
                    pressureMultiplier={isMatchDart ? 1.4 : isDecidingLeg ? 1.25 : 1.0}
                  />
                ) : (
                  <div className="w-full flex justify-center py-4 bg-neutral-900/50 rounded-2xl border border-neutral-800 backdrop-blur">
                    <div className="text-center space-y-4">
                      <div className="text-amber-400 font-bold text-sm tracking-widest uppercase animate-pulse">
                        {controller.opponent.name} THROWING...
                      </div>
                      <BroadcastDartboard
                        darts={
                          matchState?.lastVisit?.playerId === controller.opponent.id
                            ? matchState.lastVisit.darts.map(d => DartCoordinates.getCoordinateForDart(d))
                            : []
                        }
                        className="w-[240px] opacity-90 drop-shadow-xl mx-auto"
                      />
                    </div>
                  </div>
                )
              ) : isCalibration ? (
              <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-8 text-center max-w-md w-full shadow-2xl animate-fade-in space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-black mb-1">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">Skill Calibration Report</h3>
                <p className="text-xs text-neutral-400">
                  Based on your 3 legs of play, here is your benchmark rating:
                </p>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="block font-bold text-white font-mono text-base text-amber-400">
                      {controller.match.getOverallStats(controller.player.id).average}
                    </span>
                    <span className="text-[10px] text-neutral-500">3-Dart Avg</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white font-mono text-base">
                      {controller.match.getOverallStats(controller.player.id).highestVisit}
                    </span>
                    <span className="text-[10px] text-neutral-500">High Visit</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white font-mono text-base">
                      {controller.match.getOverallStats(controller.player.id).scores180}
                    </span>
                    <span className="text-[10px] text-neutral-500">180s Hit</span>
                  </div>
                </div>

                {(() => {
                  const rec = getRecommendation(controller.match.getOverallStats(controller.player.id).average);
                  return (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/40 text-left space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
                        Recommended Playing Tier
                      </span>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-white">{rec.tier}</h4>
                        <span className="text-xs font-mono text-amber-300 font-bold">{rec.range}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 pt-1 leading-relaxed">
                        {rec.desc}
                      </p>
                    </div>
                  );
                })()}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSlotModalMode('select_for_new');
                      setShowSlotModal(true);
                    }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors text-xs uppercase tracking-wider"
                  >
                    Start Career at This Tier
                  </button>
                  <button
                    type="button"
                    onClick={handleMatchConcluded}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl transition-colors text-xs"
                  >
                    Back to Main Menu
                  </button>
                </div>
              </div>
            ) : (
              <MatchBoxScoreModal
                player={controller.player}
                opponent={controller.opponent}
                match={controller.match}
                winnerId={matchState.winnerId!}
                isExhibition={isExhibition}
                onContinue={handleMatchConcluded}
              />
            );
          })()}
                </>
              )
            )}

            {matchState?.status === 'match_completed' && isHybridCompanionMode && !isCalibration && (
              <MatchBoxScoreModal
                player={controller.player}
                opponent={controller.opponent}
                match={controller.match}
                winnerId={matchState.winnerId!}
                isExhibition={isExhibition}
                onContinue={handleMatchConcluded}
              />
            )}
          </div>
        )}
      </main>

      {/* Save Slot Picker Modal */}
      {showSlotModal && (
        <SaveSlotModal
          mode={slotModalMode}
          onSelectSlot={handleSlotSelected}
          onNewGameInSlot={handleNewGameInSlot}
          onClose={() => setShowSlotModal(false)}
        />
      )}

      {/* Floating Persistent Debug Button (Quick Access) */}
      <button
        type="button"
        onClick={() => setShowDebugModal(true)}
        className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/60 text-xs font-semibold text-neutral-300 shadow-xl backdrop-blur transition-all select-none"
        title="Open Debug Diagnostics"
      >
        <Bug className="w-3.5 h-3.5 text-amber-400" />
        <span>Debug Info</span>
        {DebugTracker.getInstance().getErrorCount() > 0 && (
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      {/* Major Trophy Presentation Ceremony Modal */}
      {activeTrophyAward && (
        <TrophyCeremonyModal
          trophy={activeTrophyAward.trophy}
          winner={activeTrophyAward.winner}
          tournamentName={activeTrophyAward.tournamentName}
          tournamentLocation={activeTrophyAward.tournamentLocation}
          prizeMoney={activeTrophyAward.prizeMoney}
          rankingPoints={activeTrophyAward.rankingPoints}
          onContinue={activeTrophyAward.onContinue}
        />
      )}

      {/* End-of-Season PDC Annual Awards Gala Ceremony Modal */}
      {career?.pendingAwardsGala && (
        <PdcAwardsGalaModal
          gala={career.pendingAwardsGala}
          onClose={() => {
            career.pendingAwardsGala = null;
            SaveManager.saveGame(career.activeSlotId, career);
            setRefreshCount(c => c + 1);
          }}
        />
      )}

      {/* 9-Darter Broadcast Spectacle Modal */}
      {nineDarterCelebration && (
        <NineDarterSpectacleModal
          playerName={nineDarterCelebration.playerName}
          tournamentName={nineDarterCelebration.tournamentName}
          onDismiss={() => setNineDarterCelebration(null)}
        />
      )}

      {/* Off-the-Oche Lifestyle & Narrative Dilemma Modal */}
      {career && career.pendingDilemma && (
        <NarrativeDilemmaModal
          player={career.players[career.activePlayerIndex] || career.player}
          dilemma={career.pendingDilemma}
          onSelectOption={(option) => {
            const activeP = career.players[career.activePlayerIndex] || career.player;
            const message = NarrativeDilemmaManager.resolveChoice(activeP, option);
            career.addLog({
              week: career.calendar.currentWeek,
              year: career.calendar.currentYear,
              title: `🎲 Career Decision: ${career.pendingDilemma!.title}`,
              description: message,
              type: 'milestone'
            });
            career.pendingDilemma = null;
            SaveManager.saveGame(career.activeSlotId, career);
            setRefreshCount(c => c + 1);
          }}
        />
      )}

      {/* Post-Match Press Conference Modal */}
      {activePressQuestions && pressPlayer && (
        <PostMatchPressModal
          player={pressPlayer}
          questions={activePressQuestions}
          onComplete={() => {
            setActivePressQuestions(null);
            setPressPlayer(null);
            if (pendingPostMatchAction) {
              pendingPostMatchAction();
              setPendingPostMatchAction(null);
            }
          }}
        />
      )}

      {/* Debug Inspector Modal */}
      <DebugModal
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
        context={{
          view,
          career,
          activeMatch,
          controller,
          matchState
        }}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-3 text-center text-xs text-neutral-500">
        Darts Career Sim • Hybrid Mode & Statistical Sim • 4 Save Slots • 2-Player Shared Circuit
      </footer>
    </div>
  );
}
