const fs = require('fs');

let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');
const lines = content.split('\\n');

let startInjected = -1;
let endInjected = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('public advanceWeek(): void {') && i > 450 && i < 600) {
        startInjected = i;
    }
    if (startInjected !== -1 && endInjected === -1 && lines[i].includes('if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {')) {
        endInjected = i;
    }
}

if (startInjected !== -1 && endInjected !== -1) {
    content = [...lines.slice(0, startInjected), ...lines.slice(endInjected)].join('\\n');
}

content = content.replace(/res\.xpGained/g, 'res.gain');
content = content.replace(/res\.formChange/g, '0');
content = content.replace(/const res = TrainingManager\.executeTraining\(player \|\| this\.player, trainingType as any, this\.rng\);/g, 'const res = TrainingManager.executeTraining(player || this.player, trainingType as any);');

if (!content.includes('MatchSimulation')) {
    content = content.replace(/import \{ Tournament, TournamentConfig \} from '\.\.\/tournament\/Tournament';/, "import { Tournament, TournamentConfig } from '../tournament/Tournament';\\nimport { MatchSimulation } from '../simulation/MatchSimulation';");
}

fs.writeFileSync('src/core/career/CareerManager.ts', content);
