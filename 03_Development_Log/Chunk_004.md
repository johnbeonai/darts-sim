# Chunk 004: Career Engine & Pub/Amateur Circuit

- **Date**: 2026-09-10
- **Phases**: Phase 2 (Career Foundation) & Phase 11 (Pub / Amateur Career)
- **Objective**: Establish the persistent Career mode with season calendar advancement, age progression, training & fatigue recovery, bank finances, and full 8-player single-elimination pub tournaments (e.g. The Red Lion Open, Fox & Hounds Trophy, Midlands Amateur Classic) seamlessly integrated into live hybrid matches.

## Files Created / Modified
1. `src/core/career/Calendar.ts` - Tracks week (1-52), month, and year progression, triggering yearly birthday celebrations and age advances.
2. `src/core/tournament/Tournament.ts` - 8-player single-elimination tournament engine managing quarter-finals, semi-finals, finals, statistical resolution of AI matches, and prize money / ranking point payouts.
3. `src/core/career/TrainingManager.ts` - Weekly practice routines for Scoring, Doubling, Consistency, Stamina, and Full Rest, accounting for work ethic modifiers and fatigue penalties.
4. `src/core/career/CareerManager.ts` - Central career coordinator linking player finances, active tournaments, calendar progression, and chronicle logs.
5. `src/ui/screens/CareerDashboard.tsx` - Career command center showing season date, bank balance, tier, ranking points, dynamic condition (fatigue, form, confidence), weekly tournaments, practice drills, and historical career chronicle.
6. `src/ui/components/TournamentBracketView.tsx` - Visual 3-round knockout bracket showing participant match-ups, live results, and instant transition to the oche.
7. `src/App.tsx` - Seamless multi-view navigation between Career Creation, Career Dashboard, Tournament Bracket, and Live Hybrid Oche Matches.
8. `tests/career/Calendar.test.ts`, `tests/tournament/Tournament.test.ts`, `tests/career/TrainingManager.test.ts`, `tests/career/CareerManager.test.ts` - Unit test suites.

## Test & Build Results
- Vitest: 30 of 30 tests passed across 11 test files.
- TypeScript & Vite build: Successfully compiled production bundle.

## Decisions Made
- Single-elimination 8-player tournament format keeps early-career pacing engaging without artificial grind (Section 42).
- Rest weeks recover up to 35% fatigue and restore player confidence for upcoming tournament runs.

## Next Chunk
- **Chunk 005**: AI World Population & Archetype Evolution (Phase 6 & Phase 9) - 200+ simulated AI players, developmental aging curves, and background ranking shifts.
