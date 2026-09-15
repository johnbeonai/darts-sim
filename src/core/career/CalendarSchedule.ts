import { TournamentConfig } from '../tournament/Tournament';
import { PREMIER_LEAGUE_VENUES } from '../tournament/PremierLeagueManager';

/**
 * CalendarSchedule
 * Generates authentic professional darts tournament calendar across 52 weeks.
 * Supports:
 * - Week 1-2: PDC Qualifying School (Q-School)
 * - Pub Circuit & Amateur Regionals (Open to all)
 * - Challenge Tour (Non-card holders / Semi-Pros)
 * - PDC Players Championships / Pro Tour (PDC Tour Card holders)
 * - European Tour (Tour Card holders)
 * - Major Televised Championships with Order of Merit Cutoffs:
 *     * Week 9: UK Open (Minehead)
 *     * Week 28: World Matchplay (Blackpool, Top 32 cutoff)
 *     * Week 40: World Grand Prix (Leicester, Top 32 cutoff)
 *     * Week 45: Grand Slam of Darts (Wolverhampton, Top 32 cutoff)
 *     * Week 48: Players Championship Finals (Minehead, Top 64 cutoff)
 *     * Weeks 50-52: PDC World Darts Championship (Ally Pally, Top 64 cutoff)
 */
export class CalendarSchedule {
  public static getTournamentsForWeek(week: number, year: number = 2026): TournamentConfig[] {
    const list: TournamentConfig[] = [];

    // 1. Always provide at least one local Pub Circuit event (Open to anyone)
    list.push(this.getPubEventForWeek(week));

    // 2. Always provide an Amateur Regional event (Open to amateurs & semi-pros)
    list.push(this.getAmateurEventForWeek(week));

    // 3. Premier League Darts Roadshow (Weeks 5-20: 16 league nights, Week 21: Play-Offs)
    if (week >= 5 && week <= 20) {
      const plVenue = PREMIER_LEAGUE_VENUES.find(v => v.week === week);
      if (plVenue) {
        list.push({
          id: `premier-league-night-${plVenue.nightNumber}-${year}`,
          name: `BetMGM Premier League — Night ${plVenue.nightNumber} (${plVenue.city})`,
          location: `${plVenue.arena}, ${plVenue.city}`,
          tier: 'elite',
          category: 'major',
          isMajor: true,
          tvBroadcastName: 'Sky Sports Premier League Darts LIVE',
          entryFee: 0,
          prizePool: { winner: 10000, runnerUp: 0, semiFinalist: 0, quarterFinalist: 0 },
          rankingPoints: { winner: 0, runnerUp: 0, semiFinalist: 0, quarterFinalist: 0 },
          format: { type: 'legs', bestOfLegs: 11, startingScore: 501, doubleOutRequired: true },
          requirements: {
            tourCardRequired: true,
            maxRank: 8,
            description: `Premier League Contestants (Night ${plVenue.nightNumber} in ${plVenue.city})`
          }
        });
      }
    } else if (week === 21) {
      list.push({
        id: `premier-league-play-offs-${year}`,
        name: 'BetMGM Premier League Play-Offs (The O2)',
        location: 'The O2 Arena, London',
        tier: 'elite',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'Sky Sports Premier League Finals LIVE',
        entryFee: 0,
        prizePool: { winner: 275000, runnerUp: 125000, semiFinalist: 85000, quarterFinalist: 0 },
        rankingPoints: { winner: 0, runnerUp: 0, semiFinalist: 0, quarterFinalist: 0 },
        format: { type: 'legs', bestOfLegs: 21, startingScore: 501, doubleOutRequired: true },
        requirements: {
          tourCardRequired: true,
          maxRank: 4,
          description: 'Top 4 Premier League Table Finishers Only'
        }
      });
    }

    // 4. Calendar-specific events
    if (week === 1) {
      // Q-School Stage 1 & 2
      list.push({
        id: `q-school-s1-${week}`,
        name: 'PDC Qualifying School — First Stage',
        location: 'Robin Park Leisure Centre, Wigan',
        tier: 'semi_pro',
        category: 'q_school',
        isQSchool: true,
        entryFee: 150,
        prizePool: { winner: 1000, runnerUp: 500, semiFinalist: 250, quarterFinalist: 100 },
        rankingPoints: { winner: 100, runnerUp: 60, semiFinalist: 35, quarterFinalist: 15 },
        format: { type: 'legs', bestOfLegs: 7, startingScore: 501 },
        requirements: {
          nonCardHoldersOnly: true,
          description: 'Open to Non-Tour Card Holders. Top finishers advance to Final Stage!'
        }
      });
    } else if (week === 2) {
      // Q-School Final Stage
      list.push({
        id: `q-school-final-${week}`,
        name: 'PDC Qualifying School — Final Stage',
        location: 'Robin Park Leisure Centre, Wigan',
        tier: 'semi_pro',
        category: 'q_school',
        isQSchool: true,
        entryFee: 150,
        prizePool: { winner: 2000, runnerUp: 1000, semiFinalist: 500, quarterFinalist: 200 },
        rankingPoints: { winner: 150, runnerUp: 90, semiFinalist: 50, quarterFinalist: 25 },
        format: { type: 'legs', bestOfLegs: 7, startingScore: 501 },
        requirements: {
          nonCardHoldersOnly: true,
          requiresQSchoolFinal: true,
          description: 'Q-School Final Stage: Stage 1 Qualifiers Only. Earns 2-Year PDC Tour Card!'
        }
      });
    } else if (week === 9) {
      // UK Open (Minehead)
      list.push({
        id: `uk-open-${week}`,
        name: 'The UK Open ("The FA Cup of Darts")',
        location: "Butlin's Resort, Minehead",
        tier: 'pro',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'ITV4 Sport LIVE',
        entryFee: 0,
        prizePool: { winner: 110000, runnerUp: 50000, semiFinalist: 30000, quarterFinalist: 15000 },
        rankingPoints: { winner: 300, runnerUp: 180, semiFinalist: 110, quarterFinalist: 60 },
        format: { type: 'legs', bestOfLegs: 11, startingScore: 501 },
        requirements: {
          tourCardRequired: true,
          maxRank: 128,
          description: 'Tour Card Holders & Top 128 Order of Merit'
        }
      });
    } else if (week === 28) {
      // World Matchplay (Blackpool)
      list.push({
        id: `world-matchplay-${week}`,
        name: 'Betfred World Matchplay',
        location: 'Winter Gardens, Blackpool',
        tier: 'elite',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'Sky Sports Darts LIVE',
        entryFee: 0,
        prizePool: { winner: 200000, runnerUp: 100000, semiFinalist: 50000, quarterFinalist: 30000 },
        rankingPoints: { winner: 450, runnerUp: 280, semiFinalist: 160, quarterFinalist: 90 },
        format: {
          type: 'legs',
          bestOfLegs: 19,
          startingScore: 501,
          winByTwoClearLegs: true,
          maxTieBreakLegs: 6
        },
        requirements: {
          maxRank: 32,
          tourCardRequired: true,
          description: 'Top 32 Official PDC Order of Merit Cutoff'
        }
      });
    } else if (week === 40) {
      // World Grand Prix (Leicester Arena)
      list.push({
        id: `world-grand-prix-${week}`,
        name: 'BoyleSports World Grand Prix',
        location: 'Mattioli Arena, Leicester',
        tier: 'elite',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'Sky Sports Darts LIVE',
        entryFee: 0,
        prizePool: { winner: 130000, runnerUp: 65000, semiFinalist: 35000, quarterFinalist: 20000 },
        rankingPoints: { winner: 380, runnerUp: 230, semiFinalist: 130, quarterFinalist: 75 },
        format: {
          type: 'sets',
          bestOfSets: 5,
          legsPerSet: 3,
          startingScore: 501,
          doubleInRequired: true,
          doubleOutRequired: true
        },
        requirements: {
          maxRank: 32,
          tourCardRequired: true,
          description: 'Top 32 Order of Merit Cutoff (Double-In Double-Out)'
        }
      });
    } else if (week === 45) {
      // Grand Slam of Darts
      list.push({
        id: `grand-slam-${week}`,
        name: 'Mr Vegas Grand Slam of Darts',
        location: 'Aldersley Leisure Village, Wolverhampton',
        tier: 'elite',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'Sky Sports Darts LIVE',
        entryFee: 0,
        prizePool: { winner: 150000, runnerUp: 70000, semiFinalist: 40000, quarterFinalist: 25000 },
        rankingPoints: { winner: 400, runnerUp: 250, semiFinalist: 140, quarterFinalist: 80 },
        format: { type: 'legs', bestOfLegs: 19, startingScore: 501 },
        requirements: {
          maxRank: 32,
          tourCardRequired: true,
          description: 'Major Champions & Top 32 Order of Merit'
        }
      });
    } else if (week === 48) {
      // Players Championship Finals
      list.push({
        id: `players-championship-finals-${week}`,
        name: 'Players Championship Finals',
        location: "Butlin's Resort, Minehead",
        tier: 'pro',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'ITV4 Sport LIVE',
        entryFee: 0,
        prizePool: { winner: 120000, runnerUp: 60000, semiFinalist: 30000, quarterFinalist: 18000 },
        rankingPoints: { winner: 320, runnerUp: 200, semiFinalist: 110, quarterFinalist: 65 },
        format: { type: 'legs', bestOfLegs: 11, startingScore: 501 },
        requirements: {
          tourCardRequired: true,
          maxRank: 64,
          description: 'Top 64 Pro Tour Order of Merit Qualifiers'
        }
      });
    } else if (week >= 50 && week <= 52) {
      // World Darts Championship at Alexandra Palace
      list.push({
        id: `world-championship-${year}-${week}`,
        name: 'PDC World Darts Championship',
        location: 'Alexandra Palace ("Ally Pally"), London',
        tier: 'elite',
        category: 'major',
        isMajor: true,
        tvBroadcastName: 'Sky Sports Darts World Feed',
        entryFee: 0,
        prizePool: { winner: 500000, runnerUp: 200000, semiFinalist: 100000, quarterFinalist: 50000 },
        rankingPoints: { winner: 1000, runnerUp: 600, semiFinalist: 350, quarterFinalist: 200 },
        format: { type: 'sets', bestOfSets: 7, legsPerSet: 3, startingScore: 501 },
        requirements: {
          tourCardRequired: true,
          maxRank: 64,
          description: 'The Pinnacle: Tour Card Holders & Top 64 Official Cutoff'
        }
      });
    } else if ([4, 10, 16, 24, 32, 42].includes(week)) {
      // Challenge Tour Weekend (Non-Card Holders)
      list.push({
        id: `challenge-tour-event-${week}`,
        name: `PDC Challenge Tour Event ${Math.floor(week / 4)}`,
        location: 'Marshall Arena, Milton Keynes',
        tier: 'semi_pro',
        category: 'challenge_tour',
        entryFee: 50,
        prizePool: { winner: 2500, runnerUp: 1200, semiFinalist: 600, quarterFinalist: 250 },
        rankingPoints: { winner: 80, runnerUp: 50, semiFinalist: 25, quarterFinalist: 10 },
        format: { type: 'legs', bestOfLegs: 5, startingScore: 501 },
        requirements: {
          nonCardHoldersOnly: true,
          minTier: 'semi_pro',
          requiresQSchoolParticipation: true,
          description: 'PDC Challenge Tour: Semi-Pro & Q-School Competitors (Non-Card Holders)'
        }
      });
    } else if ([14, 20, 30, 36, 44].includes(week)) {
      // European Tour Event
      list.push({
        id: `european-tour-${week}`,
        name: `European Darts Trophy (Event ${Math.floor(week / 7)})`,
        location: 'Ostermann-Arena, Leverkusen, Germany',
        tier: 'pro',
        category: 'pro_tour',
        tvBroadcastName: 'PDC TV / DAZN',
        entryFee: 125,
        prizePool: { winner: 30000, runnerUp: 14000, semiFinalist: 7500, quarterFinalist: 4000 },
        rankingPoints: { winner: 140, runnerUp: 85, semiFinalist: 50, quarterFinalist: 25 },
        format: { type: 'legs', bestOfLegs: 7, startingScore: 501 },
        requirements: {
          tourCardRequired: true,
          minTier: 'pro',
          description: 'PDC Tour Card Holders & European Qualifiers'
        }
      });
    } else if ([3, 5, 7, 12, 17, 21, 27, 33, 37, 43, 47].includes(week)) {
      // Players Championship Pro Tour Floor Event
      const pcNum = [3, 5, 7, 12, 17, 21, 27, 33, 37, 43, 47].indexOf(week) + 1;
      list.push({
        id: `players-championship-${pcNum}-${week}`,
        name: `Players Championship ${pcNum}`,
        location: pcNum % 2 === 0 ? 'Robin Park, Wigan' : 'Barnsley Metrodome',
        tier: 'pro',
        category: 'pro_tour',
        entryFee: 100,
        prizePool: { winner: 15000, runnerUp: 7500, semiFinalist: 4000, quarterFinalist: 2000 },
        rankingPoints: { winner: 100, runnerUp: 60, semiFinalist: 35, quarterFinalist: 15 },
        format: { type: 'legs', bestOfLegs: 7, startingScore: 501 },
        requirements: {
          tourCardRequired: true,
          minTier: 'pro',
          description: 'PDC Tour Card Holders Floor Event'
        }
      });
    }

    return list;
  }

