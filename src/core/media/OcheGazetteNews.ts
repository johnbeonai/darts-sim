export type NewsCategory = 'tournament' | 'ranking' | 'rivalry' | 'sponsor' | 'circuit';

export interface NewsArticle {
  id: string;
  headline: string;
  snippet: string;
  dateString: string;
  category: NewsCategory;
  isUrgent?: boolean;
  relatedPlayerName?: string;
  week: number;
}

export class OcheGazetteNews {
  /**
   * Generates dynamic weekly headlines based on career progression
   */
  public static generateWeeklyNews(
    week: number,
    year: number,
    dateString: string,
    playerName: string,
    playerRank: number,
    recentTournamentName?: string,
    wasTournamentWon?: boolean
  ): NewsArticle[] {
    const articles: NewsArticle[] = [];

    // 1. Tournament Win or Circuit Headline
    if (wasTournamentWon && recentTournamentName) {
      articles.push({
        id: `news-${week}-win`,
        headline: `${playerName} Clinches ${recentTournamentName} Title!`,
        snippet: `In an electric final display, ${playerName} sealed the trophy and secured massive Order of Merit prize money, further cementing their status on the PDC Pro Tour.`,
        dateString,
        category: 'tournament',
        isUrgent: true,
        relatedPlayerName: playerName,
        week,
      });
    } else {
      // Circuit overview headline
      articles.push({
        id: `news-${week}-circuit`,
        headline: `PDC Circuit Prepares for Week ${week} Action`,
        snippet: `Players across the world rankings converge for this week's tour events. With critical ranking points at stake, pressure is mounting at the oche.`,
        dateString,
        category: 'circuit',
        week,
      });
    }

    // 2. Ranking Headline
    if (playerRank <= 16) {
      articles.push({
        id: `news-${week}-rank-top16`,
        headline: `${playerName} Solidifies Elite Top 16 Standing`,
        snippet: `Currently holding World No. #${playerRank}, ${playerName} remains guaranteed automatic seeding into major televised PDC events throughout ${year}.`,
        dateString,
        category: 'ranking',
        relatedPlayerName: playerName,
        week,
      });
    } else if (playerRank <= 32) {
      articles.push({
        id: `news-${week}-rank-top32`,
        headline: `Race for the World Matchplay: ${playerName} in Contention`,
        snippet: `Hovering at World No. #${playerRank}, ${playerName} is right on the bubble for automatic qualification into summer televised majors.`,
        dateString,
        category: 'ranking',
        relatedPlayerName: playerName,
        week,
      });
    } else {
      articles.push({
        id: `news-${week}-rank-challenger`,
        headline: `Challenger Watch: ${playerName} Eyeing Top 64 Breakthrough`,
        snippet: `With impressive form shown in recent floor events, pundits are tipping ${playerName} (Rank #${playerRank}) as one of the circuit's most dangerous unseeded threats.`,
        dateString,
        category: 'ranking',
        relatedPlayerName: playerName,
        week,
      });
    }

    // 3. Tour Circuit Gossip / Upset
    const tourSnippets = [
      {
        headline: 'Shock Upsets Dominate European Tour Qualifiers',
        snippet: 'Several top 10 seeds suffered surprise first-round exits yesterday, opening the bracket for rising tour talents.',
        category: 'circuit' as NewsCategory,
      },
      {
        headline: 'Nine-Dart Fever Sweeps the Practice Floor',
        snippet: 'Reports from the practice room indicate players are clocking record checkout percentages ahead of the weekend knockout.',
        category: 'circuit' as NewsCategory,
      },
      {
        headline: 'Target & Winmau Reveal 2026 Tungsten Barrel Innovations',
        snippet: 'Manufacturers unveil new precision-milled grip profiles offering higher aerodynamic stability and tighter Treble grouping.',
        category: 'sponsor' as NewsCategory,
      },
    ];

    const extra = tourSnippets[(week - 1) % tourSnippets.length];
    articles.push({
      id: `news-${week}-extra`,
      headline: extra.headline,
      snippet: extra.snippet,
      dateString,
      category: extra.category,
      week,
    });

    return articles;
  }
}
