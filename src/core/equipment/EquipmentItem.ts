/**
 * Equipment Model & Catalog
 * Implements Section 32, 65 & Phase 10 of the Master Technical Blueprint.
 */

import { CareerTier } from '../player/Player';

export type EquipmentCategory = 'barrel' | 'shaft' | 'flight' | 'complete_set';

export type GripType = 'smooth' | 'ringed' | 'shark_fin' | 'micro_grip' | 'scalloped';
export type BarrelMaterial = 'brass' | 'tungsten_80' | 'tungsten_90' | 'tungsten_95';
export type BarrelProfile = 'straight' | 'bomb' | 'torpedo' | 'scallop';

export type ShaftLength = 'short' | 'in_between' | 'medium';
export type ShaftMaterial = 'nylon' | 'aluminium' | 'carbon_composite' | 'titanium';

export type FlightShape = 'standard' | 'kite' | 'pear' | 'slim';
export type FlightType = 'foldable_100' | 'hardened_150' | 'molded_integrated';

export interface EquipmentModifiers {
  scoringModifier: number;      // Scales treble accuracy (e.g. 0.95 - 1.08)
  doublingModifier: number;     // Scales outer ring double accuracy (e.g. 0.95 - 1.07)
  consistencyModifier: number;  // Scales grouping scatter tightness (e.g. 0.95 - 1.08)
  fatigueModifier: number;      // Scales match fatigue accrual rate (e.g. 0.90 - 1.10)
}

export interface EquipmentItem {
  id: string;
  name: string;
  brand: string;
  category: EquipmentCategory;
  price: number;
  tierRequired: CareerTier;
  description: string;
  weightGrams: number;
  modifiers: EquipmentModifiers;

  // Specific properties
  gripType?: GripType;
  barrelMaterial?: BarrelMaterial;
  barrelProfile?: BarrelProfile;
  shaftLength?: ShaftLength;
  shaftMaterial?: ShaftMaterial;
  flightShape?: FlightShape;
  flightType?: FlightType;

  // Visual Customization Properties
  visualFinish?: string;
  visualColor?: string;
  flightDesign?: string;
  pointStyle?: 'silver_steel' | 'black_laser' | 'gold_ringed';
}

export interface EquippedLoadout {
  completeSetId?: string;
  barrelId: string;
  shaftId: string;
  flightId: string;
  totalWeightGrams: number;
  modifiers: EquipmentModifiers;
}

