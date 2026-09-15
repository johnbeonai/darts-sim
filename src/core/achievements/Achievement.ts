import { Player } from '../player/Player';
import { Tournament } from '../tournament/Tournament';

export type AchievementCategory = 'scoring' | 'match' | 'tour' | 'career';

export interface AchievementDefinition {
  id: string;
  title: string;
  category: AchievementCategory;
  description: string;
  badgeIcon: string;
  targetProgress: number;
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  currentProgress: number;
  unlockedAtWeek?: number;
  unlockedAtYear?: number;
  details?: string;
}

export const ACHIEVEMENT_CATALOG: Record<string, AchievementDefinition> = {
  'big-fish': {
    id: 'big-fish',
    title: 'The Big Fish',
    category: 'scoring',
    description: 'Check out the maximum possible finish in competitive darts: 170 (T20, T20, Bull).',
    badgeIcon: '🎣',
    targetProgress: 1
  },
  'nine-darter': {
    id: 'nine-darter',
    title: 'Perfection (Nine-Darter)',
    category: 'scoring',
    description: 'Complete a 501 leg in the absolute minimum possible: exactly 9 darts.',
    badgeIcon: '⚡',
    targetProgress: 1
  },
  'century-master': {
    id: 'century-master',
    title: 'Century Master (100+ Avg)',
    category: 'scoring',
    description: 'Record a 100.00+ 3-dart average in a completed competitive match.',
    badgeIcon: '🎯',
    targetProgress: 1
  },
  'maximum-overdrive': {
    id: 'maximum-overdrive',
    title: 'Maximum Overdrive',
    category: 'scoring',
    description: 'Hit 5 or more maximum 180s in a single competitive match.',
    badgeIcon: '💥',
    targetProgress: 5
  },
  'ton-machine': {
    id: 'ton-machine',
    title: 'Ton 180 Machine',
    category: 'scoring',
    description: 'Hit 50 career maximum 180 visits.',
    badgeIcon: '🧱',
    targetProgress: 50
  },
  'the-whitewash': {
    id: 'the-whitewash',
    title: 'The Whitewash',
    category: 'match',
    description: 'Win a competitive tournament match without conceding a single leg.',
    badgeIcon: '🧹',
    targetProgress: 1
  },
  'clutch-finisher': {
    id: 'clutch-finisher',
    title: 'Clutch Finisher',
    category: 'match',
    description: 'Win a high-pressure match on the final deciding leg.',
    badgeIcon: '💎',
    targetProgress: 1
  },
  'nemesis-slayer': {
    id: 'nemesis-slayer',
    title: 'Nemesis Slayer',
    category: 'match',
    description: 'Defeat a fierce rival who previously had 2 or more career wins over you.',
    badgeIcon: '🥊',
    targetProgress: 1
  },
  'first-silverware': {
    id: 'first-silverware',
    title: 'First Silverware',
    category: 'tour',
    description: 'Win your first tournament title on any circuit.',
    badgeIcon: '🏆',
    targetProgress: 1
  },
  'tour-card-winner': {
    id: 'tour-card-winner',
    title: 'PDC Tour Card Winner',
    category: 'tour',
    description: 'Secure an official 2-Year PDC Tour Card via Q-School or Top 64 retention.',
    badgeIcon: '🎖️',
    targetProgress: 1
  },
  'major-champion': {
    id: 'major-champion',
    title: 'Major Champion',
    category: 'tour',
    description: 'Lift a televised Major championship trophy (UK Open, Matchplay, Grand Prix, etc.).',
    badgeIcon: '👑',
    targetProgress: 1
  },
  'king-of-ally-pally': {
    id: 'king-of-ally-pally',
    title: 'King of Ally Pally',
    category: 'tour',
    description: 'Win the PDC World Darts Championship at Alexandra Palace.',
    badgeIcon: '🌟',
    targetProgress: 1
  },
  'high-roller': {
    id: 'high-roller',
    title: 'High Roller (£50k)',
    category: 'career',
    description: 'Accumulate £50,000 or more in career tournament prize earnings.',
    badgeIcon: '💰',
    targetProgress: 50000
  },
  'iron-stamina': {
    id: 'iron-stamina',
    title: 'Iron Stamina (2,000 Darts)',
    category: 'career',
    description: 'Throw 2,000 darts in competitive career tournament play.',
    badgeIcon: '🏹',
    targetProgress: 2000
  }
};

export class AchievementManager {
  /**
   * Initializes or backfills a progress map for a player
   */
  public static initPlayerAchievements(existing?: Record<string, AchievementProgress>): Record<string, AchievementProgress> {
    const map: Record<string, AchievementProgress> = { ...(existing || {}) };
    for (const key of Object.keys(ACHIEVEMENT_CATALOG)) {
      if (!map[key]) {
        map[key] = {
          achievementId: key,
          unlocked: false,
          currentProgress: 0
        };
      }
    }
    return map;
  }

