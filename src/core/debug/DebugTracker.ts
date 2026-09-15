export interface DebugLogEntry {
  timestamp: string;
  type: 'error' | 'warn' | 'info' | 'event';
  message: string;
  details?: any;
}

export interface DebugReportContext {
  view: string;
  career?: any;
  activeMatch?: any;
  controller?: any;
  matchState?: any;
  settings?: any;
}

export class DebugTracker {
  private static instance: DebugTracker;
  private logs: DebugLogEntry[] = [];
  private maxLogs: number = 50;
  private errorCount: number = 0;
  private listeners: Array<() => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.addLog('error', event.message || 'Uncaught Script Error', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack || event.error
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.addLog('error', `Unhandled Promise Rejection: ${event.reason}`, {
          reason: event.reason?.stack || event.reason
        });
      });
    }
  }

  public static getInstance(): DebugTracker {
    if (!DebugTracker.instance) {
      DebugTracker.instance = new DebugTracker();
    }
    return DebugTracker.instance;
  }

  public addLog(type: 'error' | 'warn' | 'info' | 'event', message: string, details?: any): void {
    const entry: DebugLogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    };

    if (type === 'error') {
      this.errorCount++;
    }

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notify();
  }

  public getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  public getErrorCount(): number {
    return this.errorCount;
  }

  public clearLogs(): void {
    this.logs = [];
    this.errorCount = 0;
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Debug listener error:', err);
      }
    });
  }

  public generateMarkdownReport(context: DebugReportContext): string {
    try {
      const lines: string[] = [];
      lines.push('### 🎯 Darts Sim Debug & Diagnostic Report');
      lines.push(`- **Generated At**: ${new Date().toISOString()}`);
      lines.push(`- **Active View**: \`${context.view}\``);
      lines.push(`- **Error Count**: ${this.errorCount}`);
      lines.push(`- **User Agent**: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js/Test'}`);
      lines.push('');

      // Career State
      if (context.career) {
        const c = context.career;
        lines.push('#### 👤 Career State');
        lines.push(`- **Save Slot**: Slot ${c.activeSlotId || 1}`);
        const p1 = (c.players && c.players[0]) || c.player;
        lines.push(`- **Player 1**: ${p1?.name} (Age ${p1?.age}, ${p1?.nationality})`);
        if (c.isTwoPlayer && c.players && c.players.length > 1) {
          lines.push(`- **Player 2**: ${c.players[1]?.name} (Age ${c.players[1]?.age}, ${c.players[1]?.nationality})`);
          lines.push(`- **Current Turn**: ${c.players[c.activePlayerIndex]?.name || 'Player 1'}`);
        }
        lines.push(`- **Circuit Tier**: ${c.player?.tier || p1?.tier} | **Bank Balance**: £${c.player?.bankBalance ?? p1?.bankBalance}`);
        lines.push(`- **Calendar**: Week ${c.calendar?.currentWeek}, Year ${c.calendar?.currentYear} (${c.calendar?.dateString})`);
        lines.push(`- **Condition**: Confidence: ${p1?.state?.confidence}%, Form: ${p1?.state?.form}%, Fatigue: ${p1?.state?.fatigue}%`);
        lines.push(`- **Attributes**: Scoring: ${p1?.attributes?.scoring}, Doubling: ${p1?.attributes?.doubling}, Consistency: ${p1?.attributes?.consistency}, Stamina: ${p1?.attributes?.stamina}, Pressure: ${p1?.attributes?.pressure}`);
        lines.push(`- **Career Stats**: Matches: ${p1?.stats?.matchesWon}/${p1?.stats?.matchesPlayed} won | 180s: ${p1?.stats?.total180s} | High Checkout: ${p1?.stats?.highestCheckout}`);
        lines.push('');

        if (c.activeTournament) {
          const t = c.activeTournament;
          lines.push('#### 🏆 Active Tournament Bracket');
          lines.push(`- **Tournament**: ${t.config?.name} (${t.config?.tier})`);
          lines.push(`- **Location**: ${t.config?.location} | **Entry Fee**: £${t.config?.entryFee}`);
          const roundNum = (t.currentRoundIndex !== undefined ? t.currentRoundIndex + 1 : t.currentRound) || 1;
          lines.push(`- **Round**: Round ${roundNum} | **Is Completed**: ${t.isCompleted}`);
          lines.push(`- **Winner**: ${t.winner ? t.winner.name : 'In Progress'}`);
          lines.push('- **Bracket Matches**:');
          if (t.rounds && Array.isArray(t.rounds)) {
            for (const round of t.rounds) {
              for (const m of round) {
                const status = m.isCompleted ? `Completed (Winner: ${m.winner?.name || 'TBD'})` : 'Pending';
                lines.push(`  - ${m.roundName || `Round ${(m.roundIndex || 0) + 1}`}: ${m.player1?.name || 'TBD'} vs ${m.player2?.name || 'TBD'} -> [${status}]`);
              }
            }
          } else if (t.matches && Array.isArray(t.matches)) {
            for (const m of t.matches) {
              const status = m.isCompleted ? `Completed (Winner: ${m.winner?.name || 'TBD'})` : 'Pending';
              lines.push(`  - Round ${m.round || 1}: ${m.player1?.name || 'TBD'} vs ${m.player2?.name || 'TBD'} -> [${status}]`);
            }
          }
          lines.push('');
        } else {
          lines.push('#### 🏆 Active Tournament');
          lines.push('- None active (In Dashboard / Preparation)');
          lines.push('');
        }
      } else {
        lines.push('#### 👤 Career State');
        lines.push('- No career loaded (Main Menu / Exhibition)');
        lines.push('');
      }

      // Match State
      if (context.controller) {
        const ctrl = context.controller;
        const leg = ctrl.match?.currentLeg;
        lines.push('#### 🎯 Active Match State');
        lines.push(`- **Match ID**: ${ctrl.match?.id}`);
        lines.push(`- **P1**: ${ctrl.player?.name} | **P2**: ${ctrl.opponent?.name}`);
        lines.push(`- **Legs Won**: ${ctrl.player?.name}: ${ctrl.match?.legsWon.get(ctrl.player?.id) || 0} | ${ctrl.opponent?.name}: ${ctrl.match?.legsWon.get(ctrl.opponent?.id) || 0}`);
        if (leg) {
          lines.push(`- **Current Leg**: ${leg.id}`);
          lines.push(`- **P1 Remaining**: ${leg.getRemainingScore(ctrl.player?.id)}`);
          lines.push(`- **P2 Remaining**: ${leg.getRemainingScore(ctrl.opponent?.id)}`);
          lines.push(`- **Turn**: ${leg.currentTurnPlayerId === ctrl.player?.id ? ctrl.player?.name : ctrl.opponent?.name}`);
          lines.push(`- **Darts Thrown In Leg**: ${leg.visits.reduce((acc: number, v: any) => acc + v.darts.length, 0)}`);
        }
        lines.push(`- **Match Finished**: ${ctrl.match?.status === 'finished'}`);
        lines.push('');
      } else if (context.activeMatch) {
        const am = context.activeMatch;
        lines.push('#### 🎯 Active Fast Sim Match');
        lines.push(`- **Match**: ${am.player1?.name} vs ${am.player2?.name}`);
        lines.push(`- **Round**: ${am.roundName || `Round ${(am.roundIndex || 0) + 1}`} | **Is Completed**: ${am.isCompleted}`);
        lines.push(`- **Winner**: ${am.winner ? am.winner.name : 'Simulating'}`);
        lines.push('');
      }

      // Recent Logs & Errors
      lines.push('#### 📝 Recent Logs & System Events (Latest First)');
      if (this.logs.length === 0) {
        lines.push('- *No logged events or errors.*');
      } else {
        for (const log of this.logs.slice(0, 20)) {
          const detailsStr = log.details ? ` | Details: ${JSON.stringify(log.details)}` : '';
          lines.push(`- [${log.timestamp}] **[${log.type.toUpperCase()}]** ${log.message}${detailsStr}`);
        }
      }

      return lines.join('\n');
    } catch (err: any) {
      console.error('Failed to generate markdown report:', err);
      return `### ⚠️ Diagnostic Error Generating Report\n- **Error**: ${err?.message || 'Unknown error'}\n- **Stack**: \`\`\`${err?.stack || 'No stack'}\`\`\`\n- **View**: ${context.view}`;
    }
  }
}
