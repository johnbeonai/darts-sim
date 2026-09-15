import { CheckoutTable } from '../match/CheckoutTable';

export interface Target {
  segment: number; // 0-20, 25
  multiplier: 1 | 2 | 3;
  label: string;
}

export class TargetingEngine {
  /**
   * Determines the optimal target for the next dart given remaining score and darts left in visit
   */
  public static getTarget(
    remainingScore: number,
    dartsLeftInVisit: number = 3,
    hasDoubledIn: boolean = true
  ): Target {
    // 0. If Double-In is required and player has not yet hit an opening double (e.g. World Grand Prix)
    if (!hasDoubledIn) {
      return { segment: 20, multiplier: 2, label: 'D20' };
    }

    // 1. If in direct 1-dart finish range (even number <= 40, or 50)
    if (remainingScore === 50) {
      return { segment: 25, multiplier: 2, label: 'D-Bull' };
    }
    if (remainingScore <= 40 && remainingScore >= 2 && remainingScore % 2 === 0) {
      const seg = remainingScore / 2;
      return { segment: seg, multiplier: 2, label: `D${seg}` };
    }

    // 2. If odd number <= 41 (setup for a double)
    if (remainingScore <= 41 && remainingScore >= 3 && remainingScore % 2 === 1) {
      // Aim for single 1 to leave double 20 or 16
      if (remainingScore === 3) return { segment: 1, multiplier: 1, label: 'S1' };
      if (remainingScore === 21) return { segment: 5, multiplier: 1, label: 'S5' }; // leaves D8
      return { segment: 1, multiplier: 1, label: 'S1' }; // leaves clean even
    }

    // 3. If checkout possible (170 down to 42)
    if (CheckoutTable.isCheckoutPossible(remainingScore)) {
      const route = CheckoutTable.getRoute(remainingScore);
      if (route && route.length > 0) {
        return this.parseRouteLabel(route[0]);
      }
    }

    // 4. Default high scoring target
    return { segment: 20, multiplier: 3, label: 'T20' };
  }

  private static parseRouteLabel(label: string): Target {
    if (label === 'D-Bull' || label === '50') return { segment: 25, multiplier: 2, label: 'D-Bull' };
    if (label === 'Bull' || label === '25') return { segment: 25, multiplier: 1, label: 'Bull' };

    if (label.startsWith('T')) {
      const seg = parseInt(label.substring(1), 10);
      return { segment: seg, multiplier: 3, label };
    }
    if (label.startsWith('D')) {
      const seg = parseInt(label.substring(1), 10);
      return { segment: seg, multiplier: 2, label };
    }
    if (label.startsWith('S')) {
      const seg = parseInt(label.substring(1), 10);
      return { segment: seg, multiplier: 1, label };
    }

    const seg = parseInt(label, 10);
    return { segment: seg, multiplier: 1, label: `S${seg}` };
  }
}
