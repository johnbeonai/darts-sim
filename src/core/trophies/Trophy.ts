import { Tournament } from '../tournament/Tournament';
import { Player } from '../player/Player';

export type TrophyTier = 'major' | 'pro_tour' | 'european_tour' | 'challenge' | 'amateur' | 'pub' | 'special';

export interface TrophyAward {
  id: string;
  trophyId: string;
  trophyName: string;
  tournamentId: string;
  tournamentName: string;
  tier: TrophyTier;
  playerId: string;
  playerName: string;
  week: number;
  year: number;
  prizeWon: number;
  icon: string;
  venue?: string;
  description: string;
}

export interface TrophyDefinition {
  id: string;
  name: string;
  tier: TrophyTier;
  icon: string;
  venue: string;
  description: string;
  prestige: number; // 1 to 10
}

export const TROPHY_CATALOG: Record<string, TrophyDefinition> = {
  'sid-waddell': {
    id: 'sid-waddell',
    name: 'The Sid Waddell Trophy',
    tier: 'major',
    icon: '👑',
    venue: 'Alexandra Palace, London',
    description: 'The pinnacle of global darts. Awarded to the PDC World Darts Champion.',
    prestige: 10
  },
  'phil-taylor': {
    id: 'phil-taylor',
    name: 'The Phil Taylor Trophy',
    tier: 'major',
    icon: '🏆',
    venue: 'Winter Gardens, Blackpool',
    description: 'Awarded to the World Matchplay Champion in the iconic Empress Ballroom.',
    prestige: 9
  },
  'world-grand-prix': {
    id: 'world-grand-prix',
    name: 'World Grand Prix Trophy',
    tier: 'major',
    icon: '🏆',
    venue: 'Mattioli Arena, Leicester',
    description: 'The brutal Double-In Double-Out major championship.',
    prestige: 9
  },
  'eric-bristow': {
    id: 'eric-bristow',
    name: 'The Eric Bristow Trophy',
    tier: 'major',
    icon: '🏆',
    venue: 'Aldersley Leisure Village, Wolverhampton',
    description: 'Awarded to the Grand Slam of Darts Champion.',
    prestige: 9
  },
  'uk-open': {
    id: 'uk-open',
    name: 'The UK Open FA Cup Trophy',
    tier: 'major',
    icon: '🏆',
    venue: "Butlin's Resort, Minehead",
    description: 'The open-draw "FA Cup of Darts" trophy where any qualifier can triumph.',
    prestige: 8
  },
  'pc-finals': {
    id: 'pc-finals',
    name: 'Players Championship Finals Trophy',
    tier: 'major',
    icon: '🏆',
    venue: "Butlin's Resort, Minehead",
    description: 'Culmination of the 30-event ProTour floor series.',
    prestige: 8
  },
  'pro-tour-shield': {
    id: 'pro-tour-shield',
    name: 'PDC ProTour Shield',
    tier: 'pro_tour',
    icon: '🛡️',
    venue: 'PDC Floor Venues (Wigan / Barnsley / Hildesheim)',
    description: 'Awarded to winners of official PDC Players Championship floor events.',
    prestige: 7
  },
  'european-cup': {
    id: 'european-cup',
    name: 'European Tour Trophy',
    tier: 'european_tour',
    icon: '🌍',
    venue: 'Ostermann-Arena, Leverkusen',
    description: 'Awarded to the champion of European Tour stage events.',
    prestige: 7
  },
  'challenge-plaque': {
    id: 'challenge-plaque',
    name: 'PDC Challenge Tour Plaque',
    tier: 'challenge',
    icon: '🎖️',
    venue: 'Robin Park, Wigan',
    description: 'Awarded to champions of PDC Challenge Tour secondary circuit events.',
    prestige: 5
  },
  'q-school-medal': {
    id: 'q-school-medal',
    name: 'PDC Tour Card Medal of Honour',
    tier: 'special',
    icon: '⭐',
    venue: 'Robin Park Leisure Centre, Wigan',
    description: 'Awarded for winning outright at PDC Qualifying School.',
    prestige: 6
  },
  'amateur-cup': {
    id: 'amateur-cup',
    name: 'County Darts Championship Cup',
    tier: 'amateur',
    icon: '🏅',
    venue: 'Regional County Arenas',
    description: 'Silverware for regional open and amateur county tournament victories.',
    prestige: 4
  },
  'pub-tankard': {
    id: 'pub-tankard',
    name: 'The Golden Tankard',
    tier: 'pub',
    icon: '🍺',
    venue: 'Local Pub Circuit',
    description: 'Traditional grassroots silverware from local weekly knockouts.',
    prestige: 2
  }
};

export class TrophyManager {
  /**
   * Resolves a tournament configuration to an authentic trophy definition
   */
  public static resolveTrophyDefinition(tournament: Tournament): TrophyDefinition {
    const id = tournament.config.id.toLowerCase();
    const cat = tournament.config.category;

    if (id.includes('world-championship') || tournament.config.name.includes('World Darts Championship')) {
      return TROPHY_CATALOG['sid-waddell'];
    }
    if (id.includes('world-matchplay') || tournament.config.name.includes('World Matchplay')) {
      return TROPHY_CATALOG['phil-taylor'];
    }
    if (id.includes('world-grand-prix') || tournament.config.name.includes('World Grand Prix')) {
      return TROPHY_CATALOG['world-grand-prix'];
    }
    if (id.includes('grand-slam') || tournament.config.name.includes('Grand Slam')) {
      return TROPHY_CATALOG['eric-bristow'];
    }
    if (id.includes('uk-open') || tournament.config.name.includes('UK Open')) {
      return TROPHY_CATALOG['uk-open'];
    }
    if (id.includes('players-championship-finals') || tournament.config.name.includes('Players Championship Finals')) {
      return TROPHY_CATALOG['pc-finals'];
    }
    if (tournament.config.isQSchool) {
      return TROPHY_CATALOG['q-school-medal'];
    }
    if (cat === 'pro_tour') {
      return TROPHY_CATALOG['pro-tour-shield'];
    }
    if (cat === 'major') {
      return TROPHY_CATALOG['pro-tour-shield'];
    }
    if (id.includes('european') || tournament.config.name.includes('European')) {
      return TROPHY_CATALOG['european-cup'];
    }
    if (cat === 'challenge_tour') {
      return TROPHY_CATALOG['challenge-plaque'];
    }
    if (cat === 'amateur') {
      return TROPHY_CATALOG['amateur-cup'];
    }
    // Default pub circuit
    return TROPHY_CATALOG['pub-tankard'];
  }

  /**
   * Generates a permanent trophy award instance for a tournament winner
   */
  public static createAward(tournament: Tournament, winner: Player, week: number, year: number): TrophyAward {
    const def = this.resolveTrophyDefinition(tournament);
    return {
      id: `trophy-${winner.id}-${tournament.config.id}-y${year}w${week}-${Date.now()}`,
      trophyId: def.id,
      trophyName: def.name,
      tournamentId: tournament.config.id,
      tournamentName: tournament.config.name,
      tier: def.tier,
      playerId: winner.id,
      playerName: winner.name,
      week,
      year,
      prizeWon: tournament.config.prizePool.winner,
      icon: def.icon,
      venue: def.venue,
      description: def.description
    };
  }
}
