import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CareerManagerShell } from '../../src/ui/components/CareerManagerShell';
import { CAREER_PAGES } from '../../src/ui/components/CareerNavigationConfig';
import { CareerManager } from '../../src/core/career/CareerManager';
import { Player } from '../../src/core/player/Player';

describe('CareerManagerShell (Championship Manager / LMA Manager Navigation)', () => {
  const createCareer = () => {
    const p1 = new Player('p1', 'Phil The Power', 'male', 'England', 30);
    p1.attributes.scoring = 88;
    p1.attributes.doubling = 85;
    p1.ranking = 16;
    p1.bankBalance = 25000;
    return new CareerManager([p1]);
  };

  it('renders all 11 CM/LMA navigation tabs and page items', () => {
    const career = createCareer();

    const html = renderToString(
      <CareerManagerShell
        career={career}
        currentView="career_dashboard"
        onNavigate={() => {}}
        onAdvanceWeek={() => {}}
        onSaveGame={() => {}}
        onReturnToMainMenu={() => {}}
      >
        <div id="test-content">Dashboard Content Here</div>
      </CareerManagerShell>
    );

    // 1. Retro Darts Manager Brand
    expect(html).toContain('Darts Manager');

    // 2. Player info capsule
    expect(html).toContain('Phil The Power');
    expect(html).toContain(`#${career.ranking.getPlayerRank(career.player.id)?.currentRank}`);
    expect(html).toContain('£25,000');

    // 3. CM Page Stepper controls
    expect(html).toContain('Prev');
    expect(html).toContain('Next');
    expect(html).toContain('01 / 11');
    expect(html).toContain('Dashboard &amp; Weekly Hub');

    // 4. Iconic CM Continue button
    expect(html).toContain('Continue');

    // 5. CM Navigation tabs for all sections
    expect(html).toContain('Dashboard');
    expect(html).toContain('Profile');
    expect(html).toContain('Calendar');
    expect(html).toContain('Rankings');
    expect(html).toContain('Premier League');
    expect(html).toContain('Pro Shop');
    expect(html).toContain('Finances');
    expect(html).toContain('Staff');
    expect(html).toContain('Medical');
    expect(html).toContain('Practice');
    expect(html).toContain('Records');

    // 6. Child content rendered
    expect(html).toContain('Dashboard Content Here');

    // 7. LMA-style bottom footer stepper
    expect(html).toContain('Previous:');
    expect(html).toContain('Next: Profile');
  });

  it('displays correct Prev and Next page labels when on an inner page like Finances', () => {
    const career = createCareer();

    const html = renderToString(
      <CareerManagerShell
        career={career}
        currentView="finances"
        onNavigate={() => {}}
        onAdvanceWeek={() => {}}
        onSaveGame={() => {}}
        onReturnToMainMenu={() => {}}
      >
        <div>Finances Content</div>
      </CareerManagerShell>
    );

    // Finances is index 6 (07 / 11)
    expect(html).toContain('07 / 11');
    expect(html).toContain('Finances &amp; Sponsorships');

    // Prev should be Pro Shop, Next should be Staff
    expect(html).toContain('Previous: Pro Shop');
    expect(html).toContain('Next: Staff');
  });

  it('shows 2-player turn indicators when career is in 2P mode', () => {
    const p1 = new Player('p1', 'Player One', 'male', 'England', 25);
    const p2 = new Player('p2', 'Player Two', 'male', 'Scotland', 24);
    const career = new CareerManager([p1, p2]);
    career.isTwoPlayer = true;
    career.activePlayerIndex = 1; // Player 2's turn

    const html = renderToString(
      <CareerManagerShell
        career={career}
        currentView="career_dashboard"
        onNavigate={() => {}}
        onAdvanceWeek={() => {}}
        onSaveGame={() => {}}
        onReturnToMainMenu={() => {}}
      >
        <div>2P Dashboard</div>
      </CareerManagerShell>
    );

    expect(html).toContain('P2 Turn');
    expect(html).toContain('Player Two');
    expect(html).toContain('Execute Week');
  });

  it('highlights Resume Cup when tournament is actively in progress', () => {
    const career = createCareer();
    // Simulate active tournament
    career.activeTournament = {
      config: { id: 'world_matchplay', name: 'World Matchplay', tier: 'Major' },
      isCompleted: false,
      currentRoundIndex: 1,
    } as any;

    const html = renderToString(
      <CareerManagerShell
        career={career}
        currentView="career_dashboard"
        onNavigate={() => {}}
        onAdvanceWeek={() => {}}
        onSaveGame={() => {}}
        onReturnToMainMenu={() => {}}
        onResumeTournament={() => {}}
      >
        <div>Tournament Bracket View</div>
      </CareerManagerShell>
    );

    expect(html).toContain('Resume Cup');
  });
});
