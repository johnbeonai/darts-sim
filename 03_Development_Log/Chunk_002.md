# Chunk 002: Player Foundation & Performance Simulation

- **Date**: 2026-09-10
- **Phases**: Phase 1 (Player Foundation) & Phase 5 (Performance Simulation)
- **Objective**: Implement the structured Player model (0-100 attributes, dynamic states, career stats), archetype-based player generation, the Performance Simulation Pipeline (clock-face scatter, dynamic form/fatigue/confidence modifiers), and the StatisticalInputProvider.

## Files Created
1. `src/core/player/Player.ts` - Player entity with base attributes (scoring, doubling, consistency, pressure, stamina), hidden traits (potential, work ethic, professionalism), dynamic state (confidence, fatigue, form), equipment, and career statistics.
2. `src/core/player/PlayerFactory.ts` - Controlled randomization generator supporting archetypes (`heavy_scorer`, `clinical_finisher`, `steady_grinder`, `balanced`, `raw_talent`) and AI opponent generation for different tiers (pub, amateur, semi_pro, pro, elite).
3. `src/core/simulation/TargetingEngine.ts` - Board target selector mapping remaining score to doubles, checkout routes, or T20 setups.
4. `src/core/simulation/PerformancePipeline.ts` - 7-stage performance resolver evaluating skill, confidence, fatigue, form, and pressure situation, with realistic clock-face neighbor scatter.
5. `src/input/InputProvider.ts` - Common input provider interface (`IInputProvider`, `MatchContext`).
6. `src/input/StatisticalInputProvider.ts` - Statistical provider for CPU AI turns and automated match resolution.
7. `tests/player/Player.test.ts` - Verification of player boundaries, archetypes, and dynamic adjustments.
8. `tests/simulation/PerformancePipeline.test.ts` - Targeting logic, 501 bounds, and statistical differentiation between elite and amateur players.

## Test & Build Results
- 23 of 23 automated tests passing in 1.61s.
- Verified that elite player statistically outperforms amateur player over sample visits without determinism (Rule 8).

## Decisions Made
- Implemented standard clock-face adjacency (`CLOCKWISE_NEIGHBORS`) for realistic dart scatter (e.g. aiming at T20 scatters into 1, 5, or wire misses).
- Grounded fatigue accumulation with stamina mitigation.

## Next Chunk
- **Chunk 003**: Hybrid Manual Match Interface & Playable Loop (Phase 4) - Real-dart score entry keypad, visit confirmation/edit modal, live 501 scoreboard, and turn orchestration.
