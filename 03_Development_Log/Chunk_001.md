# Chunk 001: Project Foundation & 501 Darts Match Engine

- **Date**: 2026-09-10
- **Phases**: Phase 0 (Project Foundation) & Phase 3 (Dart Engine)
- **Objective**: Establish the core decoupled architecture, project tooling, and implement the complete 501 Darts Match Engine (DartResult, Visit, Leg, Match, CheckoutTable, Seeded Randomness, GameConfig) with 100% test coverage.

## Files Created
1. `01_Master_Specification/Core_Concept.md` - Clean Markdown copy of Master Core Concept v1.1.
2. `02_Technical_Blueprint/Technical_Blueprint.md` - Clean Markdown copy of Master Technical Blueprint v2.0.
3. `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html` - Project foundation.
4. `src/core/config/GameConfig.ts` - Master simulation configuration & defaults.
5. `src/core/match/DartResult.ts` - Immutable single dart model (segments, multipliers, bull, misses, labels).
6. `src/core/match/Visit.ts` - Sequential 3-dart visit evaluator with official 501 bust & double-out rules.
7. `src/core/match/CheckoutTable.ts` - Checkout route guides for scores 2 to 170.
8. `src/core/match/Leg.ts` - Leg manager supporting sequential dart-by-dart and visit-by-visit entry, 3-dart averages, and turn switching.
9. `src/core/match/Match.ts` - Multi-leg / multi-set match coordinator with alternating starters.
10. `src/core/random/RandomProvider.ts` - Deterministic Mulberry32 seeded PRNG and default Gaussian scatter providers.
11. `tests/match/DartResult.test.ts` - Segment, multiplier, bull, and parser unit tests.
12. `tests/match/Visit.test.ts` - Scoring, bust on <0, bust on 1 left, bust on no-double, checkout detection.
13. `tests/match/Leg.test.ts` - Turn switching, 3-dart averages, full 9-dart leg simulation.
14. `tests/random/RandomProvider.test.ts` - Seed repeatability, bounds, and weighted pick tests.

## Test & Build Results
- Automated unit tests via Vitest: All test suites passed.
- 501 bust logic, double-out checkouts, and 9-darter execution verified.

## Decisions Made
- Chose a decoupled TypeScript domain architecture (`src/core/`) with zero UI dependencies, allowing identical execution on PC and Android.
- Adopted strict separation between game simulation and input providers (Manual, Statistical, Camera) as required by Rule 2.

## Next Chunk
- **Chunk 002**: Player Foundation & Performance Simulation (Phase 1 & Phase 5) - Base attributes, dynamic form/fatigue/confidence, and CPU visit generation.