  private static getPubEventForWeek(week: number): TournamentConfig {
    const pubVenues = [
      { name: 'The Red Lion Thursday Open', location: 'Coventry, West Midlands', winner: 120, fee: 10 },
      { name: 'The Fox & Hounds Weekly Trophy', location: 'Solihull, West Midlands', winner: 150, fee: 12 },
      { name: 'The Black Horse Darts Shield', location: 'Wolverhampton', winner: 140, fee: 10 },
      { name: 'The Crown & Anchor Friday Classic', location: 'Dudley, Black Country', winner: 180, fee: 15 },
      { name: "The King's Head Invitational", location: 'Stourbridge', winner: 160, fee: 12 },
      { name: 'The Royal Oak Sunday Shootout', location: 'Walsall, West Midlands', winner: 200, fee: 15 }
    ];
    const venue = pubVenues[(week - 1) % pubVenues.length];

    return {
      id: `pub-circuit-w${week}`,
      name: venue.name,
      location: venue.location,
      tier: 'pub',
      category: 'pub',
      entryFee: venue.fee,
      prizePool: {
        winner: venue.winner,
        runnerUp: Math.round(venue.winner * 0.45),
        semiFinalist: Math.round(venue.winner * 0.2),
        quarterFinalist: 0
      },
      rankingPoints: { winner: 25, runnerUp: 15, semiFinalist: 8, quarterFinalist: 2 },
      format: { type: 'legs', bestOfLegs: 3, startingScore: 501 },
      requirements: {
        nonCardHoldersOnly: true,
        description: 'Open to All Non-Tour Card Holders'
      }
    };
  }