  /**
   * Evaluates leg-level achievements (Big Fish 170 checkout, 9-dart perfection)
   */
  public static evaluateLegFinish(
    progressMap: Record<string, AchievementProgress>,
    player: Player,
    dartsThrownInLeg: number,
    checkoutScore: number,
    week: number,
    year: number
  ): string[] {
    const newlyUnlocked: string[] = [];

    // The Big Fish (170 checkout)
    if (checkoutScore === 170 && progressMap['big-fish'] && !progressMap['big-fish'].unlocked) {
      progressMap['big-fish'].unlocked = true;
      progressMap['big-fish'].currentProgress = 1;
      progressMap['big-fish'].unlockedAtWeek = week;
      progressMap['big-fish'].unlockedAtYear = year;
      progressMap['big-fish'].details = 'The Big Fish! 170 checkout (T20-T20-Bull)';
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['big-fish'].title);
    }

    // Perfection (Nine-Darter)
    if (dartsThrownInLeg === 9 && progressMap['nine-darter'] && !progressMap['nine-darter'].unlocked) {
      progressMap['nine-darter'].unlocked = true;
      progressMap['nine-darter'].currentProgress = 1;
      progressMap['nine-darter'].unlockedAtWeek = week;
      progressMap['nine-darter'].unlockedAtYear = year;
      progressMap['nine-darter'].details = 'Nine-Dart Perfection! 501 checked out in 9 darts.';
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['nine-darter'].title);
    }

    return newlyUnlocked;
  }

  /**
   * Evaluates match-level achievements (Century average, Whitewash, 180s, Deciding leg, Nemesis slayer)
   */
  public static evaluateMatchStats(
    progressMap: Record<string, AchievementProgress>,
    player: Player,
    matchStats: {
      average: number;
      scores180: number;
      legsWon: number;
    },
    opponentStats: {
      legsWon: number;
    },
    isWinner: boolean,
    isDecidingLeg: boolean,
    prevLossesAgainstOpponent: number,
    week: number,
    year: number,
    opponentName: string
  ): string[] {
    const newlyUnlocked: string[] = [];

    // Century Master (100+ Avg)
    if (matchStats.average >= 100 && progressMap['century-master'] && !progressMap['century-master'].unlocked) {
      progressMap['century-master'].unlocked = true;
      progressMap['century-master'].currentProgress = 1;
      progressMap['century-master'].unlockedAtWeek = week;
      progressMap['century-master'].unlockedAtYear = year;
      progressMap['century-master'].details = `Averaged ${matchStats.average.toFixed(2)} in competitive match`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['century-master'].title);
    }

    // The Whitewash
    if (isWinner && opponentStats.legsWon === 0 && matchStats.legsWon >= 2 && progressMap['the-whitewash'] && !progressMap['the-whitewash'].unlocked) {
      progressMap['the-whitewash'].unlocked = true;
      progressMap['the-whitewash'].currentProgress = 1;
      progressMap['the-whitewash'].unlockedAtWeek = week;
      progressMap['the-whitewash'].unlockedAtYear = year;
      progressMap['the-whitewash'].details = `Whitewashed ${opponentName} ${matchStats.legsWon}-0 without dropping a leg`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['the-whitewash'].title);
    }

    // Maximum Overdrive (5+ 180s in single match)
    if (matchStats.scores180 >= 5 && progressMap['maximum-overdrive'] && !progressMap['maximum-overdrive'].unlocked) {
      progressMap['maximum-overdrive'].unlocked = true;
      progressMap['maximum-overdrive'].currentProgress = matchStats.scores180;
      progressMap['maximum-overdrive'].unlockedAtWeek = week;
      progressMap['maximum-overdrive'].unlockedAtYear = year;
      progressMap['maximum-overdrive'].details = `Landed ${matchStats.scores180} maximums in a single encounter`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['maximum-overdrive'].title);
    }

    // Clutch Finisher (Deciding leg victory)
    if (isWinner && isDecidingLeg && progressMap['clutch-finisher'] && !progressMap['clutch-finisher'].unlocked) {
      progressMap['clutch-finisher'].unlocked = true;
      progressMap['clutch-finisher'].currentProgress = 1;
      progressMap['clutch-finisher'].unlockedAtWeek = week;
      progressMap['clutch-finisher'].unlockedAtYear = year;
      progressMap['clutch-finisher'].details = `Sealed victory in sudden-death last leg vs ${opponentName}`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['clutch-finisher'].title);
    }

    // Nemesis Slayer
    if (isWinner && prevLossesAgainstOpponent >= 2 && progressMap['nemesis-slayer'] && !progressMap['nemesis-slayer'].unlocked) {
      progressMap['nemesis-slayer'].unlocked = true;
      progressMap['nemesis-slayer'].currentProgress = 1;
      progressMap['nemesis-slayer'].unlockedAtWeek = week;
      progressMap['nemesis-slayer'].unlockedAtYear = year;
      progressMap['nemesis-slayer'].details = `Avenged ${prevLossesAgainstOpponent} previous defeats to topple rival ${opponentName}`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['nemesis-slayer'].title);
    }

    // Cumulative stats
    this.updateCumulativeCareerAchievements(progressMap, player, week, year, newlyUnlocked);

    return newlyUnlocked;
  }

  /**
   * Checks cumulative stats (180s, darts thrown, prize money)
   */
  public static updateCumulativeCareerAchievements(
    progressMap: Record<string, AchievementProgress>,
    player: Player,
    week: number,
    year: number,
    newlyUnlocked: string[] = []
  ): void {
    // Ton 180 Machine
    if (progressMap['ton-machine']) {
      progressMap['ton-machine'].currentProgress = player.stats.total180s;
      if (player.stats.total180s >= 50 && !progressMap['ton-machine'].unlocked) {
        progressMap['ton-machine'].unlocked = true;
        progressMap['ton-machine'].unlockedAtWeek = week;
        progressMap['ton-machine'].unlockedAtYear = year;
        progressMap['ton-machine'].details = 'Landed 50 career maximum 180 visits';
        newlyUnlocked.push(ACHIEVEMENT_CATALOG['ton-machine'].title);
      }
    }

    // Iron Stamina (2000 Darts)
    if (progressMap['iron-stamina']) {
      progressMap['iron-stamina'].currentProgress = player.stats.dartsThrown;
      if (player.stats.dartsThrown >= 2000 && !progressMap['iron-stamina'].unlocked) {
        progressMap['iron-stamina'].unlocked = true;
        progressMap['iron-stamina'].unlockedAtWeek = week;
        progressMap['iron-stamina'].unlockedAtYear = year;
        progressMap['iron-stamina'].details = 'Thrown over 2,000 competitive darts';
        newlyUnlocked.push(ACHIEVEMENT_CATALOG['iron-stamina'].title);
      }
    }

    // High Roller (£50,000)
    if (progressMap['high-roller']) {
      progressMap['high-roller'].currentProgress = player.prizeMoneyTotal;
      if (player.prizeMoneyTotal >= 50000 && !progressMap['high-roller'].unlocked) {
        progressMap['high-roller'].unlocked = true;
        progressMap['high-roller'].unlockedAtWeek = week;
        progressMap['high-roller'].unlockedAtYear = year;
        progressMap['high-roller'].details = `Earned £${player.prizeMoneyTotal.toLocaleString()} career prize money`;
        newlyUnlocked.push(ACHIEVEMENT_CATALOG['high-roller'].title);
      }
    }

    // Tour Card Winner
    if (progressMap['tour-card-winner'] && !progressMap['tour-card-winner'].unlocked && player.hasTourCard) {
      progressMap['tour-card-winner'].unlocked = true;
      progressMap['tour-card-winner'].currentProgress = 1;
      progressMap['tour-card-winner'].unlockedAtWeek = week;
      progressMap['tour-card-winner'].unlockedAtYear = year;
      progressMap['tour-card-winner'].details = 'Secured an official 2-Year PDC Tour Card';
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['tour-card-winner'].title);
    }
  }

  /**
   * Evaluates tournament victory achievements
   */
  public static evaluateTournamentWin(
    progressMap: Record<string, AchievementProgress>,
    player: Player,
    tournament: Tournament,
    week: number,
    year: number
  ): string[] {
    const newlyUnlocked: string[] = [];

    // First Silverware
    if (progressMap['first-silverware'] && !progressMap['first-silverware'].unlocked) {
      progressMap['first-silverware'].unlocked = true;
      progressMap['first-silverware'].currentProgress = 1;
      progressMap['first-silverware'].unlockedAtWeek = week;
      progressMap['first-silverware'].unlockedAtYear = year;
      progressMap['first-silverware'].details = `Lifted first trophy: ${tournament.config.name}`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['first-silverware'].title);
    }

    // Major Champion
    if ((tournament.config.isMajor || tournament.config.category === 'major') && progressMap['major-champion'] && !progressMap['major-champion'].unlocked) {
      progressMap['major-champion'].unlocked = true;
      progressMap['major-champion'].currentProgress = 1;
      progressMap['major-champion'].unlockedAtWeek = week;
      progressMap['major-champion'].unlockedAtYear = year;
      progressMap['major-champion'].details = `Crowned Televised Major Champion at ${tournament.config.name}`;
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['major-champion'].title);
    }

    // King of Ally Pally
    if (tournament.config.id.toLowerCase().includes('world-championship') && progressMap['king-of-ally-pally'] && !progressMap['king-of-ally-pally'].unlocked) {
      progressMap['king-of-ally-pally'].unlocked = true;
      progressMap['king-of-ally-pally'].currentProgress = 1;
      progressMap['king-of-ally-pally'].unlockedAtWeek = week;
      progressMap['king-of-ally-pally'].unlockedAtYear = year;
      progressMap['king-of-ally-pally'].details = 'World Darts Champion at Alexandra Palace!';
      newlyUnlocked.push(ACHIEVEMENT_CATALOG['king-of-ally-pally'].title);
    }

    // Cumulative check
    this.updateCumulativeCareerAchievements(progressMap, player, week, year, newlyUnlocked);

    return newlyUnlocked;
  }
}
