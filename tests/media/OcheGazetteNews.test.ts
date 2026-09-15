import { describe, it, expect } from 'vitest';
import { OcheGazetteNews } from '../../src/core/media/OcheGazetteNews';

describe('OcheGazetteNews', () => {
  it('generates urgent headline when a tournament is won', () => {
    const articles = OcheGazetteNews.generateWeeklyNews(
      15,
      2026,
      'Week 15 • April 2026',
      'Phil The Power',
      8,
      'World Matchplay',
      true
    );

    expect(articles.length).toBeGreaterThanOrEqual(2);
    expect(articles[0].category).toBe('tournament');
    expect(articles[0].headline).toContain('Phil The Power Clinches World Matchplay Title!');
    expect(articles[0].isUrgent).toBe(true);
  });

  it('generates elite top 16 ranking headline for highly ranked players', () => {
    const articles = OcheGazetteNews.generateWeeklyNews(
      5,
      2026,
      'Week 5 • February 2026',
      'Phil The Power',
      12
    );

    const rankingArticle = articles.find(a => a.category === 'ranking');
    expect(rankingArticle).toBeDefined();
    expect(rankingArticle?.headline).toContain('Elite Top 16');
    expect(rankingArticle?.snippet).toContain('#12');
  });

  it('generates challenger watch headline for unseeded players', () => {
    const articles = OcheGazetteNews.generateWeeklyNews(
      8,
      2026,
      'Week 8 • February 2026',
      'Rising Rookie',
      75
    );

    const rankingArticle = articles.find(a => a.category === 'ranking');
    expect(rankingArticle).toBeDefined();
    expect(rankingArticle?.headline).toContain('Challenger Watch');
    expect(rankingArticle?.snippet).toContain('#75');
  });
});
