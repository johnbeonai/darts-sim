const fs = require('fs');

let content = fs.readFileSync('src/core/career/CareerManager.ts', 'utf8');

// The corrupted block starts at:
//       if (qPlayers.length >= 4) {
//         // Seed 1 vs 4, 2 vs 3
//         participants = [qPlayers[0], qPlayers[3], qPlayers[1], qPlayers[2]];
//       } else {
//         participants = [...qPlayers, ...aiOpponents].slice(0, 4);
//       }
//       this.addLog({

// And ends at:
//       description: msg,
//       type: 'milestone'
//     });
//         }
//   
//         if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {

const corruptRegex = /      if \(qPlayers\.length >= 4\) \{\s*\/\/ Seed 1 vs 4, 2 vs 3\s*participants = \[qPlayers\[0\], qPlayers\[3\], qPlayers\[1\], qPlayers\[2\]\];\s*\} else \{\s*participants = \[\.\.\.qPlayers, \.\.\.aiOpponents\]\.slice\(0, 4\);\s*\}\s*this\.addLog\(\{[\s\S]*?description: msg,\s*type: 'milestone'\s*\}\);\s*\}\s*if \(p\.hiredStaffIds && p\.hiredStaffIds\.length > 0\) \{/g;

const replacement = `      if (qPlayers.length >= 4) {
        // Seed 1 vs 4, 2 vs 3
        participants = [qPlayers[0], qPlayers[3], qPlayers[1], qPlayers[2]];
      } else {
        participants = [...qPlayers, ...aiOpponents].slice(0, 4);
      }
    } else if (isPremierLeague) {
      participants = [...entrants, ...aiOpponents].slice(0, 8);
    } else {
      participants = [...entrants, ...aiOpponents];
    }

    const tournament = new Tournament(config, participants);
    this.activeTournament = tournament;

    for (const p of entrants) {
      this.addLog({
        week: this.calendar.currentWeek,
        year: this.calendar.currentYear,
        title: \`Entered \${config.name}\`,
        description: \`Paid entry fee of £\${config.entryFee}.\`,
        type: 'tournament'
      });
    }

    return tournament;
  }

  public resolveWeeklyPlans(): WeeklyResolutionResult {
    if (this.pendingTournaments.length > 0 || this.activeTournament) {
      return { weekAdvanced: false, yearChanged: false };
    }

    const res = this.calendar.advanceWeek();

    for (const p of this.players) {
      const decision = this.weeklyDecisions.get(p.id) || { action: 'rest' };
      
      if (decision.action === 'train' && decision.trainingType) {
        const tr = TrainingManager.executeTraining(p, decision.trainingType, this.rng);
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: \`🎯 \${p.name} Trained: \${decision.trainingType}\`,
          description: \`Gained \${tr.xpGained} XP. Form change: \${tr.formChange > 0 ? '+' : ''}\${tr.formChange}. Fatigue: +\${tr.fatigueIncrease}.\`,
          type: 'training'
        });
      } else if (decision.action === 'rest') {
        p.recoverFatigue(25);
        this.addLog({
          week: this.calendar.currentWeek,
          year: this.calendar.currentYear,
          title: \`🛋️ \${p.name} Rested\`,
          description: 'Recovered 25 fatigue.',
          type: 'milestone'
        });
      }

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

      if (p.hiredStaffIds && p.hiredStaffIds.length > 0) {`;

content = content.replace(corruptRegex, replacement);

fs.writeFileSync('src/core/career/CareerManager.ts', content);
