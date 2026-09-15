# Chunk 006: 2-Player Dynamic Background Theme & Two-Stage Confirmation Flow

**Status:** Completed  
**Date:** September 10, 2026  
**Scope:** Two-Player Turn-Based Career, Visible Background Theme Shifts, Turn Handoff & Action Confirmation Flow

---

## 1. Overview & Problem Statement
In previous 2-Player Career sessions:
1. **Lack of Visual Differentiation:** Players seated across the room could not instantly tell whose turn it was to make weekly decisions.
2. **Premature Execution / Tournament Locking:** When Player 1 clicked a tournament, it immediately locked the decision or triggered bracket entry without providing an explicit, unhurried selection and confirmation flow where Player 1 confirms at the top of the page, the screen visibly shifts to Player 2's theme, Player 2 chooses their action, and Player 2 confirms at the top before execution begins.

---

## 2. Changes Implemented

### A. Dynamic Ambient Background & Top Border Themes (`src/App.tsx`)
- **Player 1 Turn (John):**
  - Rich Amber glow backdrop: `bg-gradient-to-b from-amber-950/40 via-neutral-950 to-neutral-950`.
  - Amber glowing top border: `border-t-4 border-amber-500 shadow-[0_-12px_45px_rgba(245,158,11,0.25)]`.
  - Header badge: Amber animated indicator reading `Turn: John (P1)`.
- **Player 2 Turn (Rob):**
  - Rich Royal Purple glow backdrop: `bg-gradient-to-b from-purple-950/50 via-neutral-950 to-neutral-950`.
  - Purple glowing top border: `border-t-4 border-purple-500 shadow-[0_-12px_45px_rgba(168,85,247,0.3)]`.
  - Header badge: Purple animated indicator reading `Turn: Rob (P2)`.
- **Transitions:** Seamless 700ms color shift (`transition-colors duration-700`) that changes the atmosphere of the entire screen when turns change.

### B. Dedicated Top Turn & Confirmation Hero Bar (`src/ui/screens/CareerDashboard.tsx`)
Implemented the exact two-stage workflow requested:
1. **Player 1's Turn (Stage 1):**
   - Active screen theme is Amber.
   - Player 1 chooses an action below (clicks a tournament or practice drill).
   - Selection is held in tentative pending state (`pendingChoice`). The clicked card is highlighted with an Amber glow ring and `Selected Choice (Confirm Above)`.
   - The Top Confirmation Bar displays the selection and lights up with an Amber button:
     `✓ Confirm John's Choice ➔ Hand Turn to Rob`.
   - Clicking this button locks John's decision, sets `activePlayerIndex = 1`, saves the game, and triggers the handoff.
2. **Player 2's Turn (Stage 2):**
   - The screen visibly transitions to Royal Purple.
   - The Top Confirmation Bar indicates `Player 2's Go: Rob`, notes `✓ John Confirmed: [Event/Drill]`, and prompts Rob to choose.
   - Rob chooses his action:
     - If Rob selects the same tournament as John, a `⚔️ Rivalry Clash Confirmed!` badge appears.
     - If Rob selects another tournament or practice drill, his choice is clearly displayed.
   - The Top Confirmation Bar lights up with a Purple/Emerald button:
     `✓ Confirm Rob's Choice & Start Week ➔`.
   - An optional `↩ Re-choose John` button allows reverting to Player 1 if changes are needed.
3. **Execution Phase:**
   - Only after Rob confirms do both decisions execute simultaneously:
     - If one enters a tournament and one trains/rests: non-tourney player's routine applies immediately, and the tournament begins with only the entrant.
     - If both enter the same tournament: both enter the unified bracket seeded opposite.
     - If both enter different tournaments: sequential entry with secondary tournament queued.
     - If both train/rest: both routines apply and calendar advances to Week $W+1$.

### C. Automated Unit Testing
- Added unit test in `tests/career/TwoPlayerWeeklyDecisions.test.ts`:
  - Validates stage 1 selection & confirmation -> handoff to Player 2 -> stage 2 selection & confirmation -> clean single-entrant execution.
- Total test suites passing: **24 / 24** suites, **66 / 66** tests.
- Production build cleanly compiled with Vite.

---

## 3. Verification & Results
- `npx tsc --noEmit`: 0 errors.
- `npx vitest run`: 66 / 66 passed.
- `npm run build`: Production bundle generated successfully.
