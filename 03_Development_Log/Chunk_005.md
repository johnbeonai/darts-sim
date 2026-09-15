# Chunk 005: AI World Population & Global Order of Merit Rankings

- **Date**: 2026-09-10
- **Phases**: Phase 6 (AI World Population) & Phase 9 (Rankings & Career Progression)
- **Objective**: Establish a persistent living world of 200+ AI players across Elite, Pro, Semi-Pro, and Amateur tiers, implement the official Order of Merit world rankings system tracking prize money and weekly rank movements (▲/▼), enable background weekly circuit simulations, build the interactive broadcast-style World Rankings Screen, and integrate persistent opponents into tournament brackets.

## Files Created / Modified
1. `src/core/ranking/RankingManager.ts` - Tracks the official 200+ player Order of Merit based on career prize money and ranking points, calculating rank movements (▲/▼) and indexing human players.
2. `src/core/world/WorldManager.ts` - Generates and manages the 200+ persistent AI population (16 Elite with authentic darts archetypes, 48 Pro, 64 Semi-Pro, 80 Amateur), providing persistent tier-based tournament opponents.
3. `src/core/world/WorldSimulation.ts` - Simulates weekly background tour events, dynamic form drift, and annual developmental aging.
4. `src/ui/screens/WorldRankingsScreen.tsx` - Interactive broadcast-style Order of Merit screen with tier filters (Top 32 Seeds, Elite, Pro, Semi-Pro, Amateur), live name/nation search, movement indicators, and visual highlighting for Player 1 and Player 2.
5. `src/core/career/CareerManager.ts` - Integrated WorldManager, RankingManager, and WorldSimulation; tournaments now draw persistent opponents from the world pool, creating authentic rivalries.
6. `src/ui/screens/CareerDashboard.tsx` - Added "Order of Merit" navigation button and live World Rank movement display on the active player card.
7. `src/App.tsx` - Added routing for `'world_rankings'`.
8. `src/storage/SaveManager.ts` - Serializes and deserializes the entire world population and ranking history.
9. `tests/world/WorldManager.test.ts`, `tests/ranking/RankingManager.test.ts`, `tests/world/WorldSimulation.test.ts` - Unit test suites.

## Test & Build Results
- Vitest: 65 of 65 tests passed across 24 test suites.
- TypeScript & Vite build: 100% clean production bundle (0 errors).

## Decisions Made
- Order of Merit primary ranking metric uses Total Career Prize Money, matching the official PDC professional standard (Section 46).
- Tournaments now draw from the persistent world rather than throwaway temporary players, allowing long-term player rivalries to develop (Section 53).

## Next Chunk
- **Chunk 006**: Professional Tour Tiers & Q-School Qualification (Phase 10 & Phase 12) - Qualifying School (Q-School), Pro Tour Card mechanics, tiered calendar expansion, and major championship invitations.
