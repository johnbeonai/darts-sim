const fs = require('fs');
let text = fs.readFileSync('src/core/equipment/EquipmentItem.ts', 'utf8');

text = text.replace(/\{\s*id:\s*'[^']+',[^}]+modifiers:\s*\{[^}]+\}\s*\}/g, (match) => {
    if (!match.includes('brand:')) {
        return match.replace(/id:\s*'[^']+',/, (idMatch) => idMatch + "\\n    brand: 'Megastore',");
    }
    return match;
});

fs.writeFileSync('src/core/equipment/EquipmentItem.ts', text);
