import { Player, CareerTier } from '../player/Player';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';
import { PlayerFactory } from '../player/PlayerFactory';

export interface WorldConfig {
  eliteCount: number;
  proCount: number;
  semiProCount: number;
  amateurCount: number;
}

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  eliteCount: 16,
  proCount: 48,
  semiProCount: 64,
  amateurCount: 80
};

const ELITE_PRESETS = [
  { name: 'Lucas "The Prodigy" Little', nationality: 'England', age: 19, archetype: 'raw_talent', prizeMoney: 1250000, points: 1450, scoring: 98, doubling: 92, pressure: 94, stamina: 85 },
  { name: 'Luke "Ice Hand" Humphrey', nationality: 'England', age: 29, archetype: 'heavy_scorer', prizeMoney: 1100000, points: 1380, scoring: 97, doubling: 94, pressure: 95, stamina: 90 },
  { name: 'Maikel "Green Marvel" van Dijk', nationality: 'Netherlands', age: 35, archetype: 'heavy_scorer', prizeMoney: 980000, points: 1250, scoring: 99, doubling: 90, pressure: 92, stamina: 88 },
  { name: 'Gethin "Iron Ice" Pryce', nationality: 'Wales', age: 39, archetype: 'steady_grinder', prizeMoney: 850000, points: 1100, scoring: 95, doubling: 93, pressure: 96, stamina: 92 },
  { name: 'Peter "Viper" Wright', nationality: 'Scotland', age: 54, archetype: 'clinical_finisher', prizeMoney: 780000, points: 1020, scoring: 94, doubling: 96, pressure: 91, stamina: 80 },
  { name: 'Mickey "Bulldog" Smith', nationality: 'England', age: 33, archetype: 'heavy_scorer', prizeMoney: 720000, points: 950, scoring: 97, doubling: 88, pressure: 89, stamina: 86 },
  { name: 'Nathan "The Cobra" Aspell', nationality: 'England', age: 32, archetype: 'steady_grinder', prizeMoney: 640000, points: 870, scoring: 93, doubling: 91, pressure: 95, stamina: 90 },
  { name: 'Robert "High Voltage" Cross', nationality: 'England', age: 34, archetype: 'balanced', prizeMoney: 590000, points: 820, scoring: 94, doubling: 92, pressure: 93, stamina: 85 },
  { name: 'Jonathan "The Terrier" Cleaton', nationality: 'Wales', age: 49, archetype: 'clinical_finisher', prizeMoney: 540000, points: 760, scoring: 92, doubling: 97, pressure: 94, stamina: 82 },
  { name: 'David "Dizzy" Chappell', nationality: 'England', age: 43, archetype: 'heavy_scorer', prizeMoney: 490000, points: 710, scoring: 96, doubling: 87, pressure: 88, stamina: 84 },
  { name: 'Dimitri "The Dancer" Vandevelde', nationality: 'Belgium', age: 30, archetype: 'clinical_finisher', prizeMoney: 460000, points: 680, scoring: 91, doubling: 95, pressure: 92, stamina: 88 },
  { name: 'Dan "Flying Dutchman" Nopper', nationality: 'Netherlands', age: 33, archetype: 'steady_grinder', prizeMoney: 420000, points: 630, scoring: 92, doubling: 93, pressure: 91, stamina: 86 },
  { name: 'James "The Clockwork" Wayne', nationality: 'England', age: 41, archetype: 'clinical_finisher', prizeMoney: 390000, points: 590, scoring: 90, doubling: 98, pressure: 96, stamina: 83 },
  { name: 'Joe "The Rocker" Collins', nationality: 'England', age: 35, archetype: 'heavy_scorer', prizeMoney: 360000, points: 550, scoring: 95, doubling: 89, pressure: 87, stamina: 85 },
  { name: 'Dirk "The Volcano" van Breda', nationality: 'Netherlands', age: 32, archetype: 'heavy_scorer', prizeMoney: 330000, points: 520, scoring: 96, doubling: 86, pressure: 86, stamina: 89 },
  { name: 'Gary "Flying Scotsman" Henderson', nationality: 'Scotland', age: 55, archetype: 'heavy_scorer', prizeMoney: 310000, points: 490, scoring: 96, doubling: 91, pressure: 93, stamina: 78 }
];

const FIRST_NAMES = [
  'Jack', 'Callum', 'Oliver', 'Harry', 'George', 'Charlie', 'Thomas', 'James',
  'William', 'Liam', 'Mason', 'Ethan', 'Alexander', 'Noah', 'Leo', 'Lucas',
  'Arthur', 'Archie', 'Oscar', 'Henry', 'Freddie', 'Alfie', 'Theo', 'Isaac',
  'Lars', 'Sven', 'Jens', 'Florian', 'Maximilian', 'Nico', 'Jannik', 'Tim',
  'Kobe', 'Wouter', 'Kevin', 'Jelle', 'Milan', 'Damon', 'Simon', 'Corey'
];

