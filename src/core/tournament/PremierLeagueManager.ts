import { Player } from '../player/Player';
import { TournamentConfig } from './Tournament';

export interface PremierLeagueVenue {
  nightNumber: number; // 1 to 16
  week: number; // 5 to 20
  city: string;
  arena: string;
  country: string;
}

export interface PremierLeagueStandingsEntry {
  playerId: string;
  playerName: string;
  nationality: string;
  playedNights: number;
  nightWins: number;
  nightRunnerUps: number;
  matchesWon: number;
  matchesLost: number;
  legsWon: number;
  legsLost: number;
  legDifference: number;
  points: number;
}

export interface PremierLeagueNightRecord {
  nightNumber: number;
  week: number;
  venue: string;
  city: string;
  winnerId: string;
  runnerUpId: string;
  semiFinalistIds: string[];
}

export interface SerializedPremierLeagueData {
  year: number;
  contestantIds: string[];
  standings: PremierLeagueStandingsEntry[];
  currentNightIndex: number;
  nightRecords: PremierLeagueNightRecord[];
  isPlayOffsCompleted: boolean;
  championId?: string;
  runnerUpId?: string;
}

export const PREMIER_LEAGUE_VENUES: PremierLeagueVenue[] = [
  { nightNumber: 1, week: 5, city: 'Belfast', arena: 'SSE Arena Belfast', country: 'Northern Ireland' },
  { nightNumber: 2, week: 6, city: 'Berlin', arena: 'Mercedes-Benz Arena', country: 'Germany' },
  { nightNumber: 3, week: 7, city: 'Glasgow', arena: 'OVO Hydro', country: 'Scotland' },
  { nightNumber: 4, week: 8, city: 'Dublin', arena: '3Arena Dublin', country: 'Ireland' },
  { nightNumber: 5, week: 9, city: 'Exeter', arena: 'Westpoint Exeter', country: 'England' },
  { nightNumber: 6, week: 10, city: 'Brighton', arena: 'The Brighton Centre', country: 'England' },
  { nightNumber: 7, week: 11, city: 'Nottingham', arena: 'Motorpoint Arena', country: 'England' },
  { nightNumber: 8, week: 12, city: 'Newcastle', arena: 'Utilita Arena Newcastle', country: 'England' },
  { nightNumber: 9, week: 13, city: 'Manchester', arena: 'AO Arena', country: 'England' },
  { nightNumber: 10, week: 14, city: 'Rotterdam', arena: 'Rotterdam Ahoy', country: 'Netherlands' },
  { nightNumber: 11, week: 15, city: 'Liverpool', arena: 'M&S Bank Arena', country: 'England' },
  { nightNumber: 12, week: 16, city: 'Aberdeen', arena: 'P&J Live Aberdeen', country: 'Scotland' },
  { nightNumber: 13, week: 17, city: 'Leeds', arena: 'First Direct Arena', country: 'England' },
  { nightNumber: 14, week: 18, city: 'Sheffield', arena: 'Utilita Arena Sheffield', country: 'England' },
  { nightNumber: 15, week: 19, city: 'Birmingham', arena: 'Utilita Arena Birmingham', country: 'England' },
  { nightNumber: 16, week: 20, city: 'London', arena: 'OVO Arena Wembley', country: 'England' }
];

export class PremierLeagueManager {
  public year: number;
  public contestantIds: string[] = [];
  public standings: PremierLeagueStandingsEntry[] = [];
  public currentNightIndex: number = 0; // 0..15 (nights 1..16), 16 = Play-Offs, 17 = Finished
  public nightRecords: PremierLeagueNightRecord[] = [];
  public isPlayOffsCompleted: boolean = false;
  public championId?: string;
  public runnerUpId?: string;

  constructor(year: number = 2026) {
    this.year = year;
  }

