const fs = require('fs');

let content = fs.readFileSync('src/core/equipment/EquipmentItem.ts', 'utf8');

const newItems = `
  // --- MEGSTORE EXPANSION: NEW BARRELS ---
  {
    id: 'barrel-knurled-classic-90',
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

  // --- MEGASTORE EXPANSION: NEW SHAFTS ---
  {
    id: 'shaft-nylon-short',
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

  // --- MEGASTORE EXPANSION: NEW FLIGHTS ---
  {
    id: 'flight-standard-dimplex',
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

  // --- MEGASTORE EXPANSION: COMPLETE SETS ---
  {
    id: 'set-pub-brawler',
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
    name: 'Major Winner Gold 95% (23g)',
    category: 'complete_set',
    price: 150.0,
    tierRequired: 'elite',
    description: 'Gold-plated 95% tungsten, titanium shafts, integrated flights. The pinnacle of darts tech.',
    weightGrams: 23,
    modifiers: { scoringModifier: 1.10, doublingModifier: 1.08, consistencyModifier: 1.08, fatigueModifier: 0.92 }
  }
`;

content = content.replace('];\\n\\nexport function', newItems + '\\n];\\n\\nexport function');
fs.writeFileSync('src/core/equipment/EquipmentItem.ts', content);
