# Development Log: 2-Player Turn-Based Weekly Decisions & Calendar Progression Fix

**Date**: 2026-09-10  
**Status**: Completed & Verified  

---

## 1. Problem Statement
1. **Premature Tournament Launch & Phantom Player 2 in Bracket**:
   - In 2-Player Career Mode, when Player 1 (John) selected a tournament, it immediately placed John and Player 2 (Rob) directly into the tournament bracket without allowing Rob to make an independent weekly decision.
   - If Rob wanted to practice or rest, Rob was still trapped in John's tournament bracket.
2. **Weeks Not Advancing**:
   - After both players made their weekly choices or after completing/leaving a tournament, the calendar week was not incrementing, leaving players stuck in the same week.
3. **Invalid 180 Checkout Rule Bug**:
   - High visit scores (180) were previously misassigned to `highestCheckout`, violating standard PDC rules where maximum checkout is strictly 170.

---

## 2. Root Cause Analysis
1. **Weekly Decision Flow**:
   - `handleTournamentClick` in `CareerDashboard.tsx` previously did not trigger React state updates when changing `career.activePlayerIndex`, causing the dashboard to appear unresponsive or skip straight to resolution upon multiple clicks.
   - `resolveWeeklyDecisions` did not properly handle mixed states (one player in tournament, one player practicing/resting).
   - `TournamentBracketView` was passed `secondPlayer` globally without checking if the second player actually joined the specific tournament's entrant list.
2. **Week Advancement**:
   - `onLeaveTournament`, `handleFastSimFinished`, and `handleMatchConcluded` in `App.tsx` completed tournaments without invoking `career.advanceWeek()`.
   - In `CareerDashboard.tsx`, week advancement logic was split unpredictably between component buttons and `onAdvanceWeek()`.

---

## 3. Implementation Details
1. **`CareerManager.ts`**:
   - Added `pendingTournaments` queue for weeks where both players enter different events.
   - Added `recordPlayerDecision(playerId, decision)` for atomic weekly planning.
   - Implemented `resolveWeeklyPlans()`:
     - Applies training / rest routines immediately.
     - Single entrant: creates tournament with 1 human player and 7 AI opponents (the other player is NOT in the bracket).
     - Both in same tournament: creates unified 8-player bracket seeded in opposite halves (QF1 vs QF4).
     - Both in different tournaments: queues Player 2's event and initiates Player 1's event.
     - Both resting/training: advances calendar week immediately.
   - `advanceWeek()` resets `activePlayerIndex` to 0, clears queued tournaments, resets decisions to pending, and refreshes circuit events.
2. **`Tournament.ts`**:
   - Added `simulateRestOfTournament()` so when a human player exits or leaves early, remaining AI matches are concluded and final standings/prizes are accurately awarded.
3. **`TournamentBracketView.tsx`**:
   - Filtered `humanPlayers` strictly by `tournament.participants.some(p => p.id === hp.id)`.
   - Disabled "2-Player Shared Event" badge and phantom player 2 matching when only one human player is participating.
4. **`CareerDashboard.tsx`**:
   - Turn-based weekly planning:
     - Selecting a tournament locks the decision for the active player and automatically hands the turn to the other player with clear visual feedback.
     - Selecting training/rest locks the decision and hands the turn.
   - "Weekly Schedule Ready" summary card displays side-by-side choices for both players once all plans are locked.
   - Prominent "Proceed to Matches" / "Execute Week" button triggers `resolveWeeklyPlans()`.
5. **`App.tsx`**:
   - In `handleFastSimFinished`, `handleMatchConcluded`, and `onLeaveTournament`:
     - Completing/leaving a tournament checks `career.pendingTournaments`: if a second tournament is queued, it launches it; otherwise, it invokes `career.advanceWeek()`.
     - Ensures calendar week reliably advances by exactly 1 after tournament weeks.
6. **`SaveManager.ts`**:
   - Serializes and deserializes `weeklyDecisions` and `pendingTournaments` so mid-week planning is preserved.

---

## 4. Verification
- **Automated Tests**:
  - `tests/career/TwoPlayerWeeklyDecisions.test.ts`: 5 new unit tests covering 1-player vs 2-player brackets, opposite seeding, training recovery, queued tournaments, and save restoration.
  - `tests/match/CheckoutRule.test.ts`: 6 unit tests confirming maximum 170 checkout and bust logic.
  - **Full Suite**: 58 / 58 passing tests across 21 test files.
- **Production Build**:
  - `npm run build` completed with zero TypeScript errors.
