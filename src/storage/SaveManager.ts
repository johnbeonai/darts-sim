import { Player } from '../core/player/Player';
import { CareerManager } from '../core/career/CareerManager';
import { PremierLeagueManager } from '../core/tournament/PremierLeagueManager';

export interface SaveSlotMetadata {
  slotId: number; // 1, 2, 3, 4
  exists: boolean;
  isTwoPlayer?: boolean;
  playerName?: string;
  player2Name?: string;
  age?: number;
  tier?: string;
  bankBalance?: number;
  dateString?: string;
  lastSaved?: string; // ISO string
}

export interface SerializedPlayerData {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  age: number;
  tier: string;
  ranking: number;
  rankingPoints: number;
  prizeMoneyTotal: number;
  bankBalance: number;
  attributes: any;
  state: any;
  equipment: any;
  stats: any;
  ownedEquipmentIds?: string[];
  equippedLoadout?: any;
  activeSponsorships?: any[];
  hiredStaffIds?: string[];
  hasTourCard?: boolean;
  tourCardExpiryYear?: number;
  qSchoolPoints?: number;
  qSchoolFinalQualified?: boolean;
  hasEnteredQSchool?: boolean;
  activeInjuries?: any[];
  injuryHistory?: string[];
  coldTherapyUsesThisMonth?: number;
  lastColdTherapyMonth?: number;
  lastColdTherapyYear?: number;
}

export interface SerializedCareerData {
  version: string;
  slotId: number;
  lastSaved: string;
  isTwoPlayer?: boolean;
  activePlayerIndex?: number;
  player: SerializedPlayerData;
  player2?: SerializedPlayerData;
  players?: SerializedPlayerData[];
  calendar: {
    currentYear: number;
    currentWeek: number;
  };
  weeklyDecisions?: Record<string, any>;
  pendingTournaments?: any[];
  worldAIPlayers?: any[];
  rankings?: any;
  eventLogs: any[];
  trophyAwards?: any[];
  playerAchievements?: Record<string, Record<string, any>>;
  rivalryLedger?: Record<string, Record<string, any>>;
  premierLeague?: any;
  pendingAwardsGala?: any;
  pendingDilemma?: any;
}

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  setItem(key: string, val: string): void { this.map.set(key, val); }
  removeItem(key: string): void { this.map.delete(key); }
  clear(): void { this.map.clear(); }
}

const memoryStore = new MemoryStorage();

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return memoryStore;
}

function serializePlayer(p: Player): SerializedPlayerData {
  const safeStats = { ...p.stats };
  if (safeStats.highestCheckout > 170) {
    safeStats.highestCheckout = 0;
  }
  return {
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
    equipment: { ...p.equipment },
    stats: safeStats,
    ownedEquipmentIds: p.ownedEquipmentIds ? [...p.ownedEquipmentIds] : undefined,
    equippedLoadout: p.equippedLoadout ? { ...p.equippedLoadout } : undefined,
    activeSponsorships: p.activeSponsorships ? p.activeSponsorships.map(s => ({ ...s })) : undefined,
    hiredStaffIds: p.hiredStaffIds ? [...p.hiredStaffIds] : undefined,
    hasTourCard: p.hasTourCard,
    tourCardExpiryYear: p.tourCardExpiryYear,
    qSchoolPoints: p.qSchoolPoints,
    qSchoolFinalQualified: p.qSchoolFinalQualified,
    hasEnteredQSchool: p.hasEnteredQSchool,
    activeInjuries: p.activeInjuries ? p.activeInjuries.map(i => ({ ...i })) : [],
    injuryHistory: p.injuryHistory ? [...p.injuryHistory] : [],
    coldTherapyUsesThisMonth: p.coldTherapyUsesThisMonth,
    lastColdTherapyMonth: p.lastColdTherapyMonth,
    lastColdTherapyYear: p.lastColdTherapyYear
  };
}

