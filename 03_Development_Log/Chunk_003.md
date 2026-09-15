# Chunk 003: Hybrid Manual Match Interface & Playable Loop

- **Date**: 2026-09-10
- **Phases**: Phase 4 (Manual Hybrid)
- **Objective**: Deliver the primary V1 Hybrid milestone — allowing the player to physically throw darts at their real board, enter results via an ergonomic Dart-by-Dart keypad or Quick Visit Total, play against simulated CPU opponents across multiple difficulty tiers, and track official 501 match progression to completion.

## Files Created / Modified
1. `src/input/ManualInputProvider.ts` - Bridge between the UI dart entry keypad and the underlying `IInputProvider` domain interface.
2. `src/application/MatchController.ts` - State machine orchestrating live turn alternation, awaiting player input, resolving CPU visits via the performance pipeline with realistic cadence, updating leg/match scores, and handling victory triggers.
3. `src/ui/components/Scoreboard.tsx` - High-visibility broadcast-style scoreboard featuring dual player columns, remaining scores, live checkout routes (e.g. 170 -> T20 T20 Bull), 3-dart averages, and 180 trackers.
4. `src/ui/components/DartKeypad.tsx` - Touch/keyboard-friendly input supporting both dart-by-dart segment entry (Single, Double x2, Treble x3, Outer Bull 25, D-Bull 50, Miss) with live preview tray, and Quick 3-dart total input.
5. `src/App.tsx` - Complete playable game loop with player creation (archetypes: Heavy Scorer, Finisher, Grinder, Balanced, Raw Talent), opponent tier selector (Pub, Amateur, Semi-Pro, Pro, Elite), match length selector (Best of 1, 3, 5, 7 legs), live match play, and celebration screen with confetti.
6. `tests/application/MatchController.test.ts` - Automated verification of turn switching and match state transitions.

## Test & Build Results
- Vitest: 24 of 24 tests passed across 7 test suites in 1.58s.
- TypeScript & Vite build: 100% clean production bundle (`dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`).

## Decisions Made
- Implemented both Dart-by-Dart Keypad and Quick Total entry to accommodate different physical playing styles at the oche (fast scoring vs analytical dart-by-dart review).
- Integrated official CheckoutTable suggestions directly on the active player scoreboard when in checkout territory (<=170).

## Next Chunk
- **Chunk 004**: Career Foundation & Local Pub Circuit (Phase 2 & Phase 11) - Career state, calendar, local tournaments, match earnings, and player development progression.
