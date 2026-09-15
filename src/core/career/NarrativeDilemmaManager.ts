/**
 * Off-the-Oche Lifestyle & Narrative Dilemmas Engine
 * Implements Section 17 & 39 of the Master Technical Blueprint.
 */

import { Player } from '../player/Player';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';

export interface DilemmaConsequence {
  bankBalanceDelta?: number;
  fatigueDelta?: number;
  confidenceDelta?: number;
  formDelta?: number;
  reputationTitle?: string;
}

export interface DilemmaOption {
  id: string;
  label: string;
  description: string;
  consequences: DilemmaConsequence;
  outcomeMessage: string;
}

export interface NarrativeDilemma {
  id: string;
  title: string;
  category: 'exhibition' | 'lifestyle' | 'travel' | 'equipment' | 'media' | 'community';
  icon: string;
  context: string;
  dilemmaPrompt: string;
  options: [DilemmaOption, DilemmaOption];
}

export const DILEMMA_CATALOG: NarrativeDilemma[] = [
  {
    id: 'friday-exhibition-gala',
    title: 'Lucrative Friday Night Exhibition Gala',
    category: 'exhibition',
    icon: '💰',
    context: 'A regional darts promoter has offered £7,500 cash for you to headline an exhibition night at a sold-out working men\'s club on the eve of this weekend\'s PDC Pro Tour.',
    dilemmaPrompt: 'Do you take the quick payday or prioritize fresh match sharpness for the tour?',
    options: [
      {
        id: 'accept-gala',
        label: 'Accept Exhibition Payday (+£7,500)',
        description: 'Earn substantial cash and entertain local fans, but face travel fatigue and late-night beers.',
        consequences: {
          bankBalanceDelta: 7500,
          fatigueDelta: 16,
          confidenceDelta: 5,
          formDelta: -4,
          reputationTitle: 'The Crowd Entertainer'
        },
        outcomeMessage: 'You delighted the packed house with trick shots and 180s, pocketing £7,500 cash! However, the late night has left your throwing arm heavy with fatigue.'
      },
      {
        id: 'decline-gala',
        label: 'Decline & Rest in Hotel Room',
        description: 'Protect your energy and focus completely on tournament preparation.',
        consequences: {
          fatigueDelta: -12,
          confidenceDelta: 6,
          formDelta: 3,
          reputationTitle: 'Dedicated Professional'
        },
        outcomeMessage: 'You enjoyed an early night and pristine rest. Your throwing rhythm feels crisp and your body refreshed for tournament day.'
      }
    ]
  },
  {
    id: 'hotel-bar-rivalry',
    title: 'Late Night Hotel Lounge Confrontation',
    category: 'lifestyle',
    icon: '🍻',
    context: 'Returning to your hotel after practice, your fiercest rival is holding court at the bar with fellow pros and gestures for you to join them for drinks.',
    dilemmaPrompt: 'Do you engage in psychological sparring over a pint or retreat to your room?',
    options: [
      {
        id: 'join-drinks',
        label: 'Pull Up a Stool & Match Their Wit',
        description: 'Trade psychological jabs and assert your presence in front of the circuit.',
        consequences: {
          confidenceDelta: 10,
          fatigueDelta: 10,
          reputationTitle: 'Fearless Competitor'
        },
        outcomeMessage: 'You held your ground with razor-sharp banter, throwing your rival off balance. Your confidence is soaring, though you got to bed later than planned.'
      },
      {
        id: 'head-to-bed',
        label: 'Ice-Cold Nod & Head Upstairs',
        description: 'Show complete unbothered professionalism and save all energy for the oche.',
        consequences: {
          fatigueDelta: -8,
          confidenceDelta: 4,
          formDelta: 2,
          reputationTitle: 'The Iceman'
        },
        outcomeMessage: 'A cold, unblinking smile was all you gave them. Your calm discipline unnerved them while guaranteeing full physical recovery.'
      }
    ]
  },
  {
    id: 'travel-lux-vs-budget',
    title: 'Tour Travel Logistics: Red-Eye vs First Class',
    category: 'travel',
    icon: '✈️',
    context: 'You must travel overnight between tour cities. Your commercial agent has provided two travel routing options.',
    dilemmaPrompt: 'Do you pinch pennies on budget transport or invest in luxury sleeper transit?',
    options: [
      {
        id: 'budget-transit',
        label: 'Budget Overnight Transit (-£80)',
        description: 'Save cash for equipment and entry fees, but suffer cramped seating and broken sleep.',
        consequences: {
          bankBalanceDelta: -80,
          fatigueDelta: 18,
          formDelta: -3
        },
        outcomeMessage: 'You saved £1,000, but the noisy night coach left you with a stiff neck and aching shoulder muscles.'
      },
      {
        id: 'luxury-transit',
        label: 'First-Class Sleeper Car (-£1,100)',
        description: 'Full lie-flat bed, quiet cabin, and breakfast service ensuring zero travel strain.',
        consequences: {
          bankBalanceDelta: -1100,
          fatigueDelta: -15,
          confidenceDelta: 6,
          reputationTitle: 'First Class Pro'
        },
        outcomeMessage: 'You arrived refreshed and relaxed like a true world champion. The £1,100 investment paid dividends for your physical readiness.'
      }
    ]
  },
  {
    id: 'prototype-flight-gamble',
    title: 'Experimental Aerodynamic Flights Test',
    category: 'equipment',
    icon: '🎯',
    context: 'Your dart manufacturer has shipped an experimental aerodynamic flight with dimpled surface textures designed to stabilize dart trajectory in turbulent venue drafts.',
    dilemmaPrompt: 'Do you risk testing the prototype in live competitive play or stick to your trusted setup?',
    options: [
      {
        id: 'adopt-prototype',
        label: 'Adopt the Radical Prototype',
        description: 'High reward technical tweak: chance to unlock superior grouping if you adapt quickly.',
        consequences: {
          formDelta: 6,
          confidenceDelta: 5,
          reputationTitle: 'Technical Innovator'
        },
        outcomeMessage: 'The new flights provide laser-straight entry into the treble bed! Your grouping is tighter than ever.'
      },
      {
        id: 'reject-prototype',
        label: 'Stick to Proven Reliable Match Darts',
        description: 'Zero risk: retain your muscle memory and mechanical feel.',
        consequences: {
          confidenceDelta: 4,
          formDelta: 1
        },
        outcomeMessage: 'You politely return the prototype to the workshop. Your tried-and-true darts remain an extension of your arm.'
      }
    ]
  },
  {
    id: 'media-headline-trap',
    title: 'Controversial Post-Match Press Interview',
    category: 'media',
    icon: '📰',
    context: 'A tabloid journalist corners you asking if you agree with claims that the top seeds receive unfair stage scheduling.',
    dilemmaPrompt: 'How do you address the media firestorm?',
    options: [
      {
        id: 'fiery-maverick',
        label: 'Speak Your Mind with Fiery Honesty',
        description: 'Generate massive headlines and fan buzz, but draw scrutiny from PDC officials.',
        consequences: {
          bankBalanceDelta: 1500, // Media interview bonus
          confidenceDelta: 8,
          reputationTitle: 'Outspoken Maverick'
        },
        outcomeMessage: 'Your explosive quotes lead the sports pages! The darts community is buzzing and your social following jumped overnight.'
      },
      {
        id: 'diplomatic-pro',
        label: 'Diplomatic Ambassador Response',
        description: 'Praise the tournament organizers and keep full focus strictly on your darts.',
        consequences: {
          confidenceDelta: 5,
          formDelta: 2,
          reputationTitle: 'Class Act'
        },
        outcomeMessage: 'Your dignified professionalism earned praise from tournament directors and commentators alike.'
      }
    ]
  },
  {
    id: 'jdc-charity-clinic',
    title: 'Junior Darts Academy Masterclass',
    category: 'community',
    icon: '🌟',
    context: 'The Junior Darts Corporation has invited you to spend 2 hours coaching local youth players and demonstrating your stance and grip.',
    dilemmaPrompt: 'Will you give back to the grassroots or spend the morning practicing alone?',
    options: [
      {
        id: 'host-masterclass',
        label: 'Host the Junior Clinic',
        description: 'Inspire the next generation and enjoy genuine community adoration.',
        consequences: {
          confidenceDelta: 12,
          fatigueDelta: 4,
          reputationTitle: 'People\'s Champion'
        },
        outcomeMessage: 'The kids were inspired by your tips and you felt an immense sense of joy and perspective. You step to the oche with renewed passion!'
      },
      {
        id: 'solo-practice',
        label: 'Dedicate Morning to 100-Leg Drill',
        description: 'Relentless repetition on doubles and checkout finishing.',
        consequences: {
          formDelta: 5,
          fatigueDelta: 6
        },
        outcomeMessage: 'Two uninterrupted hours on the practice board honed your double 16 and double 20 to near automatic consistency.'
      }
    ]
  }
];

