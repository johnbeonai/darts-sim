/**
 * Core Injury Domain Model
 * Implements Section 10, 38 & Phase 10.6 of the Master Technical Blueprint.
 */

export type InjuryType =
  | 'shoulder_strain'
  | 'tennis_elbow'
  | 'wrist_sprain'
  | 'blister'
  | 'dartitis';

export type InjurySeverity = 'mild' | 'moderate' | 'severe';

export interface InjuryPenalties {
  scoring: number;
  doubling: number;
  consistency: number;
  pressure: number;
}

export interface Injury {
  id: string;
  type: InjuryType;
  name: string;
  description: string;
  severity: InjurySeverity;
  weeksRemaining: number;
  initialDuration: number;
  isTreatedThisWeek: boolean;
  penalties: InjuryPenalties;
}

export interface InjuryDefinition {
  type: InjuryType;
  name: string;
  description: string;
  baseDurationWeeks: Record<InjurySeverity, number>;
  penalties: Record<InjurySeverity, InjuryPenalties>;
}

export const INJURY_DEFINITIONS: Record<InjuryType, InjuryDefinition> = {
  shoulder_strain: {
    type: 'shoulder_strain',
    name: 'Rotator Cuff Shoulder Strain',
    description: 'Inflammation of the throwing shoulder muscles, reducing throwing power and follow-through rhythm.',
    baseDurationWeeks: { mild: 2, moderate: 4, severe: 7 },
    penalties: {
      mild: { scoring: 8, doubling: 4, consistency: 6, pressure: 2 },
      moderate: { scoring: 15, doubling: 8, consistency: 12, pressure: 5 },
      severe: { scoring: 25, doubling: 14, consistency: 20, pressure: 10 }
    }
  },
  tennis_elbow: {
    type: 'tennis_elbow',
    name: 'Lateral Epicondylitis (Tennis Elbow)',
    description: 'Sharp pain on the outside of the throwing elbow affecting delicate release angle and doubling precision.',
    baseDurationWeeks: { mild: 2, moderate: 4, severe: 6 },
    penalties: {
      mild: { scoring: 5, doubling: 10, consistency: 8, pressure: 3 },
      moderate: { scoring: 10, doubling: 18, consistency: 15, pressure: 6 },
      severe: { scoring: 18, doubling: 28, consistency: 24, pressure: 12 }
    }
  },
  wrist_sprain: {
    type: 'wrist_sprain',
    name: 'Wrist Tendonitis',
    description: 'Swelling and stiffness in the wrist joint compromising dart trajectory stability and checkout focus.',
    baseDurationWeeks: { mild: 1, moderate: 3, severe: 5 },
    penalties: {
      mild: { scoring: 4, doubling: 12, consistency: 10, pressure: 2 },
      moderate: { scoring: 8, doubling: 20, consistency: 18, pressure: 5 },
      severe: { scoring: 14, doubling: 30, consistency: 26, pressure: 10 }
    }
  },
  blister: {
    type: 'blister',
    name: 'Fingertip Grip Fissure',
    description: 'Painful blister on the primary release fingers causing dart slipping and inconsistent scatter groupings.',
    baseDurationWeeks: { mild: 1, moderate: 2, severe: 3 },
    penalties: {
      mild: { scoring: 4, doubling: 6, consistency: 14, pressure: 2 },
      moderate: { scoring: 8, doubling: 12, consistency: 22, pressure: 4 },
      severe: { scoring: 12, doubling: 18, consistency: 32, pressure: 6 }
    }
  },
  dartitis: {
    type: 'dartitis',
    name: 'The Yips / Dartitis Release Block',
    description: 'Involuntary psychological block preventing the arm from releasing the dart smoothly forward at the oche.',
    baseDurationWeeks: { mild: 3, moderate: 6, severe: 10 },
    penalties: {
      mild: { scoring: 15, doubling: 15, consistency: 15, pressure: 15 },
      moderate: { scoring: 25, doubling: 25, consistency: 25, pressure: 22 },
      severe: { scoring: 38, doubling: 38, consistency: 38, pressure: 30 }
    }
  }
};

export class InjuryFactory {
  public static createInjury(type: InjuryType, severity: InjurySeverity = 'mild'): Injury {
    const def = INJURY_DEFINITIONS[type];
    const duration = def.baseDurationWeeks[severity];
    const penalties = def.penalties[severity];

    return {
      id: `injury-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      name: def.name,
      description: def.description,
      severity,
      weeksRemaining: duration,
      initialDuration: duration,
      isTreatedThisWeek: false,
      penalties: { ...penalties }
    };
  }
}