export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  // ==================== COMPLETE SETS ====================
  {
    id: 'set-brass-starter',
    name: 'Pub Starter Brass 22g',
    brand: 'Red Lion Basics',
    category: 'complete_set',
    price: 0,
    tierRequired: 'pub',
    weightGrams: 22,
    barrelMaterial: 'brass',
    barrelProfile: 'straight',
    gripType: 'ringed',
    shaftLength: 'medium',
    shaftMaterial: 'nylon',
    flightShape: 'standard',
    flightType: 'foldable_100',
    visualFinish: 'Polished Brass',
    visualColor: '#d4af37',
    pointStyle: 'silver_steel',
    flightDesign: 'classic_solid',
    description: 'Entry-level brass darts with nylon stems and standard flights. Reliable entry setup.',
    modifiers: {
      scoringModifier: 1.0,
      doublingModifier: 1.0,
      consistencyModifier: 1.0,
      fatigueModifier: 1.0
    }
  },
  {
    id: 'set-red-lion-special',
    name: 'The Red Lion Tavern Special 24g',
    brand: 'Red Lion Basics',
    category: 'complete_set',
    price: 45,
    tierRequired: 'pub',
    weightGrams: 24,
    barrelMaterial: 'tungsten_80',
    barrelProfile: 'bomb',
    gripType: 'ringed',
    shaftLength: 'in_between',
    shaftMaterial: 'aluminium',
    flightShape: 'standard',
    flightType: 'foldable_100',
    visualFinish: 'Brushed Nickel & Silver',
    visualColor: '#94a3b8',
    pointStyle: 'silver_steel',
    flightDesign: 'flame_burst',
    description: 'Heavy 80% tungsten pub circuit special. Slightly heavier nose for solid treble grouping.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 0.99,
      consistencyModifier: 1.02,
      fatigueModifier: 1.02
    }
  },
  {
    id: 'set-county-master-23',
    name: 'County Master 23g Pro Set',
    brand: 'ArrowCraft UK',
    category: 'complete_set',
    price: 110,
    tierRequired: 'amateur',
    weightGrams: 23,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'straight',
    gripType: 'shark_fin',
    shaftLength: 'medium',
    shaftMaterial: 'carbon_composite',
    flightShape: 'kite',
    flightType: 'hardened_150',
    visualFinish: 'Silver Chrome',
    visualColor: '#e2e8f0',
    pointStyle: 'black_laser',
    flightDesign: 'union_jack',
    description: 'Precision 90% tungsten parallel barrels paired with carbon stems. Excellent all-around balance.',
    modifiers: {
      scoringModifier: 1.04,
      doublingModifier: 1.03,
      consistencyModifier: 1.04,
      fatigueModifier: 0.98
    }
  },
  {
    id: 'set-apex-predator-24',
    name: 'Apex Predator 24g Tour Edition',
    brand: 'Targetforce Global',
    category: 'complete_set',
    price: 240,
    tierRequired: 'semi_pro',
    weightGrams: 24,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'torpedo',
    gripType: 'micro_grip',
    shaftLength: 'in_between',
    shaftMaterial: 'carbon_composite',
    flightShape: 'slim',
    flightType: 'molded_integrated',
    visualFinish: 'Onyx Stealth Nitride',
    visualColor: '#1e293b',
    pointStyle: 'black_laser',
    flightDesign: 'stealth_carbon',
    description: '95% high-density tungsten with integrated molded flight systems. Clinical precision at the oche.',
    modifiers: {
      scoringModifier: 1.06,
      doublingModifier: 1.05,
      consistencyModifier: 1.06,
      fatigueModifier: 0.96
    }
  },
  {
    id: 'set-world-champion-22',
    name: 'The Maestro World Champion 22g',
    brand: 'WinCraft Pro',
    category: 'complete_set',
    price: 395,
    tierRequired: 'pro',
    weightGrams: 22,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'straight',
    gripType: 'micro_grip',
    shaftLength: 'medium',
    shaftMaterial: 'titanium',
    flightShape: 'standard',
    flightType: 'molded_integrated',
    visualFinish: 'Rainbow PVD Gold Sheen',
    visualColor: '#f59e0b',
    pointStyle: 'gold_ringed',
    flightDesign: 'golden_wings',
    description: 'World title-winning signature setup with micro-milled razor grip and titanium carbon stems.',
    modifiers: {
      scoringModifier: 1.08,
      doublingModifier: 1.07,
      consistencyModifier: 1.08,
      fatigueModifier: 0.93
    }
  },

  // ==================== BARRELS ====================
  {
    id: 'barrel-brass-22',
    name: 'Standard Brass Barrels 22g',
    brand: 'Red Lion Basics',
    category: 'barrel',
    price: 15,
    tierRequired: 'pub',
    weightGrams: 22,
    barrelMaterial: 'brass',
    barrelProfile: 'straight',
    gripType: 'ringed',
    visualFinish: 'Natural Brass',
    visualColor: '#d4af37',
    pointStyle: 'silver_steel',
    description: 'Wide-diameter brass barrels. Comfortable grip for developing throw rhythm.',
    modifiers: {
      scoringModifier: 1.0,
      doublingModifier: 1.0,
      consistencyModifier: 1.0,
      fatigueModifier: 1.0
    }
  },
  {
    id: 'barrel-tungsten-80-24',
    name: 'Silver Ringed 80% Tungsten 24g',
    brand: 'Red Lion Basics',
    category: 'barrel',
    price: 55,
    tierRequired: 'pub',
    weightGrams: 24,
    barrelMaterial: 'tungsten_80',
    barrelProfile: 'straight',
    gripType: 'ringed',
    visualFinish: 'Brushed Silver',
    visualColor: '#94a3b8',
    pointStyle: 'silver_steel',
    description: 'Slimmer than brass, allowing tighter treble clustering with dependable mechanical ring grip.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 1.01,
      consistencyModifier: 1.02,
      fatigueModifier: 1.01
    }
  },
  {
    id: 'barrel-oche-sniper-90-23',
    name: 'Oche Sniper 90% Tungsten 23g',
    brand: 'ArrowCraft UK',
    category: 'barrel',
    price: 95,
    tierRequired: 'amateur',
    weightGrams: 23,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'straight',
    gripType: 'shark_fin',
    visualFinish: 'Chrome Titanium',
    visualColor: '#e2e8f0',
    pointStyle: 'black_laser',
    description: 'Aggressive shark-fin cuts provide relentless finger traction and pinpoint release control.',
    modifiers: {
      scoringModifier: 1.04,
      doublingModifier: 1.03,
      consistencyModifier: 1.04,
      fatigueModifier: 0.99
    }
  },
  {
    id: 'barrel-valkyrie-90-25',
    name: 'Valkyrie Torpedo 90% Tungsten 25g',
    brand: 'ArrowCraft UK',
    category: 'barrel',
    price: 125,
    tierRequired: 'amateur',
    weightGrams: 25,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'torpedo',
    gripType: 'shark_fin',
    visualFinish: 'Crimson Anodised',
    visualColor: '#dc2626',
    pointStyle: 'black_laser',
    description: 'Front-weighted torpedo profile finished in vivid crimson. Aggressive shark-fin rear provides supreme forward propulsion.',
    modifiers: {
      scoringModifier: 1.05,
      doublingModifier: 1.02,
      consistencyModifier: 1.04,
      fatigueModifier: 1.01
    }
  },
  {
    id: 'barrel-heavy-bomber-95-26',
    name: 'Heavy Bomber 95% Tungsten 26g',
    brand: 'Targetforce Global',
    category: 'barrel',
    price: 135,
    tierRequired: 'semi_pro',
    weightGrams: 26,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'bomb',
    gripType: 'scalloped',
    visualFinish: 'Gunmetal Matte',
    visualColor: '#334155',
    pointStyle: 'black_laser',
    description: 'Front-weighted torpedo bomb profile. Punches into the treble bed with unstoppable momentum.',
    modifiers: {
      scoringModifier: 1.07,
      doublingModifier: 0.99,
      consistencyModifier: 1.05,
      fatigueModifier: 1.06
    }
  },
  {
    id: 'barrel-surgical-scalpel-95-21',
    name: 'The Surgical Scalpel 95% Tungsten 21g',
    brand: 'WinCraft Pro',
    category: 'barrel',
    price: 155,
    tierRequired: 'semi_pro',
    weightGrams: 21,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'straight',
    gripType: 'micro_grip',
    visualFinish: 'Ice Blue Nitride',
    visualColor: '#0ea5e9',
    pointStyle: 'silver_steel',
    description: 'Ultra-thin pencil profile. Leaves maximum target space on narrow doubles and wire finishes.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 1.06,
      consistencyModifier: 1.05,
      fatigueModifier: 0.94
    }
  },
  {
    id: 'barrel-phantom-assassin-95-22',
    name: 'Phantom Assassin 95% Tungsten 22g',
    brand: 'Targetforce Global',
    category: 'barrel',
    price: 185,
    tierRequired: 'semi_pro',
    weightGrams: 22,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'scallop',
    gripType: 'micro_grip',
    visualFinish: 'Midnight Onyx & Gold',
    visualColor: '#18181b',
    pointStyle: 'gold_ringed',
    description: 'Dual-scallop contour carved from 95% tungsten. Midnight black coating with hand-polished 24K gold ring accents.',
    modifiers: {
      scoringModifier: 1.06,
      doublingModifier: 1.05,
      consistencyModifier: 1.06,
      fatigueModifier: 0.95
    }
  },
  {
    id: 'barrel-world-master-95-24',
    name: 'World Master 95% Machined Micro-Grip 24g',
    brand: 'WinCraft Pro',
    category: 'barrel',
    price: 220,
    tierRequired: 'pro',
    weightGrams: 24,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'straight',
    gripType: 'micro_grip',
    visualFinish: 'Rainbow Spectrum PVD',
    visualColor: '#a855f7',
    pointStyle: 'gold_ringed',
    description: 'Elite tour-grade engineering. Nanotech dual-axis coating gives supreme release consistency.',
    modifiers: {
      scoringModifier: 1.07,
      doublingModifier: 1.06,
      consistencyModifier: 1.07,
      fatigueModifier: 0.95
    }
  },

  // ==================== SHAFTS / STEMS ====================
  {
    id: 'shaft-nylon-medium',
    name: 'Durable Nylon Stems (Medium)',
    brand: 'Red Lion Basics',
    category: 'shaft',
    price: 5,
    tierRequired: 'pub',
    weightGrams: 1.2,
    shaftLength: 'medium',
    shaftMaterial: 'nylon',
    visualFinish: 'Jet Black Nylon',
    visualColor: '#18181b',
    description: 'Standard resilient nylon shafts with spring rings. Reliable flight retention.',
    modifiers: {
      scoringModifier: 1.0,
      doublingModifier: 1.0,
      consistencyModifier: 1.0,
      fatigueModifier: 1.0
    }
  },
  {
    id: 'shaft-nylon-translucent-red',
    name: 'Translucent Crystal Stems (In-Between)',
    brand: 'Red Lion Basics',
    category: 'shaft',
    price: 8,
    tierRequired: 'pub',
    weightGrams: 1.1,
    shaftLength: 'in_between',
    shaftMaterial: 'nylon',
    visualFinish: 'Translucent Crimson',
    visualColor: '#ef4444',
    description: 'Eye-catching translucent red high-impact polycarbonate. Delivers clean mid-length stability.',
    modifiers: {
      scoringModifier: 1.01,
      doublingModifier: 1.0,
      consistencyModifier: 1.0,
      fatigueModifier: 1.0
    }
  },
  {
    id: 'shaft-aluminium-short',
    name: 'Anodised Aluminium Stems (Short)',
    brand: 'ArrowCraft UK',
    category: 'shaft',
    price: 15,
    tierRequired: 'pub',
    weightGrams: 1.4,
    shaftLength: 'short',
    shaftMaterial: 'aluminium',
    visualFinish: 'Electric Blue Anodised',
    visualColor: '#2563eb',
    description: 'Short stems create a steeper angle of entry into the board, leaving the bed open underneath.',
    modifiers: {
      scoringModifier: 1.02,
      doublingModifier: 1.0,
      consistencyModifier: 1.01,
      fatigueModifier: 1.0
    }
  },
  {
    id: 'shaft-carbon-medium',
    name: 'Pro Carbon Fiber Stems (Medium)',
    brand: 'Targetforce Global',
    category: 'shaft',
    price: 32,
    tierRequired: 'amateur',
    weightGrams: 0.9,
    shaftLength: 'medium',
    shaftMaterial: 'carbon_composite',
    visualFinish: 'Woven Carbon Fiber',
    visualColor: '#27272a',
    description: 'Featherweight composite structure eliminates shaft flex and dampens in-flight vibration.',
    modifiers: {
      scoringModifier: 1.02,
      doublingModifier: 1.02,
      consistencyModifier: 1.03,
      fatigueModifier: 0.97
    }
  },
  {
    id: 'shaft-carbon-short',
    name: 'Micro Carbon Stems (Short)',
    brand: 'Targetforce Global',
    category: 'shaft',
    price: 42,
    tierRequired: 'semi_pro',
    weightGrams: 0.8,
    shaftLength: 'short',
    shaftMaterial: 'carbon_composite',
    visualFinish: 'Stealth Matte Carbon Matrix',
    visualColor: '#09090b',
    description: 'Ultra-rigid short carbon fiber stems. Steeper angle of entry leaves the maximum target zone open.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 1.01,
      consistencyModifier: 1.03,
      fatigueModifier: 0.96
    }
  },
  {
    id: 'shaft-titanium-spinning',
    name: 'Titanium Spinning Stems (In-Between)',
    brand: 'WinCraft Pro',
    category: 'shaft',
    price: 55,
    tierRequired: 'semi_pro',
    weightGrams: 1.1,
    shaftLength: 'in_between',
    shaftMaterial: 'titanium',
    visualFinish: 'Machined Titanium & Gold',
    visualColor: '#d97706',
    description: '360° rotating tops rotate smoothly on incoming dart impact to prevent deflections.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 1.02,
      consistencyModifier: 1.04,
      fatigueModifier: 0.96
    }
  },

  // ==================== FLIGHTS ====================
  {
    id: 'flight-standard-100',
    name: 'Core 100 Micron Flights (Standard)',
    brand: 'Red Lion Basics',
    category: 'flight',
    price: 4,
    tierRequired: 'pub',
    weightGrams: 0.6,
    flightShape: 'standard',
    flightType: 'foldable_100',
    visualFinish: 'Royal Blue',
    visualColor: '#3b82f6',
    flightDesign: 'classic_solid',
    description: 'Classic No. 2 standard shape offering maximum lift and flight stability across all distances.',
    modifiers: {
      scoringModifier: 1.0,
      doublingModifier: 1.0,
      consistencyModifier: 1.0,
      fatigueModifier: 1.0
    }
  },
  {
    id: 'flight-hardened-150-kite',
    name: 'Hardened 150 Micron Flights (Kite)',
    brand: 'ArrowCraft UK',
    category: 'flight',
    price: 9,
    tierRequired: 'pub',
    weightGrams: 0.7,
    flightShape: 'kite',
    flightType: 'hardened_150',
    visualFinish: 'Union Jack Red/White/Blue',
    visualColor: '#dc2626',
    flightDesign: 'union_jack',
    description: 'Kite profile reduces surface area, speeding up dart velocity toward lower target beds.',
    modifiers: {
      scoringModifier: 1.01,
      doublingModifier: 1.02,
      consistencyModifier: 1.01,
      fatigueModifier: 0.99
    }
  },
  {
    id: 'flight-slim-velocity',
    name: 'Aerodynamic Slim Flights (Slim)',
    brand: 'Targetforce Global',
    category: 'flight',
    price: 14,
    tierRequired: 'amateur',
    weightGrams: 0.5,
    flightShape: 'slim',
    flightType: 'hardened_150',
    visualFinish: 'Cyber Cyan Lightning',
    visualColor: '#06b6d4',
    flightDesign: 'neon_lightning',
    description: 'Flat, high-velocity trajectory. Ideal for direct throwing styles with fast arm cadence.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 1.01,
      consistencyModifier: 1.02,
      fatigueModifier: 0.97
    }
  },
  {
    id: 'flight-golden-wings-pear',
    name: 'Golden Wings Tear-Drop Flights (Pear)',
    brand: 'WinCraft Pro',
    category: 'flight',
    price: 18,
    tierRequired: 'amateur',
    weightGrams: 0.6,
    flightShape: 'pear',
    flightType: 'hardened_150',
    visualFinish: 'Gold Filigree Noir',
    visualColor: '#f59e0b',
    flightDesign: 'golden_wings',
    description: 'Aerodynamic teardrop pear profile with lustrous gold wings. Smoother flow through the air with reduced tail drag.',
    modifiers: {
      scoringModifier: 1.02,
      doublingModifier: 1.03,
      consistencyModifier: 1.02,
      fatigueModifier: 0.98
    }
  },
  {
    id: 'flight-target-crosshair-standard',
    name: 'Sniper Reticle Pro Flights (Standard)',
    brand: 'ArrowCraft UK',
    category: 'flight',
    price: 22,
    tierRequired: 'semi_pro',
    weightGrams: 0.7,
    flightShape: 'standard',
    flightType: 'hardened_150',
    visualFinish: 'High-Vis Orange Reticle',
    visualColor: '#f97316',
    flightDesign: 'target_crosshair',
    description: 'Precision crosshair flight grid. 150-micron extra-rigid material locks true to the line of throw.',
    modifiers: {
      scoringModifier: 1.04,
      doublingModifier: 1.02,
      consistencyModifier: 1.03,
      fatigueModifier: 0.97
    }
  },
  {
    id: 'flight-integrated-molded',
    name: 'Integrated Molded Stem & Flight System',
    brand: 'WinCraft Pro',
    category: 'flight',
    price: 35,
    tierRequired: 'semi_pro',
    weightGrams: 1.4,
    flightShape: 'standard',
    flightType: 'molded_integrated',
    visualFinish: 'Molded Aero Emerald',
    visualColor: '#10b981',
    flightDesign: 'stealth_carbon',
    description: 'Precision molded 90° fixed wings that never separate or bend. Eliminates bounce-outs.',
    modifiers: {
      scoringModifier: 1.03,
      doublingModifier: 1.03,
      consistencyModifier: 1.04,
      fatigueModifier: 0.95
    }
  }

  ,
  // --- MEGSTORE EXPANSION: NEW BARRELS ---
  {
    id: 'barrel-knurled-classic-90',
    brand: 'Megastore',
    name: 'Knurled Classic 90% (23g)',
    category: 'barrel',
    price: 35.0,
    tierRequired: 'amateur',
    description: 'A classic knurled grip providing dependable friction for sweaty hands.',
    weightGrams: 23,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'straight',
    gripType: 'ringed',
    visualColor: 'silver',
    modifiers: { scoringModifier: 1.01, doublingModifier: 0.99, consistencyModifier: 1.03, fatigueModifier: 1.0 }
  },
  {
    id: 'barrel-micro-grip-pro-95',
    brand: 'Megastore',
    name: 'Micro-Grip Pro 95% (22g)',
    category: 'barrel',
    price: 65.0,
    tierRequired: 'pro',
    description: 'Intricate micro-cuts along the barrel offer extreme control without sticking.',
    weightGrams: 22,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'straight',
    gripType: 'micro_grip',
    visualColor: 'black',
    modifiers: { scoringModifier: 1.02, doublingModifier: 1.01, consistencyModifier: 1.05, fatigueModifier: 0.98 }
  },
  {
    id: 'barrel-torpedo-storm-80',
    brand: 'Megastore',
    name: 'Torpedo Storm 80% (26g)',
    category: 'barrel',
    price: 25.0,
    tierRequired: 'pub',
    description: 'Front-loaded torpedo profile that drives the dart into the board.',
    weightGrams: 26,
    barrelMaterial: 'tungsten_80',
    barrelProfile: 'torpedo',
    gripType: 'smooth',
    visualColor: 'silver',
    modifiers: { scoringModifier: 1.03, doublingModifier: 0.97, consistencyModifier: 0.98, fatigueModifier: 1.05 }
  },
  {
    id: 'barrel-scalloped-rhythm-90',
    brand: 'Megastore',
    name: 'Scalloped Rhythm 90% (24g)',
    category: 'barrel',
    price: 50.0,
    tierRequired: 'semi_pro',
    description: 'Deep scallop in the center forces consistent finger placement.',
    weightGrams: 24,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'scallop',
    gripType: 'scalloped',
    visualColor: 'silver',
    modifiers: { scoringModifier: 1.00, doublingModifier: 1.0, consistencyModifier: 1.06, fatigueModifier: 1.0 }
  },
  {
    id: 'barrel-stealth-black-95',
    brand: 'Megastore',
    name: 'Stealth Black 95% (23g)',
    category: 'barrel',
    price: 85.0,
    tierRequired: 'elite',
    description: 'Ultra-thin 95% tungsten coated in titanium nitride for extreme durability.',
    weightGrams: 23,
    barrelMaterial: 'tungsten_95',
    barrelProfile: 'straight',
    gripType: 'shark_fin',
    visualFinish: 'matte_black',
    visualColor: 'black',
    modifiers: { scoringModifier: 1.05, doublingModifier: 1.03, consistencyModifier: 1.02, fatigueModifier: 0.95 }
  },
  {
    id: 'barrel-gold-rush-90',
    brand: 'Megastore',
    name: 'Gold Rush 90% (25g)',
    category: 'barrel',
    price: 55.0,
    tierRequired: 'semi_pro',
    description: 'Striking gold-plated barrels with an aggressive shark fin grip.',
    weightGrams: 25,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'straight',
    gripType: 'shark_fin',
    visualColor: 'gold',
    modifiers: { scoringModifier: 1.04, doublingModifier: 0.98, consistencyModifier: 1.01, fatigueModifier: 1.02 }
  },
  {
    id: 'barrel-featherweight-90',
    brand: 'Megastore',
    name: 'Featherweight 90% (18g)',
    category: 'barrel',
    price: 45.0,
    tierRequired: 'amateur',
    description: 'Incredibly light steel tip dart. Requires a fast, snappy throw.',
    weightGrams: 18,
    barrelMaterial: 'tungsten_90',
    barrelProfile: 'straight',
    gripType: 'smooth',
    visualColor: 'silver',
    modifiers: { scoringModifier: 0.96, doublingModifier: 1.04, consistencyModifier: 0.97, fatigueModifier: 0.85 }
  },
  {
    id: 'barrel-the-anvil-brass',
    brand: 'Megastore',
    name: 'The Anvil Brass (30g)',
    category: 'barrel',
    price: 15.0,
    tierRequired: 'pub',
    description: 'Massive, heavy brass darts. Throwing these is a workout.',
    weightGrams: 30,
    barrelMaterial: 'brass',
    barrelProfile: 'bomb',
    gripType: 'ringed',
    visualColor: 'gold',
    modifiers: { scoringModifier: 1.02, doublingModifier: 0.95, consistencyModifier: 0.95, fatigueModifier: 1.15 }
  },
  {
    id: 'shaft-nylon-short',
    brand: 'Megastore',
    name: 'Nylon Shaft (Short)',
    category: 'shaft',
    price: 1.5,
    tierRequired: 'pub',
    description: 'Moves the center of gravity backwards. Good for front-loaded darts.',
    weightGrams: 0.8,
    shaftLength: 'short',
    shaftMaterial: 'nylon',
    visualColor: 'black',
    modifiers: { scoringModifier: 1.0, doublingModifier: 1.0, consistencyModifier: 1.01, fatigueModifier: 1.0 }
  },
  {
    id: 'shaft-polycarbonate-medium',
    brand: 'Megastore',
    name: 'Polycarbonate Medium',
    category: 'shaft',
    price: 3.5,
    tierRequired: 'amateur',
    description: 'Tougher than standard nylon, transparent colored finish.',
    weightGrams: 1.1,
    shaftLength: 'medium',
    shaftMaterial: 'nylon',
    visualColor: 'blue',
    modifiers: { scoringModifier: 1.01, doublingModifier: 1.0, consistencyModifier: 1.01, fatigueModifier: 1.0 }
  },
  {
    id: 'shaft-carbon-long',
    brand: 'Megastore',
    name: 'Carbon Composite (Long)',
    category: 'shaft',
    price: 8.0,
    tierRequired: 'pro',
    description: 'Extra long carbon shaft for severe tail stability.',
    weightGrams: 1.4,
    shaftLength: 'medium',
    shaftMaterial: 'carbon_composite',
    visualColor: 'black',
    modifiers: { scoringModifier: 0.99, doublingModifier: 1.03, consistencyModifier: 1.02, fatigueModifier: 1.0 }
  },
  {
    id: 'shaft-titanium-pro-short',
    brand: 'Megastore',
    name: 'Titanium Pro (Short)',
    category: 'shaft',
    price: 15.0,
    tierRequired: 'elite',
    description: 'Indestructible titanium shaft that shifts weight significantly to the rear.',
    weightGrams: 2.2,
    shaftLength: 'short',
    shaftMaterial: 'titanium',
    visualColor: 'silver',
    modifiers: { scoringModifier: 1.02, doublingModifier: 1.02, consistencyModifier: 0.99, fatigueModifier: 1.01 }
  },
  {
    id: 'shaft-spinning-carbon',
    brand: 'Megastore',
    name: 'Spinning Carbon (Medium)',
    category: 'shaft',
    price: 12.0,
    tierRequired: 'semi_pro',
    description: 'Carbon shaft with a rotating top to drastically reduce deflections.',
    weightGrams: 1.2,
    shaftLength: 'medium',
    shaftMaterial: 'carbon_composite',
    visualColor: 'black',
    modifiers: { scoringModifier: 1.05, doublingModifier: 1.0, consistencyModifier: 1.0, fatigueModifier: 1.0 }
  },
  {
    id: 'flight-standard-dimplex',
    brand: 'Megastore',
    name: 'Dimplex Standard 100',
    category: 'flight',
    price: 2.5,
    tierRequired: 'amateur',
    description: 'Golf-ball style dimples create a textured surface to slow the dart down.',
    weightGrams: 0.6,
    flightShape: 'standard',
    flightType: 'foldable_100',
    flightDesign: 'dimplex_texture',
    visualColor: 'white',
    modifiers: { scoringModifier: 1.02, doublingModifier: 1.0, consistencyModifier: 1.02, fatigueModifier: 1.0 }
  },
  {
    id: 'flight-kite-100',
    brand: 'Megastore',
    name: 'Kite Shape 100',
    category: 'flight',
    price: 1.5,
    tierRequired: 'pub',
    description: 'Reduces drag compared to standard, forcing a flatter trajectory.',
    weightGrams: 0.5,
    flightShape: 'kite',
    flightType: 'foldable_100',
    flightDesign: 'plain',
    visualColor: 'red',
    modifiers: { scoringModifier: 1.03, doublingModifier: 0.98, consistencyModifier: 0.99, fatigueModifier: 1.0 }
  },
  {
    id: 'flight-slim-transparent',
    brand: 'Megastore',
    name: 'Slim Transparent 150',
    category: 'flight',
    price: 3.0,
    tierRequired: 'semi_pro',
    description: 'Ultra-small surface area for fast, hard throws. Leaves the treble 20 wide open.',
    weightGrams: 0.4,
    flightShape: 'slim',
    flightType: 'hardened_150',
    flightDesign: 'clear',
    visualColor: 'clear',
    modifiers: { scoringModifier: 1.05, doublingModifier: 0.95, consistencyModifier: 0.96, fatigueModifier: 1.0 }
  },
  {
    id: 'flight-pear-150',
    brand: 'Megastore',
    name: 'Pear Shape Hardened 150',
    category: 'flight',
    price: 3.5,
    tierRequired: 'amateur',
    description: 'Tear-drop shape offers a balance of standard stability and slim speed.',
    weightGrams: 0.6,
    flightShape: 'pear',
    flightType: 'hardened_150',
    flightDesign: 'gradient',
    visualColor: 'orange',
    modifiers: { scoringModifier: 1.01, doublingModifier: 1.02, consistencyModifier: 1.01, fatigueModifier: 1.0 }
  },
  {
    id: 'flight-integrated-short',
    brand: 'Megastore',
    name: 'Integrated Molded (Short)',
    category: 'flight',
    price: 12.0,
    tierRequired: 'pro',
    description: 'Shaft and flight perfectly molded together. Never pops off, perfect 90 degree angle.',
    weightGrams: 1.8,
    flightShape: 'standard',
    flightType: 'molded_integrated',
    shaftLength: 'short',
    flightDesign: 'pro_molded',
    visualColor: 'black',
    modifiers: { scoringModifier: 1.04, doublingModifier: 1.03, consistencyModifier: 1.05, fatigueModifier: 0.98 }
  },
  {
    id: 'set-pub-brawler',
    brand: 'Megastore',
    name: 'Pub Brawler 26g',
    category: 'complete_set',
    price: 20.0,
    tierRequired: 'pub',
    description: 'Heavy, durable, cheap. Good for surviving falls onto hard pub floors.',
    weightGrams: 26,
    modifiers: { scoringModifier: 0.95, doublingModifier: 0.95, consistencyModifier: 1.02, fatigueModifier: 1.05 }
  },
  {
    id: 'set-county-captain-90',
    brand: 'Megastore',
    name: 'County Captain 90% (24g)',
    category: 'complete_set',
    price: 60.0,
    tierRequired: 'semi_pro',
    description: 'A serious step up. 90% tungsten with medium shafts and 150-micron flights.',
    weightGrams: 24,
    modifiers: { scoringModifier: 1.04, doublingModifier: 1.02, consistencyModifier: 1.03, fatigueModifier: 1.0 }
  },
  {
    id: 'set-pro-tour-contender-95',
    brand: 'Megastore',
    name: 'Pro Tour Contender 95% (22g)',
    category: 'complete_set',
    price: 100.0,
    tierRequired: 'pro',
    description: 'High-density tungsten, carbon shafts, molded flights. A setup built for TV stages.',
    weightGrams: 22,
    modifiers: { scoringModifier: 1.07, doublingModifier: 1.05, consistencyModifier: 1.05, fatigueModifier: 0.95 }
  },
  {
    id: 'set-major-winner-gold-95',
    brand: 'Megastore',
    name: 'Major Winner Gold 95% (23g)',
    category: 'complete_set',
    price: 150.0,
    tierRequired: 'elite',
    description: 'Gold-plated 95% tungsten, titanium shafts, integrated flights. The pinnacle of darts tech.',
    weightGrams: 23,
    modifiers: { scoringModifier: 1.10, doublingModifier: 1.08, consistencyModifier: 1.08, fatigueModifier: 0.92 }
  }


