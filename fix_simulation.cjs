const fs = require('fs');
let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

const regex = /public simulateHumanMatch\([\s\S]*?this\.recordMatchStats\(bm\.match, bm\.winnerId\);\s*\}\s*\}/;

const replacement = \`public simulateHumanMatch(bm: any): void {
    if (!this.activeTournament) return;
    this.activeTournament.resolveMatchStatistically(bm, new (require('../simulation/PerformancePipeline').PerformancePipeline)(this.rng));
    if (bm.winnerId === this.player.id || (this.isTwoPlayer && this.secondPlayer && bm.winnerId === this.secondPlayer.id)) {
       this.recordMatchStats(bm.match, bm.winnerId);
    }
  }\`;

content = content.replace(regex, replacement);
content = content.replace(/import \{ MatchSimulation \} from "\.\.\/simulation\/MatchSimulation";\\n/g, '');

fs.writeFileSync('src/core/career/CareerManager.ts', content);
