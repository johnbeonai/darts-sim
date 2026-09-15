# Chunk 007: Equipment Shop, Commercial Sponsorships & Financial Depth

**Status:** Completed  
**Date:** September 13, 2026  
**Scope:** Phase 10 & Technical Blueprint Sections 32, 59, 62, 65

---

## 1. Overview & Objectives
Implemented Phase 10 of the Master Technical Blueprint, introducing deep career RPG and financial management systems:
1. **Darts Pro Shop & Custom Loadouts**: Barrels, shafts, flights, and complete signature dart sets with authentic performance distribution shaping (treble clustering, outer-ring doubling, flight velocity, grouping scatter, and match fatigue rates).
2. **Commercial Sponsorships & Contracts**: Tiered commercial sponsors (Pub/Local, Regional Equipment Brands, Premier Global Manufacturers) providing weekly stipends, victory bonuses, and equipment shop discounts based on player tier and Order of Merit rank.
3. **High-Performance Support Team**: Practice Coaches (+25% to +45% training XP growth), Physiotherapists (+15% to +30% rest fatigue recovery, reduced match fatigue), and Sports Psychologists (+6 to +12 mental clutch bonus in deciding legs).
4. **Interactive Broadcast Screen (`EquipmentShopScreen.tsx`)**: 3-tab layout (Dart Pro Shop, Commercial Sponsorships, Support Team) with live component comparison, 2-Player independent management (Amber P1 / Purple P2), and save slot serialization.

---

## 2. Files Created & Modified

### New Domain & UI Files
1. `src/core/equipment/EquipmentItem.ts`:
   - Catalog of 18+ authentic equipment items (Complete Signature Sets, 80-95% Tungsten Barrels, Nylon/Aluminium/Carbon Stems, 100/150-micron and molded integrated flight systems).
   - `calculateLoadoutModifiers()` and `getDefaultEquipmentLoadout()`.
2. `src/core/finance/SponsorshipManager.ts`:
   - Tiered sponsor catalog with eligibility verification (Tier, Order of Merit rank, confidence).
   - Maximum 2 concurrent contracts rule, weekly stipend distribution, win bonuses, and gear discounts.
3. `src/core/finance/StaffManager.ts`:
   - Support staff catalog (Coaches, Physios, Psychologists) with weekly payroll management, insolvency departures, and performance perk calculations.
4. `src/ui/screens/EquipmentShopScreen.tsx`:
   - Broadcast-grade screen with real-time dart visualizer, component stat delta pills, sponsor contract trackers, and support team hiring.
   - Independent player switcher for 2-Player Rivalry mode.

### Modified Files
1. `src/core/player/Player.ts`:
   - Added `ownedEquipmentIds`, `equippedLoadout`, `activeSponsorships`, and `hiredStaffIds`.
   - Added `equipItem()` and `buyEquipmentItem()` with sponsor discount support.
2. `src/core/simulation/PerformancePipeline.ts`:
   - Applied equipment scoring/doubling/consistency modifiers directly to dart landing resolutions.
   - Incorporated Sports Psychologist mental clutch bonus into deciding-leg pressure calculations.
3. `src/core/career/TrainingManager.ts`:
   - Integrated Coach XP multiplier and Physiotherapist rest recovery bonus.
4. `src/core/career/CareerManager.ts`:
   - In `advanceWeek()`, automated weekly sponsor stipend credits, staff payroll deductions, and career chronicle log entries.
   - In `finalizeTournament()`, automated commercial sponsor tournament win bonus payouts.
5. `src/storage/SaveManager.ts`:
   - Serialized and deserialized owned equipment inventory, equipped loadouts, active sponsorships, and hired staff with backward compatibility.
6. `src/ui/screens/CareerDashboard.tsx`:
   - Added "Pro Shop" navigation button with active sponsor stipend indicator.
   - Displayed currently equipped dart set name on the active player overview card.
7. `src/App.tsx`:
   - Added route `'equipment_shop'` and wired seamless navigation to and from `CareerDashboard`.

---

## 3. Testing & Verification
- `tests/equipment/EquipmentSystem.test.ts`: 6 tests verifying catalog, purchases, discounts, loadout switches, and match engine distribution shaping.
- `tests/finance/SponsorshipAndStaff.test.ts`: 5 tests verifying sponsor eligibility, stipends, staff hiring, payroll, and training/rest perks.
- `tests/storage/SaveManagerEquipment.test.ts`: 1 test verifying full persistence across save slots.
- Total Vitest Suite: **27 / 27 test files, 78 / 78 tests passing**.
- Production Build: Clean Vite bundle generated in 6.14s (`npm run build`).
