import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PlayerProfileScreen } from '../../src/ui/screens/PlayerProfileScreen';
import { CareerManager } from '../../src/core/career/CareerManager';
import { Player } from '../../src/core/player/Player';

describe('PlayerProfileScreen Visual Layout Overhaul', () => {
  it('renders clean athletic layout with glassmorphism, overall rating, and stats grid', () => {
    const p1 = new Player('p1', 'Luke Littler', 'male', 'England', 19);
    p1.tier = 'pro';
    p1.hasTourCard = true;
    p1.tourCardExpiryYear = 2027;
    p1.stats.matchesPlayed = 20;
    p1.stats.matchesWon = 16;
    p1.stats.total180s = 48;
    p1.stats.highestCheckout = 170;
    p1.stats.dartsThrown = 600;
    p1.stats.totalPointsScored = 19800;

    const career = new CareerManager([p1]);

    const html = renderToString(
      <PlayerProfileScreen
        player={p1}
        career={career}
        onBack={() => {}}
      />
    );

    // 1. Theme: Glassmorphism container
    expect(html).toContain('bg-slate-900/60');
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('border-white/10');
    expect(html).toContain('shadow-2xl');

    // 2. Player Bio & Badges
    expect(html).toContain('Luke Littler');
    expect(html).toContain('19 Years Old');
    expect(html).toContain('PDC Tour Card');
    expect(html).toContain('Tier');

    // 3. Vital Snapshot: OVR Badge, 3-Dart Avg, Bankroll
    expect(html).toContain('Overall Skill');
    expect(html).toContain('OVR');
    expect(html).toContain('3-Dart Avg');
    expect(html).toContain('Bankroll');

    // 4. Condition Metrics
    expect(html).toContain('Match Confidence');
    expect(html).toContain('Current Form &amp; Sharpness');
    expect(html).toContain('Fatigue Load');

    // 5. Core 5 Attributes
    expect(html).toContain('Scoring Power');
    expect(html).toContain('Doubling &amp; Finishing');
    expect(html).toContain('Consistency &amp; Grouping');
    expect(html).toContain('Pressure Composure');
    expect(html).toContain('Physical Stamina');

    // 6. Right Column Dossier
    expect(html).toContain('Career Statistics');
    expect(html).toContain('Active Match Darts');
    expect(html).toContain('Development Ceiling');

    // 7. Verification that misplaced 4-Week Schedule preview was removed
    expect(html).not.toContain('Upcoming 4-Week Tour Schedule');
  });
});
