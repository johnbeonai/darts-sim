const fs = require('fs');

let content = fs.readFileSync('src/application/MatchController.ts', 'utf-8');

content = content.replace(
    /if\s*\(turnPlayerId === this\.player\.id\)\s*\{\s*this\.status = 'awaiting_player_input';\s*this\.notify\('Your turn'\);\s*\}\s*else\s*\{\s*this\.status = 'cpu_thinking';/,
    `const isOpponentHuman = this.opponentProvider.type === 'manual';
      if (turnPlayerId === this.player.id || (turnPlayerId === this.opponent.id && isOpponentHuman)) {
        this.status = 'awaiting_player_input';
        this.notify(turnPlayerId === this.player.id ? 'Your turn' : \`\${this.opponent.name}'s turn\`);
      } else {
        this.status = 'cpu_thinking';`
);

content = content.replace(
    /const isPlayerTurn = currentLeg\.currentTurnPlayerId === this\.player\.id;/,
    `const isPlayerTurn = currentLeg.currentTurnPlayerId === this.player.id || (currentLeg.currentTurnPlayerId === this.opponent.id && this.opponentProvider.type === 'manual');`
);

fs.writeFileSync('src/application/MatchController.ts', content);
