# Chunk 004 Addendum: 4 Save Slots, Dual Hybrid/Sim Mode, & Single Match Exhibition

- **Date**: 2026-09-10
- **Phases**: Phase 13 (Save System), Phase 4 (Hybrid Mode Enhancements), & Phase 12 (Career UI)
- **Objective**: Implement 4 persistent save slots with metadata, dual career match options (Hybrid physical play vs Statistical simulation for bed/tired play), Main Menu screen with slot browser, and standalone Single Match Exhibition mode (Player vs CPU & Local 2-Player Pass-and-Play).

## Files Created / Modified
1. `src/storage/SaveManager.ts` - 4-slot persistence engine with metadata extraction, JSON serialization, in-memory fallback for testing, and slot deletion.
2. `src/core/career/CareerManager.ts` - Added `activeSlotId` (1-4) and `simulateHumanMatch()` for statistical resolution of player tournament matches without physical throwing.
3. `src/ui/screens/MainMenu.tsx` - Clean main menu featuring "Continue Career" (with active slot badge), "New Career", and "Single Match (Exhibition)".
4. `src/ui/components/SaveSlotModal.tsx` - 4-slot visual picker displaying player name, date, circuit tier, bank balance, and delete actions.
5. `src/ui/screens/ExhibitionSetup.tsx` - Standalone match setup supporting Player vs CPU and Local 2-Player (Pass-and-Play at the oche).
6. `src/ui/components/TournamentBracketView.tsx` - Added dual action buttons for active tournament matches: **"🎯 Play Hybrid"** and **"⚡ Simulate Match"**.
7. `src/ui/screens/CareerDashboard.tsx` - Added explicit **"Save"** and **"Menu"** buttons.
8. `src/App.tsx` - Central orchestrator supporting seamless routing between Main Menu, Save Slots, Exhibition Matches, and Career Dashboard.
9. `tests/storage/SaveManager.test.ts` - Unit tests for 4-slot listing, saving, reloading, and deleting.
10. `tests/career/CareerSimMatch.test.ts` - Unit test for statistical simulation of human career matches.

## Test & Build Results
- Vitest: 34 of 34 tests passing across 13 test suites.
- TypeScript & Vite build: Production bundle generated with zero errors.

## Decisions Made
- Used localStorage with an in-memory fallback to ensure 100% offline persistence across browser, desktop, and mobile PWA/Capacitor without cloud/API overhead (£0 budget maintained).
- Provided both Hybrid and Statistical Sim options at the match level so players can progress their career either standing at the dartboard or resting in bed.