,
  {
    id: 'barrel-tungsten-stealth-80',
    brand: 'Megastore',
    name: 'Stealth Tungsten 80% (21g)',
    category: 'barrel',
    price: 28.0,
    tierRequired: 'amateur',
    description: 'Black-coated 80% tungsten barrel with minimal grip for smooth release.',
    weightGrams: 21,
    barrelMaterial: 'tungsten_80',
    barrelProfile: 'straight',
    gripType: 'smooth',
    visualFinish: 'matte_black',
    visualColor: 'black',
    modifiers: { scoringModifier: 0.99, doublingModifier: 1.02, consistencyModifier: 0.99, fatigueModifier: 1.0 }
  },
  {
    id: 'shaft-aluminium-long',
    brand: 'Megastore',
    name: 'Aluminium Long',
    category: 'shaft',
    price: 4.5,
    tierRequired: 'pub',
    description: 'Heavy aluminium shaft. Bends when hit but never breaks.',
    weightGrams: 1.8,
    shaftLength: 'medium',
    shaftMaterial: 'aluminium',
    visualColor: 'silver',
    modifiers: { scoringModifier: 0.98, doublingModifier: 1.0, consistencyModifier: 0.98, fatigueModifier: 1.05 }
  },
  {
    id: 'flight-target-shield',
    brand: 'Megastore',
    name: 'Shield Shape 100',
    category: 'flight',
    price: 1.8,
    tierRequired: 'amateur',
    description: 'A compact shield shape designed to minimize deflections.',
    weightGrams: 0.5,
    flightShape: 'kite',
    flightType: 'foldable_100',
    flightDesign: 'plain',
    visualColor: 'blue',
    modifiers: { scoringModifier: 1.0, doublingModifier: 1.01, consistencyModifier: 1.03, fatigueModifier: 1.0 }
  },
  {
    id: 'set-master-craft-95',
    brand: 'Megastore',
    name: 'MasterCraft Custom 95% (24g)',
    category: 'complete_set',
    price: 180.0,
    tierRequired: 'elite',
    description: 'Bespoke dart set built to your exact specifications. Flawless aerodynamics.',
    weightGrams: 24,
    modifiers: { scoringModifier: 1.12, doublingModifier: 1.10, consistencyModifier: 1.12, fatigueModifier: 0.88 }
  }

];

