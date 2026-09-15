const fs = require('fs');
let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

const lines = content.split('\\n');

// The lines we saw were:
// 771: empty
// 772: public advanceWeek(): void {
// 773:   this.resolveWeeklyPlans();
// 774: }
// Let's verify by just removing any block that matches `public advanceWeek(): void {\s*this.resolveWeeklyPlans();\s*}`
content = content.replace(/public advanceWeek\(\): void \{\s*this\.resolveWeeklyPlans\(\);\s*\}/, '');

if (!content.includes('MatchSimulation')) {
    content = "import { MatchSimulation } from '../simulation/MatchSimulation';\\n" + content;
}

fs.writeFileSync('src/core/career/CareerManager.ts', content);