  /**
   * Initializes the 8-player field for the Premier League season.
   * Top ranked players + human player if qualified / elite.
   */
  public initializeSeason(allPlayers: Player[], humanPlayerId: string): void {
    const sorted = [...allPlayers].sort((a, b) => {
      const rA = a.ranking ?? 999;
      const rB = b.ranking ?? 999;
      if (rA !== rB) return rA - rB;
      return (b.rankingPoints ?? 0) - (a.rankingPoints ?? 0);
    });

    const contestants: Player[] = [];
    const humanPlayer = allPlayers.find(p => p.id === humanPlayerId);

    // If human player is top 8 or tour card holder, include them!
    const isHumanEligible = humanPlayer && ((humanPlayer.ranking ?? 999) <= 8 || humanPlayer.tier === 'elite' || humanPlayer.tier === 'pro');

    if (isHumanEligible && humanPlayer) {
      contestants.push(humanPlayer);
    }

    for (const p of sorted) {
      if (contestants.length >= 8) break;
      if (!contestants.some(c => c.id === p.id)) {
        contestants.push(p);
      }
    }

    this.contestantIds = contestants.map(p => p.id);
    this.currentNightIndex = 0;
    this.nightRecords = [];
    this.isPlayOffsCompleted = false;

    this.standings = contestants.map(p => ({
      playerId: p.id,
      playerName: p.name,
      nationality: p.nationality,
      playedNights: 0,
      nightWins: 0,
      nightRunnerUps: 0,
      matchesWon: 0,
      matchesLost: 0,
      legsWon: 0,
      legsLost: 0,
      legDifference: 0,
      points: 0
    }));
  }

  public isContestant(playerId: string): boolean {
    return this.contestantIds.includes(playerId);
  }

  public getCurrentVenue(): PremierLeagueVenue | null {
    if (this.currentNightIndex >= 0 && this.currentNightIndex < PREMIER_LEAGUE_VENUES.length) {
      return PREMIER_LEAGUE_VENUES[this.currentNightIndex];
    }
    return null;
  }

  public static isPremierLeagueWeek(week: number): boolean {
    return (week >= 5 && week <= 20) || week === 21;
  }

  public static getVenueForWeek(week: number): PremierLeagueVenue | null {
    return PREMIER_LEAGUE_VENUES.find(v => v.week === week) || null;
  }

  public generateNightTournament(nightIndex: number): TournamentConfig {
    const venue = PREMIER_LEAGUE_VENUES[nightIndex] || PREMIER_LEAGUE_VENUES[0];

    return {
      id: `premier-league-night-${venue.nightNumber}-${this.year}`,
      name: `BetMGM Premier League — Night ${venue.nightNumber} (${venue.city})`,
      location: `${venue.arena}, ${venue.city}`,
      tier: 'elite',
      category: 'major',
      isMajor: true,
      tvBroadcastName: 'Sky Sports Premier League Darts LIVE',
      entryFee: 0,
      prizePool: {
        winner: 10000,
        runnerUp: 0,
        semiFinalist: 0,
        quarterFinalist: 0
      },
      rankingPoints: {
        winner: 0,
        runnerUp: 0,
        semiFinalist: 0,
        quarterFinalist: 0
      },
      format: {
        type: 'legs',
        bestOfLegs: 11,
        startingScore: 501,
        doubleOutRequired: true
      },
      requirements: {
        description: `Premier League Night ${venue.nightNumber}: 8 Elite Contestants Mini-Knockout`
      }
    };
  }

