# Chunk 008: Q-School, Tour Cards, Tier-Gated Calendar & Weekly Action Execution Flow

**Status:** Completed  
**Date:** September 13, 2026  
**Scope:** Phase 8 & 12, Technical Blueprint Sections 41, 43–46, and 2-Player Weekly Action Resolution Fix

---

## 1. Overview & Objectives
1. **PDC Tour Card & Status Progression**:
   - Implemented 2-year Tour Card ownership (`hasTourCard`, `tourCardExpiryYear`), Top 64 retention rule at season end, and automatic status promotion to `pro` tier.
2. **PDC Qualifying School (Q-School)**:
   - 4-stage event in Week 1 with automatic Tour Card allocation for stage winners and accumulation of Q-School Order of Merit points.
3. **Authentic 52-Week Tier-Gated Calendar**:
   - Pub Circuit & Amateur Regionals (Open to all competitors).
   - Challenge Tour (Non-card holders and Q-School attendees).
   - PDC Players Championships (Floor events requiring active Tour Card).
   - European Tour events (Tour Card holders & qualifiers).
   - Televised Majors with official PDC Order of Merit Cutoffs:
     * Week 9: **UK Open** (Minehead, FA Cup open draw)
     * Week 28: **World Matchplay** (Blackpool Winter Gardens, Top 32 cutoff)
     * Week 40: **World Grand Prix** (Leicester Arena, Top 32 cutoff, Double-In Double-Out)
     * Week 45: **Grand Slam of Darts** (Wolverhampton, Top 32 cutoff)
     * Week 48: **Players Championship Finals** (Minehead, Top 64 cutoff)
     * Weeks 50–52: **PDC World Darts Championship** (Alexandra Palace / Ally Pally, Top 64 cutoff, £500,000 champion prize)
4. **Fix: Action Skipping Resolution Flow**:
   - Resolved the issue where advancing after Player 2's confirmation silently skipped routines in memory without visual feedback.
   - Introduced the **Weekly Action Execution Hub Modal** (`WeeklyResolutionResult`), visually detailing each player's drill outcomes (XP gained, attribute development, fatigue cost) and tournament entries with clear action buttons before advancing.

---

## 2. Files Created & Modified

### Domain & System Files
1. `src/core/player/Player.ts`:
   - Added `hasTourCard`, `tourCardExpiryYear`, `qSchoolPoints`.
   - Added `awardTourCard(currentYear, durationYears)` and `revokeTourCard()`.
2. `src/core/tournament/Tournament.ts`:
   - Added `TournamentCategory` (`pub`, `amateur`, `challenge_tour`, `pro_tour`, `major`, `q_school`).
   - Added `TournamentRequirement` (`tourCardRequired`, `maxRank`, `minTier`, `nonCardHoldersOnly`).
   - Extended `TournamentConfig` with requirements, `isMajor`, `isQSchool`, and `tvBroadcastName`.
3. `src/core/career/CalendarSchedule.ts` [NEW]:
   - 52-week authentic darts tour schedule.
4. `src/core/career/QSchoolManager.ts` [NEW]:
   - Manages 4-stage Q-School points and Tour Card allocations.
5. `src/core/career/CareerManager.ts`:
   - Added `isPlayerEligibleForTournament(player, config)`.
   - In `resolveWeeklyPlans()`, returns `WeeklyResolutionResult` with `p1Action` and `p2Action`.
   - In `advanceWeek()`, evaluates season-end Tour Card retention against Top 64 Order of Merit cutoff.
6. `src/storage/SaveManager.ts`:
   - Serializes and deserializes `hasTourCard`, `tourCardExpiryYear`, and `qSchoolPoints` across all 4 save slots.

### UI & Presentation Files
7. `src/ui/screens/CareerDashboard.tsx`:
   - Displayed Tour Card status badge on active player card (`PDC Tour Card Holder` vs `Q-School Hopeful`).
   - Filter tabs: `All Events`, `Eligible Only`, `Pro Tour & Majors`, `Pub & Amateur`.
   - Category badges and qualification lock notices on tournament cards.
   - Integrated **Weekly Action Execution Modal**: displays animated drill gains, XP progress, and tournament entries when Player 2 confirms or when solo player trains.

### Test Files
8. `tests/career/TourCardAndCalendar.test.ts` [NEW]:
   - 8 unit tests verifying Q-School Tour Card awards, points accumulation, tournament gating, Major cutoffs, Top 64 season-end card retention, SaveManager persistence, and WeeklyResolutionResult capture.
   - Total test suite: 28 test files, 86 / 86 tests passing.

---

## 3. Verification & Build
- Vitest: 86 / 86 tests passed (`npx vitest run`).
- Production Build: Clean Vite bundle generated (`npm run build`).
- Live Server: Running smoothly on `http://localhost:3000`.
