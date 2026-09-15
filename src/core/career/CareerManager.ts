import { WorldManager } from '../world/WorldManager';
import { RankingManager } from '../ranking/RankingManager';
import { WorldSimulation } from '../world/WorldSimulation';
import { SponsorshipManager } from '../finance/SponsorshipManager';
import { LifestyleManager } from '../finance/LifestyleManager';
import { StaffManager } from '../finance/StaffManager';
import { Player } from '../player/Player';
import { PlayerFactory } from '../player/PlayerFactory';
import { Calendar } from './Calendar';
import { Tournament, TournamentConfig, BracketMatch } from '../tournament/Tournament';
import { TrainingManager, TrainingType, TrainingResult } from './TrainingManager';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';
import { PerformancePipeline } from '../simulation/PerformancePipeline';
import { Match } from '../match/Match';
import { CalendarSchedule } from './CalendarSchedule';
import { QSchoolManager } from './QSchoolManager';
import { TrophyAward, TrophyManager } from '../trophies/Trophy';
import { AchievementProgress, AchievementManager } from '../achievements/Achievement';
import { HeadToHeadRecord, RivalryManager } from '../rivalry/RivalryManager';
import { MedicalManager } from '../injury/MedicalManager';
import { Injury } from '../injury/Injury';
import { PremierLeagueManager, PREMIER_LEAGUE_VENUES } from '../tournament/PremierLeagueManager';
import { AgingManager } from '../player/AgingManager';
import { PdcAwardsManager, SeasonAwardsGala } from './PdcAwardsManager';
import { NarrativeDilemma, NarrativeDilemmaManager, DilemmaOption } from './NarrativeDilemmaManager';


export interface CareerEventLog {
  week: number;
  year: number;
  title: string;
  description: string;
  type: 'tournament' | 'training' | 'milestone' | 'news';
}

export interface PlayerWeeklyDecision {
  playerId: string;
  action: 'pending' | 'train' | 'rest' | 'tournament';
  trainingType?: TrainingType;
  tournamentConfig?: TournamentConfig;
  trainingResult?: TrainingResult;
}

export interface PlayerActionResult {
  playerName: string;
  action: 'train' | 'rest' | 'tournament';
  title: string;
  description: string;
  trainingResult?: TrainingResult;
  tournamentConfig?: TournamentConfig;
}

export interface WeeklyResolutionResult {
  type: 'tournament' | 'week_advanced';
  tournament?: Tournament;
  p1Action: PlayerActionResult;
  p2Action?: PlayerActionResult;
}

export interface QueuedTournament {
  player: Player;
  config: TournamentConfig;
}

export class CareerManager {
  public calendar: Calendar;
  public players: Player[];
  public isTwoPlayer: boolean;
  public activePlayerIndex: number = 0;
  public weeklyDecisions: Map<string, PlayerWeeklyDecision> = new Map();
  public eventLogs: CareerEventLog[] = [];
  public activeTournament: Tournament | null = null;
  public availableTournaments: TournamentConfig[] = [];
  public pendingTournaments: QueuedTournament[] = [];
  public activeSlotId: number = 1;
  // Phase 10 & 55: Trophies, Achievements, and Rivalry Ledger
  public trophyAwards: TrophyAward[] = [];
  public playerAchievements: Record<string, Record<string, AchievementProgress>> = {};
  public rivalryLedger: Record<string, Record<string, HeadToHeadRecord>> = {};
  public premierLeague: PremierLeagueManager;
  public pendingAwardsGala: SeasonAwardsGala | null = null;
  public pendingDilemma: NarrativeDilemma | null = null;

  public world: WorldManager;
  public ranking: RankingManager;
  public worldSimulation: WorldSimulation;