export class NarrativeDilemmaManager {
  /**
   * Evaluates whether a dilemma should trigger this week (~30% chance per week)
   */
  public static evaluateWeeklyDilemma(
    week: number,
    rng: IRandomProvider = new DefaultRandomProvider()
  ): NarrativeDilemma | null {
    // Guaranteed on certain landmark weeks (e.g. Week 10, Week 24, Week 40), or 30% chance
    const isLandmark = week === 10 || week === 24 || week === 40;
    if (!isLandmark && rng.next() > 0.35) {
      return null;
    }

    const idx = Math.floor(rng.next() * DILEMMA_CATALOG.length);
    return DILEMMA_CATALOG[idx];
  }

  /**
   * Applies the chosen option's consequences to the player
   */
  public static resolveChoice(player: Player, option: DilemmaOption): string {
    const cons = option.consequences;

    if (cons.bankBalanceDelta) {
      player.bankBalance = Math.max(0, player.bankBalance + cons.bankBalanceDelta);
    }
    if (cons.fatigueDelta) {
      if (cons.fatigueDelta > 0) {
        player.state.fatigue = Math.min(100, player.state.fatigue + cons.fatigueDelta);
      } else {
        player.recoverFatigue(Math.abs(cons.fatigueDelta));
      }
    }
    if (cons.confidenceDelta) {
      player.adjustConfidence(cons.confidenceDelta);
    }
    if (cons.formDelta) {
      player.state.form = Math.min(100, Math.max(10, player.state.form + cons.formDelta));
    }

    return option.outcomeMessage;
  }
}
