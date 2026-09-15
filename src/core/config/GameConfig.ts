/**
 * Master Game Configuration
 * In accordance with Technical Blueprint Section 71.
 */

export const GAME_CONFIG = {
  version: '1.0.0',
  darts: {
    defaultStartingScore: 501,
    doubleOutRequired: true,
    maxDartsPerVisit: 3,
    bullScore: 25,
    doubleBullScore: 50,
  },
  career: {
    minAge: 16,
    maxAge: 65,
    initialMoney: 250, // Starting pub player savings (£)
    defaultConfidence: 50,
    defaultFatigue: 0,
    defaultForm: 50,
  },
  ratings: {
    min: 0,
    max: 100,
    amateurAverage: 35,
    pubAverage: 45,
    semiProAverage: 60,
    proAverage: 75,
    eliteAverage: 88,
    worldClassAverage: 95
  }
} as const;
