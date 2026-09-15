import { IInputProvider, MatchContext } from './InputProvider';
import { DartResult } from '../core/match/DartResult';
import { Visit } from '../core/match/Visit';
import { Player } from '../core/player/Player';
import { PerformancePipeline } from '../core/simulation/PerformancePipeline';
import { TargetingEngine } from '../core/simulation/TargetingEngine';
import { IRandomProvider, DefaultRandomProvider } from '../core/random/RandomProvider';

/**
 * Statistical Input Provider
 * Used by CPU AI and Career simulation matches.
 */
export class StatisticalInputProvider implements IInputProvider {
  public readonly type = 'statistical';
  private pipeline: PerformancePipeline;

  constructor(
    private player: Player,
    rng: IRandomProvider = new DefaultRandomProvider()
  ) {
    this.pipeline = new PerformancePipeline(rng);
  }

  public async getNextDart(context: MatchContext): Promise<DartResult> {
    const target = TargetingEngine.getTarget(
      context.remainingScore,
      4 - context.dartNumberInVisit,
      context.hasDoubledIn ?? true
    );
    return this.pipeline.simulateDart(this.player, target, context.situation);
  }

  public async getNextVisit(context: MatchContext): Promise<Visit> {
    return this.pipeline.simulateVisit(
      this.player,
      context.situation,
      context.doubleOutRequired ?? true,
      context.doubleInRequired ?? false,
      context.hasDoubledIn ?? true
    );
  }
}
