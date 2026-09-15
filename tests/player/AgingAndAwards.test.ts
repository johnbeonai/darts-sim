import { describe, it, expect } from 'vitest';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';
import { AgingManager } from '../../src/core/player/AgingManager';
import { PdcAwardsManager } from '../../src/core/career/PdcAwardsManager';
import { CareerManager } from '../../src/core/career/CareerManager';

describe('AgingManager: Natural Player Development Curve', () => {
  const factory = new PlayerFactory();

  it('should develop scoring and stamina for young prodigies (age <= 25)', () => {
    const youngPlayer = factory.createPlayer({
      name: 'Luke The Wonderkid',
      gender: 'male',
      nationality: 'England',
      age: 18,
      archetype: 'heavy_scorer'
    });
    youngPlayer.attributes.scoring = 60;
    youngPlayer.attributes.potential = 90;
    youngPlayer.attributes.stamina = 55;

    const res = AgingManager.processAnnualAging(youngPlayer);

    expect(res.newAge).toBe(19);
    expect(youngPlayer.attributes.scoring).toBeGreaterThan(60);
    expect(res.statDeltas.scoring).toBeGreaterThanOrEqual(1);
  });

  it('should boost clutch composure for veterans (age 39 - 48)', () => {
    const veteran = factory.createPlayer({
      name: 'Gary The Craftsman',
      gender: 'male',
      nationality: 'Scotland',
      age: 41,
      archetype: 'clinical_finisher'
    });
    veteran.attributes.pressure = 70;

    const res = AgingManager.processAnnualAging(veteran);

    expect(res.newAge).toBe(42);
    expect(veteran.attributes.pressure).toBeGreaterThanOrEqual(71);
    expect(res.statDeltas.pressure).toBeGreaterThanOrEqual(1);
  });

  it('should reduce stamina for senior legends (age 49+)', () => {
    const senior = factory.createPlayer({
      name: 'Dennis The Legend',
      gender: 'male',
      nationality: 'England',
      age: 55,
      archetype: 'steady_grinder'
    });
    senior.attributes.stamina = 65;

    const res = AgingManager.processAnnualAging(senior);

    expect(res.newAge).toBe(56);
    expect(senior.attributes.stamina).toBeLessThan(65);
  });

  it('should retire senior AI players and spawn dynamic young successors', () => {
    const oldVeteran = factory.createPlayer({
      name: 'Old Veteran',
      gender: 'male',
      nationality: 'England',
      age: 70,
      archetype: 'steady_grinder'
    });
    oldVeteran.ranking = 110; // Low rank accelerates retirement

    const shouldRetire = AgingManager.shouldAIRetire(oldVeteran);
    expect(shouldRetire).toBe(true);

    const rookie = AgingManager.spawnYoungRookie(oldVeteran);
    expect(rookie.age).toBeLessThanOrEqual(21);
    expect(rookie.nationality).toBe(oldVeteran.nationality);
    expect(rookie.name).toBeDefined();
  });
});

describe('PdcAwardsManager: Annual Honours Gala', () => {
  const factory = new PlayerFactory();

  it('should correctly award Player of the Year, Young Player, and Rookie of the Year', () => {
    const worldNo1 = factory.createPlayer({ name: 'Michael Smith', gender: 'male', nationality: 'England', age: 34 });
    worldNo1.ranking = 1;
    worldNo1.prizeMoneyTotal = 600000;
    worldNo1.attributes.scoring = 95;

    const youngGun = factory.createPlayer({ name: 'Josh Rock', gender: 'male', nationality: 'Northern Ireland', age: 23 });
    youngGun.ranking = 8;
    youngGun.prizeMoneyTotal = 250000;
    youngGun.attributes.scoring = 80;

    const rookie = factory.createPlayer({ name: 'Wessel Nijman', gender: 'male', nationality: 'Netherlands', age: 24 });
    rookie.hasTourCard = true;
    rookie.ranking = 35;
    rookie.prizeMoneyTotal = 110000;
    rookie.attributes.scoring = 75;

    const players = [worldNo1, youngGun, rookie];
    const gala = PdcAwardsManager.evaluateSeasonAwards(players, [youngGun.id], 2026);

    expect(gala.year).toBe(2026);
    expect(gala.awards).toHaveLength(4);

    const poty = gala.awards.find(a => a.id === 'player_of_the_year');
    expect(poty?.winnerPlayerName).toBe('Michael Smith');

    const ypoty = gala.awards.find(a => a.id === 'young_player_of_the_year');
    expect(ypoty?.winnerPlayerName).toBe('Josh Rock');
    expect(ypoty?.isHuman).toBe(true);

    const roty = gala.awards.find(a => a.id === 'rookie_of_the_year');
    expect(roty?.winnerPlayerName).toBe('Wessel Nijman');

    expect(gala.humanAwardsCount).toBe(1);
  });
});

describe('CareerManager: Season Transition & Tour Card Retention / Relegation', () => {
  const factory = new PlayerFactory();

  it('should retain tour card for Top 64 players and renew for upcoming season', () => {
    const player = factory.createPlayer({ name: 'Top Player', gender: 'male', nationality: 'England', age: 25 });
    player.hasTourCard = true;
    player.tourCardExpiryYear = 2026; // Expiring at end of 2026

    const career = new CareerManager(player);
    player.ranking = 12; // Safely in Top 64
    player.prizeMoneyTotal = 400000;
    career.calendar.currentWeek = 52;
    career.calendar.currentYear = 2026;

    // Advance into new season (Week 52 -> Week 1 of 2027)
    career.advanceWeek();

    expect(career.calendar.currentWeek).toBe(1);
    expect(career.calendar.currentYear).toBe(2027);
    expect(player.age).toBe(26);

    // Tour card retained and renewed through 2027
    expect(player.hasTourCard).toBe(true);
    expect(player.tourCardExpiryYear).toBe(2027);

    // Awards Gala generated
    expect(career.pendingAwardsGala).not.toBeNull();
    expect(career.pendingAwardsGala?.year).toBe(2026);
  });

  it('should revoke tour card for players finishing outside Top 64', () => {
    const relegatedPlayer = factory.createPlayer({ name: 'Struggling Pro', gender: 'male', nationality: 'England', age: 29 });
    relegatedPlayer.hasTourCard = true;
    relegatedPlayer.tourCardExpiryYear = 2026; // Expiring at end of 2026

    const career = new CareerManager(relegatedPlayer);
    relegatedPlayer.ranking = 85; // Outside Top 64!
    relegatedPlayer.prizeMoneyTotal = 5000;
    career.calendar.currentWeek = 52;
    career.calendar.currentYear = 2026;

    // Advance into new season
    career.advanceWeek();

    expect(career.calendar.currentWeek).toBe(1);
    expect(career.calendar.currentYear).toBe(2027);

    // Tour card revoked!
    expect(relegatedPlayer.hasTourCard).toBe(false);
    expect(relegatedPlayer.tourCardExpiryYear).toBeUndefined();
  });
});