export function getEquipmentItemById(id: string): EquipmentItem | undefined {
  return EQUIPMENT_CATALOG.find(item => item.id === id);
}

export function getDefaultEquipmentLoadout(): EquippedLoadout {
  return {
    barrelId: 'barrel-brass-22',
    shaftId: 'shaft-nylon-medium',
    flightId: 'flight-standard-100',
    totalWeightGrams: 24,
    modifiers: {
      scoringModifier: 1.0,
      doublingModifier: 1.0,
      consistencyModifier: 1.0,
      fatigueModifier: 1.0
    }
  };
}

export function calculateLoadoutModifiers(
  barrel: EquipmentItem,
  shaft: EquipmentItem,
  flight: EquipmentItem
): EquipmentModifiers {
  // Baseline is 1.0. Delta from 1.0 is summed for balanced, non-exploitative scaling
  const sDelta = (barrel.modifiers.scoringModifier - 1.0) + (shaft.modifiers.scoringModifier - 1.0) + (flight.modifiers.scoringModifier - 1.0);
  const dDelta = (barrel.modifiers.doublingModifier - 1.0) + (shaft.modifiers.doublingModifier - 1.0) + (flight.modifiers.doublingModifier - 1.0);
  const cDelta = (barrel.modifiers.consistencyModifier - 1.0) + (shaft.modifiers.consistencyModifier - 1.0) + (flight.modifiers.consistencyModifier - 1.0);
  const fDelta = (barrel.modifiers.fatigueModifier - 1.0) + (shaft.modifiers.fatigueModifier - 1.0) + (flight.modifiers.fatigueModifier - 1.0);

  return {
    scoringModifier: Number((1.0 + sDelta).toFixed(3)),
    doublingModifier: Number((1.0 + dDelta).toFixed(3)),
    consistencyModifier: Number((1.0 + cDelta).toFixed(3)),
    fatigueModifier: Number((1.0 + fDelta).toFixed(3))
  };
}