const SURNAMES = [
  'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies',
  'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green',
  'Hall', 'Thomas', 'Clarke', 'Jackson', 'Wood', 'Harris', 'Edwards', 'Turner',
  'van den Berg', 'de Jong', 'Jansen', 'Bakker', 'Visser', 'Smit', 'Meijer',
  'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Bauer'
];

const NATIONALITIES = [
  'England', 'England', 'England', 'England', 'Netherlands', 'Netherlands',
  'Scotland', 'Wales', 'Germany', 'Germany', 'Belgium', 'Ireland',
  'Northern Ireland', 'Australia', 'Austria', 'Poland'
];

export class WorldManager {
  private aiPlayers: Map<string, Player> = new Map();

  constructor(
    private rng: IRandomProvider = new DefaultRandomProvider(),
    config: WorldConfig = DEFAULT_WORLD_CONFIG
  ) {
    this.generateWorld(config);
  }

  /**
   * Generates full initial world population (200+ players)
   */
  public generateWorld(config: WorldConfig = DEFAULT_WORLD_CONFIG): void {
    this.aiPlayers.clear();
    const factory = new PlayerFactory(this.rng);

    // 1. Elite Tier (Top 16)
    ELITE_PRESETS.slice(0, config.eliteCount).forEach((preset, idx) => {
      const id = `ai-elite-${idx + 1}`;
      const player = new Player(id, preset.name, 'male', preset.nationality, preset.age, {
        scoring: preset.scoring,
        doubling: preset.doubling,
        consistency: Math.round((preset.scoring + preset.doubling) / 2),
        pressure: preset.pressure,
        stamina: preset.stamina,
        potential: Math.min(100, preset.scoring + 5),
        workEthic: 85,
        professionalism: 90
      });
      player.tier = 'elite';
      player.hasTourCard = true;
      player.tourCardExpiryYear = 2027;
      player.prizeMoneyTotal = preset.prizeMoney;
      player.rankingPoints = preset.points;
      player.bankBalance = Math.round(preset.prizeMoney * 0.4);
      player.state.confidence = 75 + Math.round(this.rng.next() * 20);
      player.state.form = 70 + Math.round(this.rng.next() * 25);
      this.aiPlayers.set(id, player);
    });

    // 2. Pro Tier (48 players)
    for (let i = 1; i <= config.proCount; i++) {
      const id = `ai-pro-${i}`;
      const name = this.generateRandomName();
      const nat = this.pickRandom(NATIONALITIES);
      const age = 22 + Math.floor(this.rng.next() * 26);
      const baseRating = 72 + Math.floor(this.rng.next() * 13); // 72 - 84
      const prize = 45000 + Math.floor(this.rng.next() * 160000);
      const points = 80 + Math.floor(this.rng.next() * 200);

      const p = new Player(id, name, 'male', nat, age, {
        scoring: baseRating + Math.floor(this.rng.next() * 8) - 4,
        doubling: baseRating + Math.floor(this.rng.next() * 8) - 4,
        consistency: baseRating,
        pressure: baseRating - 2 + Math.floor(this.rng.next() * 6),
        stamina: 70 + Math.floor(this.rng.next() * 20)
      });
      p.tier = 'pro';
      p.hasTourCard = true;
      p.tourCardExpiryYear = 2027;
      p.prizeMoneyTotal = prize;
      p.rankingPoints = points;
      p.bankBalance = Math.round(prize * 0.25);
      p.state.confidence = 55 + Math.floor(this.rng.next() * 30);
      p.state.form = 50 + Math.floor(this.rng.next() * 35);
      this.aiPlayers.set(id, p);
    }

    // 3. Semi-Pro Tier (64 players)
    for (let i = 1; i <= config.semiProCount; i++) {
      const id = `ai-semipro-${i}`;
      const name = this.generateRandomName();
      const nat = this.pickRandom(NATIONALITIES);
      const age = 20 + Math.floor(this.rng.next() * 30);
      const baseRating = 60 + Math.floor(this.rng.next() * 12); // 60 - 71
      const prize = 6000 + Math.floor(this.rng.next() * 35000);
      const points = 20 + Math.floor(this.rng.next() * 60);

      const p = new Player(id, name, 'male', nat, age, {
        scoring: baseRating + Math.floor(this.rng.next() * 6) - 3,
        doubling: baseRating + Math.floor(this.rng.next() * 6) - 3,
        consistency: baseRating - 2,
        pressure: baseRating - 3,
        stamina: 65 + Math.floor(this.rng.next() * 20)
      });
      p.tier = 'semi_pro';
      p.prizeMoneyTotal = prize;
      p.rankingPoints = points;
      p.bankBalance = Math.round(prize * 0.2);
      p.state.confidence = 50 + Math.floor(this.rng.next() * 30);
      p.state.form = 45 + Math.floor(this.rng.next() * 40);
      this.aiPlayers.set(id, p);
    }

    // 4. Amateur / Pub Tier (80 players)
    for (let i = 1; i <= config.amateurCount; i++) {
      const id = `ai-amateur-${i}`;
      const name = this.generateRandomName();
      const nat = this.pickRandom(NATIONALITIES);
      const age = 18 + Math.floor(this.rng.next() * 38);
      const baseRating = 38 + Math.floor(this.rng.next() * 22); // 38 - 59
      const prize = Math.floor(this.rng.next() * 4500);
      const points = Math.floor(this.rng.next() * 20);

      const p = new Player(id, name, 'male', nat, age, {
        scoring: baseRating + Math.floor(this.rng.next() * 6) - 3,
        doubling: baseRating + Math.floor(this.rng.next() * 6) - 3,
        consistency: baseRating - 4,
        pressure: baseRating - 5,
        stamina: 55 + Math.floor(this.rng.next() * 25)
      });
      p.tier = 'amateur';
      p.prizeMoneyTotal = prize;
      p.rankingPoints = points;
      p.bankBalance = 200 + Math.floor(this.rng.next() * 800);
      p.state.confidence = 40 + Math.floor(this.rng.next() * 35);
      p.state.form = 40 + Math.floor(this.rng.next() * 35);
      this.aiPlayers.set(id, p);
    }
  }

