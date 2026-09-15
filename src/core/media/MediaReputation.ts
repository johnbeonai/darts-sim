export interface MediaProfile {
  reputation: number; // 0-100, 50 is neutral
  relationshipWithPundits: number; // 0-100
  fanFavorability: number; // 0-100
  recentHeadlines: string[];
}

export class MediaManager {
  public static getDefaultProfile(): MediaProfile {
    return {
      reputation: 50,
      relationshipWithPundits: 50,
      fanFavorability: 50,
      recentHeadlines: []
    };
  }

  public static addHeadline(profile: MediaProfile, headline: string) {
    profile.recentHeadlines.unshift(headline);
    if (profile.recentHeadlines.length > 5) {
      profile.recentHeadlines.pop();
    }
  }

  public static adjustReputation(profile: MediaProfile, amount: number) {
    profile.reputation = Math.min(100, Math.max(0, profile.reputation + amount));
  }
}