function deserializePlayer(d: SerializedPlayerData): Player {
  const p = new Player(
    d.id,
    d.name,
    d.gender,
    d.nationality,
    d.age,
    d.attributes,
    d.state,
    d.equipment
  );
  p.tier = d.tier as any;
  p.ranking = d.ranking;
  p.rankingPoints = d.rankingPoints;
  p.prizeMoneyTotal = d.prizeMoneyTotal;
  p.bankBalance = d.bankBalance;
  if (d.stats) {
    p.stats = { ...d.stats };
    // Data cleansing: in darts, highest checkout is strictly <= 170.
    if (p.stats.highestCheckout > 170) {
      p.stats.highestCheckout = 0;
    }
  }
  if (d.ownedEquipmentIds) {
    p.ownedEquipmentIds = [...d.ownedEquipmentIds];
  }
  if (d.equippedLoadout) {
    p.equippedLoadout = { ...d.equippedLoadout };
  }
  if (d.activeSponsorships) {
    p.activeSponsorships = d.activeSponsorships.map(s => ({ ...s }));
  }
  if (d.hiredStaffIds) {
    p.hiredStaffIds = [...d.hiredStaffIds];
  }
  if (d.hasTourCard !== undefined) {
    p.hasTourCard = d.hasTourCard;
  }
  if (d.tourCardExpiryYear !== undefined) {
    p.tourCardExpiryYear = d.tourCardExpiryYear;
  }
  if (d.qSchoolPoints !== undefined) {
    p.qSchoolPoints = d.qSchoolPoints;
  }
  if (d.qSchoolFinalQualified !== undefined) {
    p.qSchoolFinalQualified = d.qSchoolFinalQualified;
  }
  if (d.hasEnteredQSchool !== undefined) {
    p.hasEnteredQSchool = d.hasEnteredQSchool;
  }
  if (d.activeInjuries && Array.isArray(d.activeInjuries)) {
    p.activeInjuries = d.activeInjuries.map(i => ({ ...i }));
  } else {
    p.activeInjuries = [];
  }
  if (d.injuryHistory && Array.isArray(d.injuryHistory)) {
    p.injuryHistory = [...d.injuryHistory];
  } else {
    p.injuryHistory = [];
  }
  if (d.coldTherapyUsesThisMonth !== undefined) {
    p.coldTherapyUsesThisMonth = d.coldTherapyUsesThisMonth;
  }
  if (d.lastColdTherapyMonth !== undefined) {
    p.lastColdTherapyMonth = d.lastColdTherapyMonth;
  }
  if (d.lastColdTherapyYear !== undefined) {
    p.lastColdTherapyYear = d.lastColdTherapyYear;
  }
  return p;
}

export class SaveManager {
  private static readonly STORAGE_PREFIX = 'darts_career_sim_slot_';

  /**
   * Retrieves summary metadata for all 4 save slots
   */
  public static listSlots(): SaveSlotMetadata[] {
    const slots: SaveSlotMetadata[] = [];

    for (let slotId = 1; slotId <= 4; slotId++) {
      const raw = getStorage().getItem(`${this.STORAGE_PREFIX}${slotId}`);
      if (!raw) {
        slots.push({ slotId, exists: false });
        continue;
      }

      try {
        const data: SerializedCareerData = JSON.parse(raw);
        const is2P = Boolean(data.isTwoPlayer || data.player2 || (data.players && data.players.length > 1));
        const p2Name = data.player2?.name || (data.players && data.players[1]?.name);

        slots.push({
          slotId,
          exists: true,
          isTwoPlayer: is2P,
          playerName: data.player.name,
          player2Name: p2Name,
          age: data.player.age,
          tier: data.player.tier,
          bankBalance: data.player.bankBalance,
          dateString: `Week ${data.calendar.currentWeek}, ${data.calendar.currentYear}`,
          lastSaved: data.lastSaved
        });
      } catch (e) {
        console.error(`Failed to parse save slot ${slotId}`, e);
        slots.push({ slotId, exists: false });
      }
    }

    return slots;
  }

  /**
   * Saves a career into the specified slot (1 - 4)
   */
  public static saveGame(slotId: number, career: CareerManager): void {
    if (slotId < 1 || slotId > 4) {
      throw new Error(`Invalid slot ID: ${slotId}. Must be 1-4.`);
    }

    career.activeSlotId = slotId;
    const p1 = career.players[0] || career.player;
    const p2 = career.isTwoPlayer && career.players.length > 1 ? career.players[1] : undefined;

    const decisionsObj: Record<string, any> = {};
    for (const [pid, dec] of career.weeklyDecisions.entries()) {
      decisionsObj[pid] = dec;
    }

    const data: SerializedCareerData = {
      version: '1.2.0',
      slotId,
      lastSaved: new Date().toISOString(),
      isTwoPlayer: career.isTwoPlayer,
      activePlayerIndex: career.activePlayerIndex,
      player: serializePlayer(p1),
      player2: p2 ? serializePlayer(p2) : undefined,
      players: career.players.map(serializePlayer),
      calendar: {
        currentYear: career.calendar.currentYear,
        currentWeek: career.calendar.currentWeek
      },
      weeklyDecisions: decisionsObj,
      pendingTournaments: career.pendingTournaments.map(pt => ({
        playerId: pt.player.id,
        config: pt.config
      })),
      worldAIPlayers: career.world ? career.world.serialize() : undefined,
      rankings: career.ranking ? career.ranking.serialize() : undefined,
      eventLogs: [...career.eventLogs],
      trophyAwards: career.trophyAwards ? [...career.trophyAwards] : [],
      playerAchievements: career.playerAchievements ? JSON.parse(JSON.stringify(career.playerAchievements)) : {},
      rivalryLedger: career.rivalryLedger ? JSON.parse(JSON.stringify(career.rivalryLedger)) : {},
      premierLeague: career.premierLeague ? career.premierLeague.toJSON() : undefined,
      pendingAwardsGala: career.pendingAwardsGala ? JSON.parse(JSON.stringify(career.pendingAwardsGala)) : undefined,
      pendingDilemma: career.pendingDilemma ? JSON.parse(JSON.stringify(career.pendingDilemma)) : undefined
    };

    getStorage().setItem(`${this.STORAGE_PREFIX}${slotId}`, JSON.stringify(data));
  }

