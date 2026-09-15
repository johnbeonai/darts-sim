import { describe, it, expect } from 'vitest';
import { DebugTracker } from '../../src/core/debug/DebugTracker';

describe('DebugTracker', () => {
  it('logs events, tracks errors, and formats markdown diagnostic report', () => {
    const tracker = DebugTracker.getInstance();
    tracker.clearLogs();

    expect(tracker.getErrorCount()).toBe(0);
    expect(tracker.getLogs().length).toBe(0);

    tracker.addLog('info', 'Started application test');
    tracker.addLog('warn', 'Simulated warning on leg score', { score: 175 });
    tracker.addLog('error', 'Simulated test error', { code: 500 });

    expect(tracker.getErrorCount()).toBe(1);
    expect(tracker.getLogs().length).toBe(3);

    const report = tracker.generateMarkdownReport({
      view: 'career_dashboard',
      career: {
        activeSlotId: 1,
        player: {
          name: 'Phil Test',
          age: 28,
          nationality: 'England',
          tier: 'pub',
          bankBalance: 350,
          state: { confidence: 80, form: 75, fatigue: 10 },
          attributes: { scoring: 70, doubling: 65, consistency: 68, stamina: 75, pressure: 60 },
          stats: { matchesPlayed: 5, matchesWon: 4, total180s: 3, highestCheckout: 121 }
        },
        calendar: {
          currentWeek: 4,
          currentYear: 1,
          dateString: 'Jan 28, 2026'
        },
        activeTournament: {
          config: { name: 'Red Lion Open', tier: 'pub', location: 'London', entryFee: 20 },
          currentRound: 1,
          isCompleted: false,
          winner: null,
          matches: [
            { round: 1, isCompleted: true, player1: { name: 'Phil Test' }, player2: { name: 'Bob' }, winner: { name: 'Phil Test' } }
          ]
        }
      }
    });

    expect(report).toContain('### 🎯 Darts Sim Debug & Diagnostic Report');
    expect(report).toContain('**Active View**: `career_dashboard`');
    expect(report).toContain('Phil Test');
    expect(report).toContain('Red Lion Open');
    expect(report).toContain('Simulated test error');
  });
});
