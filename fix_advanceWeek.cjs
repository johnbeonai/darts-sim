const fs = require('fs');

let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

const lines = content.split('\\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('public resolveWeeklyPlans(): WeeklyResolutionResult {') && i > 400) {
    startIdx = i;
  }
  if (lines[i].includes('if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {') && startIdx !== -1 && endIdx === -1) {
    endIdx = i;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `  public advanceWeek(): void {
    const res = this.calendar.advanceWeek();

    for (const p of this.players) {
      if (p.activeSponsorships && p.activeSponsorships.length > 0) {
        const spRes = SponsorshipManager.processWeeklyStipends(p, p.activeSponsorships);
        if (spRes.totalStipendPaid > 0) {
          this.addLog({
            week: this.calendar.currentWeek,
            year: this.calendar.currentYear,
            title: \`💰 \${p.name}: Sponsor Income (+£\${spRes.totalStipendPaid})\`,
            description: \`Received weekly stipends.\`,
            type: 'milestone'
          });
        }
      }

      const lifestyleRes = LifestyleManager.processWeeklyUpkeep(p);
      if (lifestyleRes.totalCost > 0) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: \`🏠 \${p.name}: Lifestyle Upkeep (-£\${lifestyleRes.totalCost})\`,
          description: \`Paid weekly maintenance for lifestyle upgrades.\`,
          type: 'milestone'
        });
      }
      for (const msg of lifestyleRes.messages) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: \`⚠️ \${p.name}: Lifestyle Notice\`,
          description: msg,
          type: 'milestone'
        });
      }
`;

  const newLines = [
    ...lines.slice(0, startIdx),
    replacement,
    ...lines.slice(endIdx)
  ];
  
  fs.writeFileSync('src/core/career/CareerManager.ts', newLines.join('\\n'));
}

content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

// Fix train signature
content = content.replace(/public train\(trainingType: string\): any \{/g, 'public train(trainingType: string, player: Player): any {');
content = content.replace(/this\.player\.recoverFatigue\(35\);/g, 'player.recoverFatigue(35);');
content = content.replace(/TrainingManager\.executeTraining\(this\.player, /g, 'TrainingManager.executeTraining(player, ');

// Remove duplicate advanceWeek at the bottom of the file
content = content.replace(/  public advanceWeek\(\): void \{\s*this\.resolveWeeklyPlans\(\);\s*\}/g, '');

fs.writeFileSync('src/core/career/CareerManager.ts', content);
