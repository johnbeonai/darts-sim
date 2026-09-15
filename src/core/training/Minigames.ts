export type MinigameType = 'around_the_clock' | 'bobs_27';

export interface MinigameResult {
  score: number;
  xpEarned: number;
  formChange: number;
  success: boolean;
}

export class MinigameManager {
  public static calculateBobs27Result(finalScore: number): MinigameResult {
    // Start at 27. Throw at doubles 1-20 + Bull. 
    // Hit: Add double value. Miss: Subtract double value.
    const success = finalScore > 27;
    const xp = Math.max(0, finalScore * 2);
    const form = finalScore > 100 ? 5 : finalScore > 27 ? 2 : -2;

    return { score: finalScore, xpEarned: xp, formChange: form, success };
  }

  public static calculateAroundTheClockResult(dartsUsed: number): MinigameResult {
    // Hit 1-20 + Bull in order. Perfect = 21 darts.
    // The fewer darts, the better.
    const success = dartsUsed <= 50; // generous cutoff
    const baseXP = 500;
    const bonus = Math.max(0, (50 - dartsUsed) * 20);
    const xp = success ? baseXP + bonus : 100;
    const form = dartsUsed <= 25 ? 5 : dartsUsed <= 35 ? 2 : -2;

    return { score: dartsUsed, xpEarned: xp, formChange: form, success };
  }
}