  private static getAmateurEventForWeek(week: number): TournamentConfig {
    const amateurVenues = [
      { name: 'Midlands Amateur Classic', location: 'Birmingham', winner: 450, fee: 30 },
      { name: 'West Midlands County Open', location: 'Coventry', winner: 500, fee: 35 },
      { name: 'Heart of England Darts Trophy', location: 'Warwick', winner: 550, fee: 40 },
      { name: 'Mercia Amateur Masters', location: 'Tamworth', winner: 600, fee: 40 },
      { name: 'Staffordshire Darts Championship', location: 'Stafford', winner: 500, fee: 35 },
      { name: 'Central Counties Amateur Shield', location: 'Worcester', winner: 450, fee: 30 }
    ];
    const venue = amateurVenues[(week - 1) % amateurVenues.length];

    return {
      id: `amateur-open-w${week}`,
      name: venue.name,
      location: venue.location,
      tier: 'amateur',
      category: 'amateur',
      entryFee: venue.fee,
      prizePool: {
        winner: venue.winner,
        runnerUp: Math.round(venue.winner * 0.45),
        semiFinalist: Math.round(venue.winner * 0.2),
        quarterFinalist: Math.round(venue.winner * 0.08)
      },
      rankingPoints: { winner: 70, runnerUp: 45, semiFinalist: 25, quarterFinalist: 10 },
      format: { type: 'legs', bestOfLegs: 5, startingScore: 501 },
      requirements: {
        nonCardHoldersOnly: true,
        description: 'Amateur & Semi-Pro Circuit (Non-Card Holders)'
      }
    };
  }
}
