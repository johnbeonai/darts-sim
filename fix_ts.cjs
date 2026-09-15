const fs = require('fs');
let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

content = content.replace(
  /this\.addLog\(\{[\s\S]*?title: `💰 \$\{p\.name\}: Sponsor Income \(\+£\$\{spRes\.totalStipendPaid\}\)`,[\s\S]*?description: `Received weekly stipend from \$\{spRes\.activeCount\} sponsors.`[\s\S]*?\}\);/g,
  `this.addLog({
    week: this.calendar.currentWeek,
    year: this.calendar.currentYear,
    title: \`💰 \${p.name}: Sponsor Income (+£\${spRes.totalStipendPaid})\`,
    description: \`Received weekly stipends.\`,
    type: 'milestone'
  });`
);

content = content.replace(
  /this\.addLog\(\{[\s\S]*?title: `🏠 \$\{p\.name\}: Lifestyle Upkeep \(-£\$\{lifestyleRes\.totalCost\}\)`,[\s\S]*?description: `Paid weekly maintenance for lifestyle upgrades.`[\s\S]*?\}\);/g,
  `this.addLog({
    week: this.calendar.currentWeek,
    year: this.calendar.currentYear,
    title: \`🏠 \${p.name}: Lifestyle Upkeep (-£\${lifestyleRes.totalCost})\`,
    description: \`Paid weekly maintenance for lifestyle upgrades.\`,
    type: 'milestone'
  });`
);

content = content.replace(
  /this\.addLog\(\{[\s\S]*?title: `⚠️ \$\{p\.name\}: Lifestyle Notice`,[\s\S]*?description: msg[\s\S]*?\}\);/g,
  `this.addLog({
    week: this.calendar.currentWeek,
    year: this.calendar.currentYear,
    title: \`⚠️ \${p.name}: Lifestyle Notice\`,
    description: msg,
    type: 'milestone'
  });`
);

fs.writeFileSync('src/core/career/CareerManager.ts', content);
