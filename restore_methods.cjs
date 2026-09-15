const fs = require('fs');

let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

const missingMethods = `
  public train(trainingType: string): any {
    if (trainingType === 'rest') {
      this.player.recoverFatigue(35);
      return { gain: 0, message: 'Recovered 35 fatigue', fatigueChange: -35 };
    }
    const res = TrainingManager.executeTraining(this.player, trainingType as any, this.rng);
    return { gain: res.xpGained, message: \`Gained \${res.xpGained} XP. Form \${res.formChange > 0 ? '+' : ''}\${res.formChange}\` };
  }

  public advanceWeek(): void {
    this.resolveWeeklyPlans();
  }

  public simulateHumanMatch(bm: any): void {
    const sim = new MatchSimulation(bm.match, this.rng);
    const res = sim.simulateFull();
    bm.score = res.score;
    bm.winnerId = res.winnerId;
    bm.isCompleted = true;
    if (bm.winnerId === this.player.id || (this.isTwoPlayer && this.secondPlayer && bm.winnerId === this.secondPlayer.id)) {
       this.recordMatchStats(bm.match, bm.winnerId);
    }
  }

  public recordMatchStats(match: any, playerId: string): void {
    const p = this.players.find(x => x.id === playerId);
    if (!p) return;
    
    p.stats.matchesPlayed++;
    if (match.winnerId === playerId) {
       p.stats.matchesWon++;
    }
    
    const pStats = match.getMatchStats(playerId);
    p.stats.legsWon += pStats.legsWon;
    
    if (pStats.highestCheckout > p.stats.highestCheckout && pStats.highestCheckout <= 170) {
       p.stats.highestCheckout = pStats.highestCheckout;
    }
    if (pStats.highestVisit > p.stats.highestVisit && pStats.highestVisit <= 180) {
       p.stats.highestVisit = pStats.highestVisit;
    }
  }

  public finalizeTournament(tournament: Tournament): void {
    if (!tournament.isCompleted) return;

    for (const p of this.players) {
       if (tournament.winner?.id === p.id) {
          const prize = tournament.config.prizePool.winner;
          p.bankBalance += prize;
          p.stats.tournamentsWon++;
          this.addLog({
             week: this.calendar.currentWeek,
             year: this.calendar.currentYear,
             title: \`🏆 \${p.name} WON \${tournament.config.name}!\`,
             description: \`Claimed the title and £\${prize.toLocaleString()} prize money!\`,
             type: 'tournament'
          });
          
          if (tournament.config.tier === 'major' || tournament.config.tier === 'premier') {
             p.stats.majorsWon = (p.stats.majorsWon || 0) + 1;
          }

          const tDef = TrophyManager.resolveTrophyDefinition(tournament);
          this.trophyAwards.push({
             playerId: p.id,
             trophyId: tDef.id,
             year: this.calendar.currentYear,
             tournamentName: tournament.config.name
          });
       } else {
          // Just grant basic appearance money based on round logic...
          const prize = tournament.config.prizePool.last64 || 500;
          if (tournament.participants.some(x => x.id === p.id)) {
            p.bankBalance += prize;
          }
       }
    }
    this.activeTournament = null;
  }
`;

content = content.replace(
  /  public addLog\(entry: CareerEventLog\): void \{/g,
  missingMethods + '\n  public addLog(entry: CareerEventLog): void {'
);

// Add missing imports
if (!content.includes('MatchSimulation')) {
  content = content.replace(
    /import \{ Tournament, TournamentConfig.*?;/g,
    `import { Tournament, TournamentConfig } from '../tournament/Tournament';\nimport { MatchSimulation } from '../simulation/MatchSimulation';\nimport { TrophyManager } from '../trophies/Trophy';`
  );
}

fs.writeFileSync('src/core/career/CareerManager.ts', content);