  constructor(
    playersOrPlayer: Player[] | Player,
    private rng: IRandomProvider = new DefaultRandomProvider()
  ) {
    if (Array.isArray(playersOrPlayer)) {
      if (playersOrPlayer.length === 0) {
        throw new Error('CareerManager requires at least one player.');
      }
      this.players = playersOrPlayer;
      this.isTwoPlayer = playersOrPlayer.length > 1;
    } else {
      if (!playersOrPlayer) {
        throw new Error('CareerManager requires at least one player.');
      }
      this.players = [playersOrPlayer];
      this.isTwoPlayer = false;
    }

    // Enforce strictly unique IDs for all players to prevent map key collisions
    const seenPlayerIds = new Set<string>();
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      if (seenPlayerIds.has(p.id)) {
        p.id = `${p.id}_p${i + 1}_${Date.now()}`;
      }
      seenPlayerIds.add(p.id);
    }
    this.calendar = new Calendar();
    this.premierLeague = new PremierLeagueManager(this.calendar.currentYear);
    this.world = new WorldManager(this.rng);
    this.ranking = new RankingManager([...this.world.getAllAIPlayers(), ...this.players]);
    this.ranking.markHumanPlayers(this.humanPlayerIds);
    this.worldSimulation = new WorldSimulation(this.world, this.ranking, this.rng);

