const fs = require('fs');
let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

const lines = content.split('\\n');

const insertion = \`  public advanceWeek(): void {
    const res = this.calendar.advanceWeek();

    for (const p of this.players) {
      if (p.activeSponsorships && p.activeSponsorships.length > 0) {
        const spRes = SponsorshipManager.processWeeklyStipends(p, p.activeSponsorships);
        if (spRes.totalStipendPaid > 0) {
          this.addLog({
            week: this.calendar.currentWeek,
            year: this.calendar.currentYear,
            title: \\\`💰 \${p.name}: Sponsor Income (+£\${spRes.totalStipendPaid})\\\`,
            description: \\\`Received weekly stipends.\\\`,
            type: 'milestone'
          });
        }
      }

      const lifestyleRes = LifestyleManager.processWeeklyUpkeep(p);
      if (lifestyleRes.totalCost > 0) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: \\\`🏠 \${p.name}: Lifestyle Upkeep (-£\${lifestyleRes.totalCost})\\\`,
          description: \\\`Paid weekly maintenance for lifestyle upgrades.\\\`,
          type: 'milestone'
        });
      }
      for (const msg of lifestyleRes.messages) {
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: \\\`⚠️ \${p.name}: Lifestyle Notice\\\`,
          description: msg,
          type: 'milestone'
        });
      }\`;

const targetLine = lines.findIndex(l => l.includes('if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {'));

if (targetLine !== -1) {
    const newLines = [
        ...lines.slice(0, targetLine),
        insertion,
        ...lines.slice(targetLine)
    ];
    fs.writeFileSync('src/core/career/CareerManager.ts', newLines.join('\\n'));
} else {
    console.error("Target line not found!");
}
