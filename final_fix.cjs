const fs = require('fs');
let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

const lines = content.split('\\n');

// 1. Find line 511 and delete the duplicate resolveWeeklyPlans block up to the lifestyle stuff if it's there?
// Wait, the duplicate is `public advanceWeek()` at line 511 AND at line 769.
// I will just remove the one at 511 entirely!
let startAdv = -1;
let endAdv = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('public advanceWeek(): void {') && i > 400 && i < 600) {
        startAdv = i;
    }
    // Delete until the end of advanceWeek which is right before `if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {`
    if (startAdv !== -1 && endAdv === -1 && lines[i].includes('if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {')) {
        endAdv = i;
    }
}

if (startAdv !== -1 && endAdv !== -1) {
    // Delete the lines between startAdv and endAdv
    content = [...lines.slice(0, startAdv), ...lines.slice(endAdv)].join('\\n');
}

// 2. Fix TrainingManager execution
content = content.replace(/const res = TrainingManager\.executeTraining\(player \|\| this\.player, trainingType as any\);/g, 'const res = TrainingManager.executeTraining(player || this.player, trainingType as any, this.rng);');
content = content.replace(/const res = TrainingManager\.executeTraining\(player \|\| this\.player, trainingType as any, this\.rng\);/g, 'const res = TrainingManager.executeTraining(player || this.player, trainingType as any, this.rng);'); // ensure it's there

// 3. Fix the missing xpGained properties
content = content.replace(/res\.xpGained/g, 'res.xpGained || 0');
content = content.replace(/res\.formChange/g, 'res.formChange || 0');

// 4. Fix MatchSimulation import
if (!content.includes('MatchSimulation')) {
    content = content.replace(/import \{ Tournament, TournamentConfig \} from '\.\.\/tournament\/Tournament';/, "import { Tournament, TournamentConfig } from '../tournament/Tournament';\\nimport { MatchSimulation } from '../simulation/MatchSimulation';");
}

// 5. Fix TrophyAward properties
content = content.replace(/tier: tournament\.config\.tier as any,\s*week: this\.calendar\.currentWeek,\s*year: this\.calendar\.currentYear\s*}\);/g, "tier: tournament.config.tier as any,\\n             week: this.calendar.currentWeek,\\n             year: this.calendar.currentYear,\\n             prizeWon: prize,\\n             icon: '🏆',\\n             description: 'Winner'\\n          });");

// 6. Check for duplicate advanceWeek again
const countAdvance = (content.match(/public advanceWeek\(\): void \{/g) || []).length;
if (countAdvance > 1) {
    // Keep only the first one
    let found = false;
    content = content.replace(/public advanceWeek\(\): void \{/g, () => {
        if (!found) {
            found = true;
            return 'public advanceWeek(): void {';
        }
        return 'public duplicateAdvanceWeek(): void {';
    });
}

fs.writeFileSync('src/core/career/CareerManager.ts', content);