    this.resetWeeklyDecisions();
    this.refreshAvailableTournaments();
    // Initialize player achievements and rivalry ledgers
    for (const p of this.players) {
      this.playerAchievements[p.id] = AchievementManager.initPlayerAchievements(this.playerAchievements[p.id]);
      if (!this.rivalryLedger[p.id]) {
        this.rivalryLedger[p.id] = {};
      }
    }

  }

  /**
   * Returns current active player (Player 1 by default, or Player 2 if it's their turn)
   */
  public get player(): Player {
    return this.players[this.activePlayerIndex] || this.players[0];
  }

  /**
   * Returns Player 2 if this is a 2-player career, or undefined
   */
  public get secondPlayer(): Player | undefined {
    return this.isTwoPlayer && this.players.length > 1 ? this.players[1] : undefined;
  }

  /**
   * Returns IDs of all human players
   */
  public get humanPlayerIds(): string[] {
    return this.players.map(p => p.id);
  }

  public get activePlayer(): Player {
    return this.players[this.activePlayerIndex] || this.players[0];
  }

  public resetWeeklyDecisions(): void {
    this.weeklyDecisions.clear();
    for (const p of this.players) {
      this.weeklyDecisions.set(p.id, {
        playerId: p.id,
        action: 'pending'
      });
    }
  }

  public switchPlayerTurn(): void {
    this.toggleActivePlayer();
  }

  public toggleActivePlayer(): void {
    if (!this.isTwoPlayer) return;
    this.activePlayerIndex = this.activePlayerIndex === 0 ? 1 : 0;
  }

  public setActivePlayerById(playerId: string): void {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      this.activePlayerIndex = idx;
    }
  }

  public recordPlayerDecision(playerId: string, decision: Partial<PlayerWeeklyDecision>): void {
    const existing = this.weeklyDecisions.get(playerId) || { playerId, action: 'pending' };
    const nextAction = decision.action ?? existing.action;
    const sanitized: PlayerWeeklyDecision = {
      playerId,
      action: nextAction,
      tournamentConfig: nextAction === 'tournament' ? (decision.tournamentConfig ?? existing.tournamentConfig) : undefined,
      trainingType: (nextAction === 'train' || nextAction === 'rest') ? (decision.trainingType ?? existing.trainingType) : undefined
    };
    this.weeklyDecisions.set(playerId, sanitized);
  }

  public areAllWeeklyDecisionsLocked(): boolean {
    for (const p of this.players) {
      const d = this.weeklyDecisions.get(p.id);
      if (!d || d.action === 'pending') return false;
    }
    return true;
  }

  /**
   * Resolves locked weekly decisions for all players.
   * - If both trained/rested: executes routines, advances week, returns type: 'week_advanced'
   * - If one or both entered tournament(s): enters first tournament (with 1 or 2 players),
   *   queues secondary tournament if different, applies training to non-tourney players,
   *   and returns type: 'tournament'.
   */
  public resolveWeeklyPlans(): WeeklyResolutionResult {
    if (!this.isTwoPlayer) {
      const d = this.weeklyDecisions.get(this.player.id);
      if (d?.action === 'tournament' && d.tournamentConfig) {
        const t = this.enterTournament(d.tournamentConfig, [this.player]);
        return {
          type: 'tournament',
          tournament: t,
          p1Action: {
            playerName: this.player.name,
            action: 'tournament',
            title: d.tournamentConfig.name,
            description: `Entered ${d.tournamentConfig.name}. Ready for knockout competition!`,
            tournamentConfig: d.tournamentConfig
          }
        };
      } else {
        let trainRes: TrainingResult | undefined;
        if (d?.trainingType) {
          trainRes = this.train(d.trainingType, this.player);
        }
        const actionType = d?.action === 'rest' ? 'rest' : 'train';
        const p1Act: PlayerActionResult = {
          playerName: this.player.name,
          action: actionType,
          title: actionType === 'rest' ? 'Full Rest Week' : `${d?.trainingType?.toUpperCase() || 'PRACTICE'} Drill`,
          description: trainRes?.message || 'Routine completed successfully.',
          trainingResult: trainRes
        };
        this.advanceWeek();
        return {
          type: 'week_advanced',
          p1Action: p1Act
        };
      }
    }

    const p1 = this.players[0];
    const p2 = this.players[1];
    const d1 = this.weeklyDecisions.get(p1.id);
    const d2 = this.weeklyDecisions.get(p2.id);

    let p1TrainRes: TrainingResult | undefined;
    let p2TrainRes: TrainingResult | undefined;

    // Apply training / rest to whichever player chose training or rest
    if (d1?.action === 'train' || d1?.action === 'rest') {
      if (d1.trainingType) {
        p1TrainRes = this.train(d1.trainingType, p1);
      }
    }
    if (d2?.action === 'train' || d2?.action === 'rest') {
      if (d2.trainingType) {
        p2TrainRes = this.train(d2.trainingType, p2);
      }
    }

    const p1Tourney = d1?.action === 'tournament' ? d1.tournamentConfig : undefined;
    const p2Tourney = d2?.action === 'tournament' ? d2.tournamentConfig : undefined;

    this.pendingTournaments = [];

    const p1Action: PlayerActionResult = {
      playerName: p1.name,
      action: p1Tourney ? 'tournament' : d1?.action === 'rest' ? 'rest' : 'train',
      title: p1Tourney
        ? p1Tourney.name
        : d1?.action === 'rest' ? 'Full Rest Week' : `${d1?.trainingType?.toUpperCase() || 'PRACTICE'} Drill`,
      description: p1Tourney
        ? `Entered ${p1Tourney.name}. Knockout bracket ready!`
        : p1TrainRes?.message || 'Routine completed successfully.',
      trainingResult: p1TrainRes,
      tournamentConfig: p1Tourney
    };

    const p2Action: PlayerActionResult = {
      playerName: p2.name,
      action: p2Tourney ? 'tournament' : d2?.action === 'rest' ? 'rest' : 'train',
      title: p2Tourney
        ? p2Tourney.name
        : d2?.action === 'rest' ? 'Full Rest Week' : `${d2?.trainingType?.toUpperCase() || 'PRACTICE'} Drill`,
      description: p2Tourney
        ? `Entered ${p2Tourney.name}. Knockout bracket ready!`
        : p2TrainRes?.message || 'Routine completed successfully.',
      trainingResult: p2TrainRes,
      tournamentConfig: p2Tourney
    };

    if (p1Tourney && p2Tourney) {
      if (p1Tourney.id === p2Tourney.id) {
        // Both entered SAME tournament: unified bracket clash!
        this.activePlayerIndex = 0;
        const t = this.enterTournament(p1Tourney, [p1, p2]);
        return { type: 'tournament', tournament: t, p1Action, p2Action };
      } else {
        // Entered DIFFERENT tournaments: P1 plays first, P2 queued second
        this.pendingTournaments.push({ player: p2, config: p2Tourney });
        this.activePlayerIndex = 0;
        const t = this.enterTournament(p1Tourney, [p1]);
        return { type: 'tournament', tournament: t, p1Action, p2Action };
      }
    } else if (p1Tourney) {
      // Only P1 entered tournament; P2 trained/rested
      this.activePlayerIndex = 0;
      const t = this.enterTournament(p1Tourney, [p1]);
      return { type: 'tournament', tournament: t, p1Action, p2Action };
    } else if (p2Tourney) {
      // Only P2 entered tournament; P1 trained/rested
      this.activePlayerIndex = 1;
      const t = this.enterTournament(p2Tourney, [p2]);
      return { type: 'tournament', tournament: t, p1Action, p2Action };
    } else {
      // Neither entered tournament: advance week
      this.advanceWeek();
      return { type: 'week_advanced', p1Action, p2Action };
    }
  }

  /**
   * Checks if a player meets entry requirements for a tournament
   */
  public isPlayerEligibleForTournament(player: Player, config: TournamentConfig): { eligible: boolean; reason?: string } {
    // 1. Bank balance check
    if (player.bankBalance < config.entryFee) {
      return {
        eligible: false,
        reason: `Insufficient funds: Entry fee is £${config.entryFee}, balance is £${player.bankBalance}.`
      };
    }

    const req = config.requirements;

    // 2. Pro / Major Tour Card gating
    if (req?.tourCardRequired && !player.hasTourCard) {
      return {
        eligible: false,
        reason: 'PDC Tour Card required. Win your Tour Card via Q-School Final Stage.'
      };
    }

    // 3. Pro / Elite tier tournaments require Tour Card
    if ((config.tier === 'pro' || config.tier === 'elite') && !player.hasTourCard) {
      return {
        eligible: false,
        reason: 'PDC Tour Card required for Pro Tour and Major events.'
      };
    }

    // 4. Non-card holders only (Pubs, Amateur, Challenge Tour, Q-School)
    if (req?.nonCardHoldersOnly && player.hasTourCard) {
      return {
        eligible: false,
        reason: 'Exclusively for Non-Tour Card Holders. Card holders cannot enter amateur or pub events.'
      };
    }

    // 5. Q-School Final Stage qualification gating
    if (req?.requiresQSchoolFinal && !player.qSchoolFinalQualified) {
      return {
        eligible: false,
        reason: 'Did not qualify for Q-School Final Stage. Requires winning a First Stage day or reaching the points cutoff.'
      };
    }

    // 6. Challenge Tour / Semi-Pro gating
    if (req?.requiresQSchoolParticipation && !player.hasEnteredQSchool && player.tier !== 'semi_pro') {
      return {
        eligible: false,
        reason: 'PDC Challenge Tour requires Semi-Pro tier or Q-School participation (PDPA Associate status).'
      };
    }

    // 7. Minimum tier check
    if (req?.minTier) {
      const TIER_RANK: Record<string, number> = {
        casual: 0,
        pub: 1,
        amateur: 2,
        semi_pro: 3,
        pro: 4,
        elite: 5
      };
      const playerTierVal = TIER_RANK[player.tier] ?? 1;
      const reqTierVal = TIER_RANK[req.minTier] ?? 1;
      if (playerTierVal < reqTierVal) {
        const tierName = req.minTier === 'semi_pro' ? 'Semi-Pro' : req.minTier === 'pro' ? 'Professional' : req.minTier;
        return {
          eligible: false,
          reason: `Requires at least ${tierName} circuit status (Your tier: ${player.tier.replace('_', ' ').toUpperCase()}).`
        };
      }
    }

    // 8. Premier League Darts eligibility
    if (config.id.startsWith('premier-league-night-')) {
      if (this.premierLeague.standings.length === 0) {
        this.premierLeague.initializeSeason([...this.world.getAllAIPlayers(), ...this.players], this.player.id);
      }
      if (!this.premierLeague.isContestant(player.id)) {
        return {
          eligible: false,
          reason: 'Premier League Darts is an invitational roadshow strictly for the Top 8 in the world.'
        };
      }
      return { eligible: true };
    }

    if (config.id.startsWith('premier-league-play-offs-')) {
      const qualifiers = this.premierLeague.getPlayOffsQualifiers();
      const isQualified = qualifiers.some(q => q.playerId === player.id);
      if (!isQualified) {
        return {
          eligible: false,
          reason: 'The O2 Arena Finals Night requires finishing in the Top 4 of the Premier League table.'
        };
      }
      return { eligible: true };
    }

    // 9. Order of Merit ranking cutoffs
    if (req?.maxRank) {
      const playerRank = player.ranking || 999;
      if (playerRank > req.maxRank) {
        return {
          eligible: false,
          reason: `Requires PDC Order of Merit Top ${req.maxRank} (Your rank: #${player.ranking || 'Unranked'}).`
        };
      }
    }

    return { eligible: true };
  }

  public refreshAvailableTournaments(): void {
    this.availableTournaments = CalendarSchedule.getTournamentsForWeek(
      this.calendar.currentWeek,
      this.calendar.currentYear
    );
  }

  /**
   * Enters tournament for either a single player or multiple human players
   */
  public enterTournament(config: TournamentConfig, participatingPlayers?: Player[]): Tournament {
    const entrants = participatingPlayers || [this.player];

    for (const p of entrants) {
      const eligibility = this.isPlayerEligibleForTournament(p, config);
      if (!eligibility.eligible) {
        throw new Error(`${p.name} cannot enter ${config.name}: ${eligibility.reason}`);
      }
      p.bankBalance -= config.entryFee;
      if (config.isQSchool) {
        p.hasEnteredQSchool = true;
        if (p.tier === 'casual' || p.tier === 'pub' || p.tier === 'amateur') {
          p.tier = 'semi_pro';
        }
      }
    }

    const isPremierLeague = config.id.startsWith('premier-league-night-');
    const isPlayOffs = config.id.startsWith('premier-league-play-offs-');

    const aiCount = 8 - entrants.length;
    const aiOpponents = this.world.getOpponentsForTier(config.tier, aiCount, entrants.map(p => p.id));

    let participants: Player[] = [];
    if (isPlayOffs) {
      const qualifiers = this.premierLeague.getPlayOffsQualifiers();
      const allKnown = [...this.world.getAllAIPlayers(), ...this.players];
      const qPlayers = qualifiers.map(q => allKnown.find(p => p.id === q.playerId)!).filter(Boolean);
      if (qPlayers.length >= 4) {
        // Seed 1 vs 4, 2 vs 3
        participants = [qPlayers[0], qPlayers[3], qPlayers[1], qPlayers[2]];
      } else {
        participants = [...qPlayers, ...aiOpponents].slice(0, 4);
      }
    } else if (isPremierLeague) {
      participants = [...entrants, ...aiOpponents].slice(0, 8);
    } else {
      participants = [...entrants, ...aiOpponents];
    }

    const tournament = new Tournament(config, participants);
    this.activeTournament = tournament;

    for (const p of entrants) {
      this.addLog({
        week: this.calendar.currentWeek,
        year: this.calendar.currentYear,
        title: `Entered ${config.name}`,
        description: `Paid entry fee of £${config.entryFee}.`,
        type: 'tournament'
      });
    }

    return tournament;
  }

        public advanceWeek(): void {
    const res = this.calendar.advanceWeek();

    for (const p of this.players) {
      if (p.activeSponsorships && p.activeSponsorships.length > 0) {
        const spRes = SponsorshipManager.processWeeklyStipends(p, p.activeSponsorships);
        if (spRes.totalStipendPaid > 0) {
          this.addLog({
            week: this.calendar.currentWeek,
            year: this.calendar.currentYear,
            title: `💰 ${p.name}: Sponsor Income (+£${spRes.totalStipendPaid})`,
            description: `Received weekly stipends.`,
            type: 'milestone'
          });
        }
      }

      const lifestyleRes = LifestyleManager.processWeeklyUpkeep(p);
      if (lifestyleRes.totalCost > 0) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: `🏠 ${p.name}: Lifestyle Upkeep (-£${lifestyleRes.totalCost})`,
          description: `Paid weekly maintenance for lifestyle upgrades.`,
          type: 'milestone'
        });
      }
      for (const msg of lifestyleRes.messages) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: `⚠️ ${p.name}: Lifestyle Notice`,
          description: msg,
          type: 'milestone'
        });
      }

      if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {
        const staffRes = StaffManager.processWeeklyPayroll(p, p.hiredStaffIds);
        if (staffRes.totalPayroll > 0) {
          this.addLog({
            week: this.calendar.currentWeek,
            year: this.calendar.currentYear,
            title: `📋 ${p.name}: Staff Payroll (-£${staffRes.totalPayroll})`,
            description: staffRes.messages.join(' '),
            type: 'training'
          });
        }
      }

      // Process Weekly Sports Medicine & Injury Rehabilitation
      const medMsgs = MedicalManager.advanceWeeklyMedical(p, this.calendar.currentMonth, this.calendar.currentYear);
      for (const msg of medMsgs) {
        if (msg.startsWith('Full Recovery')) {
          this.addLog({
            week: this.calendar.currentWeek,
            year: this.calendar.currentYear,
            title: `🩺 Full Recovery: ${p.name}`,
            description: msg,
            type: 'milestone'
          });
        }
      }

      // Natural fatigue recovery with Physiotherapist synergy
      const physioBonus = p.hiredStaffIds
        ? (p.hiredStaffIds.includes('physio-sarah') ? 15 : p.hiredStaffIds.includes('physio-evans') ? 10 : 0)
        : 0;
      if (physioBonus > 0) {
        p.recoverFatigue(physioBonus);
      }

      // Check dynamic injury risk from prior week's activity
      const dec = this.weeklyDecisions.get(p.id);
      const activity = dec?.action === 'rest' ? 'rest' : dec?.action === 'tournament' ? 'tournament' : 'train';
      const newInjury = MedicalManager.evaluateDynamicInjuryRisk(p, activity, this.rng);
      if (newInjury) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: `⚠️ INJURY: ${p.name} (${newInjury.name})`,
          description: `Diagnosed with ${newInjury.severity} ${newInjury.name}. Expected recovery: ${newInjury.weeksRemaining} week(s). Visit the Medical Centre for treatment.`,
          type: 'milestone'
        });
      }
    }

    if (res.yearChanged) {
      // 1. Process natural aging and skill evolution for human players
      for (const p of this.players) {
        const ageRes = AgingManager.processAnnualAging(p, this.rng);
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: `Happy Birthday! ${p.name} is now ${p.age}`,
          description: ageRes.summaryMessage,
          type: 'milestone'
        });

        // Evaluate Tour Card retention at season end (Top 64 rule)
        if (p.hasTourCard && p.tourCardExpiryYear !== undefined && p.tourCardExpiryYear < this.calendar.currentYear) {
          if (p.ranking > 0 && p.ranking <= 64) {
            p.tourCardExpiryYear = this.calendar.currentYear; // Card renewed for upcoming season
            this.addLog({
              week: this.calendar.currentWeek,
              year: this.calendar.currentYear,
              title: `🏆 Tour Card Retained! ${p.name} Defends Top 64!`,
              description: `Finished ranked #${p.ranking} in the PDC Order of Merit. Professional tour card renewed through ${p.tourCardExpiryYear}!`,
              type: 'milestone'
            });
          } else {
            p.revokeTourCard();
            this.addLog({
              week: this.calendar.currentWeek,
              year: this.calendar.currentYear,
              title: `⚠️ Tour Card Relegation: ${p.name} drops outside Top 64`,
              description: `Ranked #${p.ranking || 'Unranked'} (outside Top 64). Dropped to amateur status. Head to Q-School in Week 1 to regain tour card!`,
              type: 'milestone'
            });
          }
        }
        p.qSchoolPoints = 0;
        p.qSchoolFinalQualified = false;
        p.hasEnteredQSchool = false;
      }

      // 2. Evaluate End-of-Season PDC Annual Awards Gala
      const gala = PdcAwardsManager.evaluateSeasonAwards(
        [...this.world.getAllAIPlayers(), ...this.players],
        this.humanPlayerIds,
        this.calendar.currentYear - 1
      );
      this.pendingAwardsGala = gala;

      for (const award of gala.awards) {
        if (award.isHuman) {
          this.addLog({
            week: 52,
            year: this.calendar.currentYear - 1,
            title: `🌟 PDC AWARD: ${award.title}!`,
            description: `${award.winnerPlayerName} has been crowned ${award.title}! ${award.citation}`,
            type: 'milestone'
          });
        }
      }
    }

    this.activePlayerIndex = 0;
    this.pendingTournaments = [];

    // 3. Evaluate Weekly Circuit Narrative Dilemmas
    const dilemma = NarrativeDilemmaManager.evaluateWeeklyDilemma(this.calendar.currentWeek, this.rng);
    if (dilemma) {
      this.pendingDilemma = dilemma;
    }

    this.worldSimulation.simulateWeeklyActivity(
      this.calendar.currentWeek,
      this.calendar.currentYear,
      this.players,
      res.yearChanged
    );
    this.resetWeeklyDecisions();
    this.refreshAvailableTournaments();
    // Initialize player achievements and rivalry ledgers
    for (const p of this.players) {
      this.playerAchievements[p.id] = AchievementManager.initPlayerAchievements(this.playerAchievements[p.id]);
      if (!this.rivalryLedger[p.id]) {
        this.rivalryLedger[p.id] = {};
      }
    }

  }


  public train(trainingType: string, player?: Player): any {
    player = player || this.player;
    if (trainingType === 'rest') {
      player.recoverFatigue(35);
      return { gain: 0, message: 'Recovered 35 fatigue', fatigueChange: -35 };
    }
    const res = TrainingManager.executeTraining(player || this.player, trainingType as any);
    return { gain: res.gain || 0, message: `Gained ${res.gain || 0} XP. Form ${0 || 0 > 0 ? '+' : ''}${0 || 0}` };
  }



  public simulateHumanMatch(bm: any): void {
    if (!this.activeTournament) return;
    this.activeTournament.resolveMatchStatistically(bm, new (require('../simulation/PerformancePipeline').PerformancePipeline)(this.rng));
    if (bm.winnerId === this.player.id || (this.isTwoPlayer && this.secondPlayer && bm.winnerId === this.secondPlayer.id)) {
       this.recordMatchStats(bm.match, bm.winnerId);
    }
  }

  public recordMatchStats(match: any, playerId: string): void {
    const p = this.players.find(x => x.id === playerId);
    if (!p) return;
    
    p.stats.matchesPlayed++;
    if (match.winnerId === playerId) {
       p.stats.matchesWon++;
    }
    
    const pStats = match.getMatchStats(playerId);
    p.stats.legsWon += pStats.legsWon;
    
    if (pStats.highestCheckout > p.stats.highestCheckout && pStats.highestCheckout <= 170) {
       p.stats.highestCheckout = pStats.highestCheckout;
    }

  }

  public finalizeTournament(tournament: Tournament): void {
    if (!tournament.isCompleted) return;

    for (const p of this.players) {
       if (tournament.winner?.id === p.id) {
          const prize = tournament.config.prizePool.winner;
          p.bankBalance += prize;
          
          this.addLog({
             week: this.calendar.currentWeek,
             year: this.calendar.currentYear,
             title: `🏆 ${p.name} WON ${tournament.config.name}!`,
             description: `Claimed the title and £${prize.toLocaleString()} prize money!`,
             type: 'tournament'
          });
          
          

          const tDef = TrophyManager.resolveTrophyDefinition(tournament);
this.trophyAwards.push({
             id: Math.random().toString(36).substring(7),
             playerId: p.id,
             playerName: p.name,
             trophyId: tDef.id,
             trophyName: tDef.name,
             tournamentId: tournament.config.id,
             tournamentName: tournament.config.name,
             tier: tournament.config.tier as any,
             week: this.calendar.currentWeek,
             year: this.calendar.currentYear,
             prizeWon: prize,
             icon: '🏆',
             description: 'Winner'
          });
       } else {
          // Just grant basic appearance money based on round logic...
          const prize = (tournament.config.prizePool as any).last64 || 500;
          if (tournament.participants.some(x => x.id === p.id)) {
            p.bankBalance += prize;
          }
       }
    }
    this.activeTournament = null;
  }



  public addLog(entry: CareerEventLog): void {
    this.eventLogs.unshift(entry);
    if (this.eventLogs.length > 100) {
      this.eventLogs.pop();
    }
  }
}