  public getPlayerById(id: string): Player | undefined {
    return this.aiPlayers.get(id);
  }

  public getAllAIPlayers(): Player[] {
    return Array.from(this.aiPlayers.values());
  }

  public getPlayersByTier(tier: CareerTier): Player[] {
    return Array.from(this.aiPlayers.values()).filter(p => p.tier === tier);
  }

  /**
   * Selects persistent opponents for a tournament tier, ensuring realistic rivalries
   */
  public getOpponentsForTier(tier: CareerTier, count: number, excludeIds: string[] = []): Player[] {
    const normalizedTier = tier === 'pub' ? 'amateur' : tier;
    let pool = this.getPlayersByTier(normalizedTier).filter(p => !excludeIds.includes(p.id));

    // Fallback to adjacent tiers if pool is too small
    if (pool.length < count) {
      pool = Array.from(this.aiPlayers.values()).filter(p => !excludeIds.includes(p.id));
    }

    const shuffled = [...pool].sort(() => this.rng.next() - 0.5);
    return shuffled.slice(0, count);
  }

  public get totalPopulation(): number {
    return this.aiPlayers.size;
  }

  private generateRandomName(): string {
    const f = this.pickRandom(FIRST_NAMES);
    const s = this.pickRandom(SURNAMES);
    return `${f} ${s}`;
  }

  private pickRandom<T>(arr: T[]): T {
    const idx = Math.floor(this.rng.next() * arr.length);
    return arr[idx];
  }

  /**
   * Serializes the entire persistent AI population
   */
  public serialize(): any[] {
    const list: any[] = [];
    for (const p of this.aiPlayers.values()) {
      list.push({
        id: p.id,
        name: p.name,
        gender: p.gender,
        nationality: p.nationality,
        age: p.age,
        tier: p.tier,
        ranking: p.ranking,
        rankingPoints: p.rankingPoints,
        prizeMoneyTotal: p.prizeMoneyTotal,
        bankBalance: p.bankBalance,
        attributes: { ...p.attributes },
        state: { ...p.state },
        stats: { ...p.stats }
      });
    }
    return list;
  }

  /**
   * Restores persistent AI population from save data
   */
  public deserialize(data: any[]): void {
    if (!Array.isArray(data) || data.length === 0) return;
    this.aiPlayers.clear();

    for (const d of data) {
      const p = new Player(
        d.id,
        d.name,
        d.gender ?? 'male',
        d.nationality,
        d.age,
        d.attributes,
        d.state
      );
      p.tier = d.tier;
      p.ranking = d.ranking;
      p.rankingPoints = d.rankingPoints;
      p.prizeMoneyTotal = d.prizeMoneyTotal;
      p.bankBalance = d.bankBalance;
      if (d.stats) p.stats = { ...d.stats };
      this.aiPlayers.set(p.id, p);
    }
  }
}
