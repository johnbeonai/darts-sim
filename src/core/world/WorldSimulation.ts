import { WorldManager } from './WorldManager';
import { RankingManager } from '../ranking/RankingManager';
import { Player } from '../player/Player';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';
import { Tournament, TournamentConfig } from '../tournament/Tournament';
import { PerformancePipeline } from '../simulation/PerformancePipeline';
import { AgingManager } from '../player/AgingManager';

export interface WorldSimulationLog {
  week: number;
  year: number;
  eventName: string;
  winnerName: string;
  runnerUpName: string;
  prizeMoney: number;
}

export class WorldSimulation {
  public logs: WorldSimulationLog[] = [];

  constructor(
    private world: WorldManager,
    private ranking: RankingManager,
    private rng: IRandomProvider = new DefaultRandomProvider()
  ) {}

  /**
   * Simulates background world activity for the current week:
   * - Resolves background pro tour events
   * - Adjusts form & confidence
   * - Recalculates Order of Merit
   */
  public simulateWeeklyActivity(
    currentWeek: number,
    currentYear: number,
    humanPlayers: Player[],
    yearChanged: boolean = false
  ): void {
    // 1. Simulate a background tour event (e.g. Pro or Elite tour)
    this.simulateBackgroundEvent(currentWeek, currentYear);

    // 2. Dynamic form & confidence drift for random AI players
    this.simulateDynamicFormDrift();

    // 3. Yearly developmental evolution & aging
    if (yearChanged) {
      this.simulateAnnualDevelopment();
    }

    // 4. Recalculate global Order of Merit rankings
    const allPlayers = [...this.world.getAllAIPlayers(), ...humanPlayers];
    this.ranking.recalculateRankings(allPlayers, currentYear, currentWeek);
    this.ranking.markHumanPlayers(humanPlayers.map(p => p.id));
  }

  private simulateBackgroundEvent(currentWeek: number, currentYear: number): void {
    const isMajorWeek = currentWeek % 12 === 0;
    const isProWeek = currentWeek % 2 === 0;

    const eventTier = isMajorWeek ? 'elite' : isProWeek ? 'pro' : 'semi_pro';
    const prizeWinner = isMajorWeek ? 100000 : isProWeek ? 25000 : 8000;
    const prizeRunnerUp = Math.round(prizeWinner * 0.45);
    const prizeSF = Math.round(prizeWinner * 0.2);
    const prizeQF = Math.round(prizeWinner * 0.1);

    const pointsWinner = isMajorWeek ? 200 : isProWeek ? 60 : 25;
    const pointsRunnerUp = Math.round(pointsWinner * 0.6);

    const eventName = isMajorWeek
      ? `Global Masters Championship (W${currentWeek})`
      : isProWeek
      ? `Players Championship Floor Event (W${currentWeek})`
      : `Regional Open Qualifier (W${currentWeek})`;

    const entrants = this.world.getOpponentsForTier(eventTier, 8);
    if (entrants.length < 8) return;

    const config: TournamentConfig = {
      id: `sim-${currentYear}-w${currentWeek}`,
      name: eventName,
      location: 'Tour Arena',
      tier: eventTier,
      entryFee: 0,
      prizePool: {
        winner: prizeWinner,
        runnerUp: prizeRunnerUp,
        semiFinalist: prizeSF,
        quarterFinalist: prizeQF
      },
      rankingPoints: {
        winner: pointsWinner,
        runnerUp: pointsRunnerUp,
        semiFinalist: Math.round(pointsWinner * 0.3),
        quarterFinalist: Math.round(pointsWinner * 0.1)
      },
      format: { type: 'legs', bestOfLegs: 5, startingScore: 501 }
    };

    const tournament = new Tournament(config, entrants, this.rng);
    tournament.simulateRestOfTournament();

    if (tournament.winner && tournament.runnerUp) {
      // Award prize money and points
      tournament.winner.prizeMoneyTotal += prizeWinner;
      tournament.winner.bankBalance += prizeWinner;
      tournament.winner.rankingPoints += pointsWinner;
      this.ranking.rollingLedger.addPrize(
        tournament.winner.id,
        config.id,
        config.name,
        currentYear,
        currentWeek,
        prizeWinner,
        eventTier === 'pro' || eventTier === 'elite'
      );
      tournament.winner.stats.matchesWon += 3;
      tournament.winner.stats.matchesPlayed += 3;
      tournament.winner.adjustConfidence(10);

      tournament.runnerUp.prizeMoneyTotal += prizeRunnerUp;
      tournament.runnerUp.bankBalance += prizeRunnerUp;
      tournament.runnerUp.rankingPoints += pointsRunnerUp;
      this.ranking.rollingLedger.addPrize(
        tournament.runnerUp.id,
        config.id,
        config.name,
        currentYear,
        currentWeek,
        prizeRunnerUp,
        eventTier === 'pro' || eventTier === 'elite'
      );
      tournament.runnerUp.stats.matchesWon += 2;
      tournament.runnerUp.stats.matchesPlayed += 3;
      tournament.runnerUp.adjustConfidence(5);

      this.logs.unshift({
        week: currentWeek,
        year: currentYear,
        eventName,
        winnerName: tournament.winner.name,
        runnerUpName: tournament.runnerUp.name,
        prizeMoney: prizeWinner
      });

      if (this.logs.length > 50) {
        this.logs.pop();
      }
    }
  }

  private simulateDynamicFormDrift(): void {
    const ai = this.world.getAllAIPlayers();
    // Random sample of AI players fluctuate in form and confidence each week
    for (const p of ai) {
      if (this.rng.next() < 0.25) {
        const formDelta = Math.floor(this.rng.next() * 9) - 4; // -4 to +4
        p.state.form = Math.min(100, Math.max(10, p.state.form + formDelta));
      }
      if (this.rng.next() < 0.15) {
        const confDelta = Math.floor(this.rng.next() * 7) - 3; // -3 to +3
        p.adjustConfidence(confDelta);
      }
    }
  }

  private simulateAnnualDevelopment(): void {
    const ai = this.world.getAllAIPlayers();
    for (let i = 0; i < ai.length; i++) {
      const p = ai[i];
      AgingManager.processAnnualAging(p, this.rng);

      // Evaluate AI retirement
      if (AgingManager.shouldAIRetire(p, this.rng)) {
        const rookie = AgingManager.spawnYoungRookie(p);
        this.logs.unshift({
          week: 52,
          year: 0,
          eventName: 'PDC Tour Retirement & Rookie Draft',
          winnerName: rookie.name,
          runnerUpName: p.name,
          prizeMoney: 0
        });
      }
    }
  }
}