  public recordNightResult(
    nightNumber: number,
    venueName: string,
    cityName: string,
    winnerId: string,
    runnerUpId: string,
    semiFinalistIds: string[],
    matchResults: { p1Id: string; p2Id: string; p1Legs: number; p2Legs: number }[]
  ): void {
    this.nightRecords.push({
      nightNumber,
      week: PREMIER_LEAGUE_VENUES[nightNumber - 1]?.week ?? (4 + nightNumber),
      venue: venueName,
      city: cityName,
      winnerId,
      runnerUpId,
      semiFinalistIds
    });

    for (const entry of this.standings) {
      if (this.contestantIds.includes(entry.playerId)) {
        entry.playedNights += 1;
      }

      if (entry.playerId === winnerId) {
        entry.points += 5;
        entry.nightWins += 1;
      } else if (entry.playerId === runnerUpId) {
        entry.points += 3;
        entry.nightRunnerUps += 1;
      } else if (semiFinalistIds.includes(entry.playerId)) {
        entry.points += 2;
      }
    }

    for (const m of matchResults) {
      const e1 = this.standings.find(s => s.playerId === m.p1Id);
      const e2 = this.standings.find(s => s.playerId === m.p2Id);

      if (e1 && e2) {
        e1.legsWon += m.p1Legs;
        e1.legsLost += m.p2Legs;
        e1.legDifference = e1.legsWon - e1.legsLost;

        e2.legsWon += m.p2Legs;
        e2.legsLost += m.p1Legs;
        e2.legDifference = e2.legsWon - e2.legsLost;

        if (m.p1Legs > m.p2Legs) {
          e1.matchesWon += 1;
          e2.matchesLost += 1;
        } else {
          e2.matchesWon += 1;
          e1.matchesLost += 1;
        }
      }
    }

    this.sortStandings();
    this.currentNightIndex += 1;
  }

  private sortStandings(): void {
    this.standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.legDifference !== a.legDifference) return b.legDifference - a.legDifference;
      if (b.legsWon !== a.legsWon) return b.legsWon - a.legsWon;
      return b.nightWins - a.nightWins;
    });
  }

  public getPlayOffsQualifiers(): PremierLeagueStandingsEntry[] {
    return this.standings.slice(0, 4);
  }

  public generatePlayOffsTournament(): TournamentConfig {
    return {
      id: `premier-league-play-offs-${this.year}`,
      name: 'BetMGM Premier League Play-Offs (Finals Night)',
      location: 'The O2 Arena, London',
      tier: 'elite',
      category: 'major',
      isMajor: true,
      tvBroadcastName: 'Sky Sports Premier League Finals LIVE',
      entryFee: 0,
      prizePool: {
        winner: 275000,
        runnerUp: 125000,
        semiFinalist: 85000,
        quarterFinalist: 0
      },
      rankingPoints: {
        winner: 0,
        runnerUp: 0,
        semiFinalist: 0,
        quarterFinalist: 0
      },
      format: {
        type: 'legs',
        bestOfLegs: 21,
        startingScore: 501,
        doubleOutRequired: true
      },
      requirements: {
        description: 'The O2 Arena Play-Offs: Top 4 Premier League Table Finishers!'
      }
    };
  }

  public recordPlayOffsResult(championId: string, runnerUpId: string): void {
    this.isPlayOffsCompleted = true;
    this.championId = championId;
    this.runnerUpId = runnerUpId;
    this.currentNightIndex = 17;
  }

  public toJSON(): SerializedPremierLeagueData {
    return {
      year: this.year,
      contestantIds: [...this.contestantIds],
      standings: this.standings.map(s => ({ ...s })),
      currentNightIndex: this.currentNightIndex,
      nightRecords: this.nightRecords.map(r => ({ ...r, semiFinalistIds: [...r.semiFinalistIds] })),
      isPlayOffsCompleted: this.isPlayOffsCompleted,
      championId: this.championId,
      runnerUpId: this.runnerUpId
    };
  }

  public static fromJSON(data: SerializedPremierLeagueData): PremierLeagueManager {
    const pl = new PremierLeagueManager(data.year);
    pl.contestantIds = data.contestantIds || [];
    pl.standings = data.standings || [];
    pl.currentNightIndex = data.currentNightIndex ?? 0;
    pl.nightRecords = data.nightRecords || [];
    pl.isPlayOffsCompleted = data.isPlayOffsCompleted ?? false;
    pl.championId = data.championId;
    pl.runnerUpId = data.runnerUpId;
    return pl;
  }
}
