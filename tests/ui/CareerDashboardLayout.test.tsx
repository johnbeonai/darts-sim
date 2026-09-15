import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CareerDashboard } from '../../src/ui/screens/CareerDashboard';
import { CareerManager } from '../../src/core/career/CareerManager';
import { Player } from '../../src/core/player/Player';

describe('CareerDashboard Visual Layout Overhaul', () => {
  it('renders with glassmorphism containers, typography badge, and uniform interactive grid', () => {
    const player = new Player('p1', 'Phil The Power', 'male', 'England', 30);
    const career = new CareerManager([player]);

    const html = renderToString(
      <CareerDashboard
        career={career}
        onEnterTournament={() => {}}
        onAdvanceWeek={() => {}}
        onTrain={() => {}}
        onSaveGame={() => {}}
        onReturnToMainMenu={() => {}}
        onOpenProfile={() => {}}
        onOpenRecords={() => {}}
        onOpenRankings={() => {}}
        onOpenCalendar={() => {}}
        onOpenPremierLeague={() => {}}
        onOpenShop={() => {}}
        onOpenFinances={() => {}}
        onOpenStaff={() => {}}
        onOpenMedical={() => {}}
        onOpenPractice={() => {}}
      />
    );

    // 1. Global Theme: Translucent Glassmorphism Containers
    expect(html).toContain('bg-slate-900/60');
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('border-white/10');
    expect(html).toContain('shadow-2xl');
    expect(html).toContain('rounded-2xl');

    // 2. Typography Redesign: Compact Inline Badge
    expect(html).toContain('bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase inline-flex items-center gap-2');
    expect(html).toContain('Week 1');

    // 3. Uniform Interactive Grid
    expect(html).toContain('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
    expect(html).toContain('w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 rounded-xl px-4 flex items-center justify-between text-sm font-medium text-slate-200 group');

    // 4. Lucide React Icons Segregated on the Right
    expect(html).toContain('text-slate-400 group-hover:text-slate-200 transition-colors w-5 h-5');

    // 5. Verification of Key Grid Destinations
    expect(html).toContain('World Rankings');
    expect(html).toContain('Premier League');
    expect(html).toContain('Full Season Calendar');
    expect(html).toContain('Equipment Pro Shop');
    expect(html).toContain('Finances &amp; Sponsors');
    expect(html).toContain('Support Staff Team');
    expect(html).toContain('Medical &amp; Physio');
    expect(html).toContain('Practice Oche &amp; Drills');
    expect(html).toContain('Career Records &amp; Honors');
  });
});