  /**
   * Loads a career from the specified slot (1 - 4)
   */
  public static loadGame(slotId: number): CareerManager | null {
    const raw = getStorage().getItem(`${this.STORAGE_PREFIX}${slotId}`);
    if (!raw) return null;

    try {
      const data: SerializedCareerData = JSON.parse(raw);

      const p1 = deserializePlayer(data.player);
      const players: Player[] = [p1];

      let oldP2Id: string | null = null;
      if (data.isTwoPlayer && (data.player2 || (data.players && data.players.length > 1))) {
        const p2Data = data.player2 || data.players![1];
        const p2 = deserializePlayer(p2Data);
        if (p2.id === p1.id) {
          oldP2Id = p2.id;
          p2.id = `${p1.id}_p2_${Date.now()}`;
        }
        players.push(p2);
      }

      const career = new CareerManager(players);
      career.activeSlotId = slotId;
      career.activePlayerIndex = data.activePlayerIndex || 0;
      career.calendar.currentYear = data.calendar.currentYear;
      career.calendar.currentWeek = data.calendar.currentWeek;
      if (data.eventLogs) career.eventLogs = [...data.eventLogs];
      if (data.trophyAwards && Array.isArray(data.trophyAwards)) {
        career.trophyAwards = [...data.trophyAwards];
      }
      if (data.playerAchievements && typeof data.playerAchievements === 'object') {
        career.playerAchievements = JSON.parse(JSON.stringify(data.playerAchievements));
        if (oldP2Id && players.length > 1 && career.playerAchievements[oldP2Id] && !career.playerAchievements[players[1].id]) {
          career.playerAchievements[players[1].id] = JSON.parse(JSON.stringify(career.playerAchievements[oldP2Id]));
        }
      }
      if (data.rivalryLedger && typeof data.rivalryLedger === 'object') {
        career.rivalryLedger = JSON.parse(JSON.stringify(data.rivalryLedger));
        if (oldP2Id && players.length > 1 && career.rivalryLedger[oldP2Id] && !career.rivalryLedger[players[1].id]) {
          career.rivalryLedger[players[1].id] = JSON.parse(JSON.stringify(career.rivalryLedger[oldP2Id]));
        }
      }
      career.refreshAvailableTournaments();

      if (data.weeklyDecisions) {
        career.weeklyDecisions.clear();
        for (const [pid, dec] of Object.entries(data.weeklyDecisions)) {
          career.weeklyDecisions.set(pid, dec as any);
        }
        // If P2 ID was repaired, ensure P2 has its own decision entry
        if (oldP2Id && players.length > 1 && !career.weeklyDecisions.has(players[1].id)) {
          career.weeklyDecisions.set(players[1].id, { playerId: players[1].id, action: 'pending' });
        }
        for (const p of career.players) {
          if (!career.weeklyDecisions.has(p.id)) {
            career.weeklyDecisions.set(p.id, { playerId: p.id, action: 'pending' });
          }
        }
      }
      if (data.pendingTournaments && Array.isArray(data.pendingTournaments)) {
        career.pendingTournaments = data.pendingTournaments
          .map((pt: any) => {
            const p = players.find(player => player.id === pt.playerId);
            return p ? { player: p, config: pt.config } : null;
          })
          .filter(Boolean) as any;
      }
      if (data.worldAIPlayers && career.world) {
        career.world.deserialize(data.worldAIPlayers);
      }
      if (data.rankings && career.ranking) {
        career.ranking.deserialize(
          data.rankings,
          [...career.world.getAllAIPlayers(), ...career.players],
          career.calendar.currentYear,
          career.calendar.currentWeek
        );
      } else if (career.ranking) {
        career.ranking.recalculateRankings(
          [...career.world.getAllAIPlayers(), ...career.players],
          career.calendar.currentYear,
          career.calendar.currentWeek
        );
      }
      if (career.ranking) {
        career.ranking.markHumanPlayers(career.humanPlayerIds);
      }
      if (data.premierLeague) {
        career.premierLeague = PremierLeagueManager.fromJSON(data.premierLeague);
      }
      if (data.pendingAwardsGala) {
        career.pendingAwardsGala = data.pendingAwardsGala;
      }
      if (data.pendingDilemma) {
        career.pendingDilemma = data.pendingDilemma;
      }

      return career;
    } catch (e) {
      console.error(`Error loading save slot ${slotId}`, e);
      return null;
    }
  }

  /**
   * Deletes a save slot
   */
  public static deleteSlot(slotId: number): boolean {
    if (slotId < 1 || slotId > 4) return false;
    getStorage().removeItem(`${this.STORAGE_PREFIX}${slotId}`);
    return true;
  }

  /**
   * Clears all save slots (1 - 4)
   */
  public static clearAll(): void {
    for (let slotId = 1; slotId <= 4; slotId++) {
      this.deleteSlot(slotId);
    }
  }
}
