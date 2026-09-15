import { Player } from '../player/Player';
import { HeadToHeadRecord } from '../rivalry/RivalryManager';

export interface PressAnswerOption {
  id: string;
  tone: 'confident' | 'humble' | 'focused' | 'defiant';
  label: string;
  statement: string;
  effects: {
    confidenceDelta: number;
    formDelta: number;
    fatigueDelta?: number;
    rivalryHeatDelta?: number;
    sponsorPraise?: string;
  };
}

export interface PressQuestion {
  id: string;
  journalistName: string;
  mediaOutlet: string;
  question: string;
  contextTag: 'blowout_win' | 'deciding_thriller' | 'rivalry_clash' | 'tough_loss' | 'doubles_struggle' | 'standard';
  options: PressAnswerOption[];
}

export interface MatchPressContext {
  won: boolean;
  playerAvg: number;
  opponentAvg: number;
  isDecidingLeg: boolean;
  isRivalry: boolean;
  rivalryRecord?: HeadToHeadRecord | null;
  opponentName: string;
  tournamentName: string;
  doublesAttempted: number;
  doublesHit: number;
}

export class PressConferenceManager {
  /**
   * Generates 2-3 engaging press conference questions based on the live match results
   */
  public static generateQuestions(context: MatchPressContext): PressQuestion[] {
    const questions: PressQuestion[] = [];

    // 1. PRIMARY MATCH OUTCOME QUESTION
    if (context.won && context.isDecidingLeg) {
      questions.push({
        id: 'thriller_win',
        journalistName: 'Dan Dawson',
        mediaOutlet: 'Sky Sports Darts',
        question: `What a battle! You were taken right to the wire in that deciding leg before pinning the winning double. How did you handle the immense pressure?`,
        contextTag: 'deciding_thriller',
        options: [
          {
            id: 'thriller_ice',
            tone: 'confident',
            label: 'Ice in the Veins',
            statement: `I thrive under pressure. When the arena is screaming, that's when my arm feels steadiest.`,
            effects: { confidenceDelta: 8, formDelta: 3, rivalryHeatDelta: 10, sponsorPraise: 'Fans love the clutch bravado!' },
          },
          {
            id: 'thriller_respect',
            tone: 'humble',
            label: 'Credit to Opponent',
            statement: `Full respect to ${context.opponentName}. It could have gone either way and I feel fortunate to cross the line.`,
            effects: { confidenceDelta: 4, formDelta: 2, fatigueDelta: -5, sponsorPraise: 'Sponsors praise sportsmanship.' },
          },
          {
            id: 'thriller_focused',
            tone: 'focused',
            label: 'Process Driven',
            statement: `I just focused on my breathing and my target. The leg is won, but the tournament isn't over yet.`,
            effects: { confidenceDelta: 5, formDelta: 5, sponsorPraise: 'Professional mindset noted by pundits.' },
          },
        ],
      });
    } else if (context.won && context.playerAvg >= 98) {
      questions.push({
        id: 'blowout_win',
        journalistName: 'Mark Webster',
        mediaOutlet: 'ITV Sport',
        question: `A sensational performance today averaging ${context.playerAvg.toFixed(1)}! Are you currently playing the best darts of your career?`,
        contextTag: 'blowout_win',
        options: [
          {
            id: 'blowout_statement',
            tone: 'confident',
            label: 'Title Statement',
            statement: `I warned everyone in the practice room this week. If I throw like that, nobody in the world beats me.`,
            effects: { confidenceDelta: 10, formDelta: 4, rivalryHeatDelta: 12, sponsorPraise: 'Headline quote going viral!' },
          },
          {
            id: 'blowout_grounded',
            tone: 'humble',
            label: 'Staying Grounded',
            statement: `The scoring flowed naturally today, but averages don't win trophies on their own. One game at a time.`,
            effects: { confidenceDelta: 5, formDelta: 4, sponsorPraise: 'Exemplary maturity highlighted.' },
          },
        ],
      });
    } else if (!context.won && context.isDecidingLeg) {
      questions.push({
        id: 'heartbreak_loss',
        journalistName: 'Rod Studd',
        mediaOutlet: 'The Oche Gazette',
        question: `Heartbreak in the final leg. You were right there with darts to win. How difficult is it to swallow that defeat?`,
        contextTag: 'tough_loss',
        options: [
          {
            id: 'loss_defiant',
            tone: 'defiant',
            label: 'We Go Again',
            statement: `It stings tonight, but this only adds fuel to the fire. I will be back stronger next week.`,
            effects: { confidenceDelta: 4, formDelta: 3, sponsorPraise: 'Resilience commended by board.' },
          },
          {
            id: 'loss_honest',
            tone: 'focused',
            label: 'Back to the Board',
            statement: `I didn't take my chances at the wire and that's darts. I'll be on the practice board first thing tomorrow.`,
            effects: { confidenceDelta: 0, formDelta: 5, sponsorPraise: 'Work ethic applauded by coach.' },
          },
          {
            id: 'loss_frustrated',
            tone: 'humble',
            label: 'Gracious in Defeat',
            statement: `${context.opponentName} punished my slip-ups. Fair play to them, they earned it.`,
            effects: { confidenceDelta: -2, formDelta: 1, fatigueDelta: -5 },
          },
        ],
      });
    } else if (!context.won) {
      questions.push({
        id: 'standard_loss',
        journalistName: 'Laura Woods',
        mediaOutlet: 'PDC Insider',
        question: `Things never quite clicked into gear on stage today. What went wrong out there?`,
        contextTag: 'tough_loss',
        options: [
          {
            id: 'loss_determination',
            tone: 'focused',
            label: 'Short Memory',
            statement: `Off-days happen to everyone. I'm wiping the slate clean and focusing immediately on the next tour event.`,
            effects: { confidenceDelta: 2, formDelta: 3 },
          },
          {
            id: 'loss_apology',
            tone: 'humble',
            label: 'Apologetic',
            statement: `I let my standards slip today and I owe the fans a much better showing next time.`,
            effects: { confidenceDelta: -3, formDelta: 4, sponsorPraise: 'Accountability respected by sponsors.' },
          },
        ],
      });
    } else {
      questions.push({
        id: 'routine_win',
        journalistName: 'Stuart Pyke',
        mediaOutlet: 'TalkSport Darts',
        question: `Solid win in the books. How do you assess your rhythm and setup heading deeper into ${context.tournamentName}?`,
        contextTag: 'standard',
        options: [
          {
            id: 'win_rhythm',
            tone: 'confident',
            label: 'Building Momentum',
            statement: `The rhythm felt smooth. I'm clicking with these darts and feeling dangerous.`,
            effects: { confidenceDelta: 6, formDelta: 3 },
          },
          {
            id: 'win_humble',
            tone: 'humble',
            label: 'Job Done',
            statement: `It was a professional performance. Put the win in the pocket and move on.`,
            effects: { confidenceDelta: 4, formDelta: 2 },
          },
        ],
      });
    }

    // 2. RIVALRY OR DOUBLING FOLLOW-UP QUESTION
    if (context.isRivalry && context.rivalryRecord) {
      const h2h = context.rivalryRecord;
      const statusLabel = h2h.status.toUpperCase();
      questions.push({
        id: 'rivalry_question',
        journalistName: 'John McDonald',
        mediaOutlet: 'PDC Stage Correspondent',
        question: `There's clearly no love lost between you and ${context.opponentName} in this ${statusLabel} rivalry. Did the personal needle add extra spice tonight?`,
        contextTag: 'rivalry_clash',
        options: [
          {
            id: 'rivalry_stoke',
            tone: 'defiant',
            label: 'Stoke the Fire',
            statement: `There is definitely needle. We both want to be top dog, and neither of us is taking a backward step.`,
            effects: { confidenceDelta: 6, formDelta: 4, rivalryHeatDelta: 20, sponsorPraise: 'Rivalry storyline generating massive buzz!' },
          },
          {
            id: 'rivalry_diffuse',
            tone: 'humble',
            label: 'Diffuse the Feud',
            statement: `The media loves the drama, but on the oche it's strictly professional darts. Nothing personal.`,
            effects: { confidenceDelta: 3, formDelta: 2, rivalryHeatDelta: -5 },
          },
        ],
      });
    } else if (context.doublesAttempted >= 6 && context.doublesHit / context.doublesAttempted < 0.25) {
      const pct = Math.round((context.doublesHit / context.doublesAttempted) * 100);
      questions.push({
        id: 'doubles_trouble',
        journalistName: 'Wayne Mardle',
        mediaOutlet: 'Sky Sports Analyst',
        question: `You converted just ${pct}% on the outer ring today. Was it dartboard glare, grip issues, or just a rare off-night at the doubles?`,
        contextTag: 'doubles_struggle',
        options: [
          {
            id: 'doubles_working',
            tone: 'focused',
            label: 'Oche Practice',
            statement: `The wire was frustrating me, but my alignment is sound. An extra hour on the double board will sort it.`,
            effects: { confidenceDelta: 2, formDelta: 5 },
          },
          {
            id: 'doubles_brush',
            tone: 'confident',
            label: 'Brush It Off',
            statement: `I won't lose any sleep over it. The scoring was there and the doubles will drop next time.`,
            effects: { confidenceDelta: 4, formDelta: 1 },
          },
        ],
      });
    }

    return questions;
  }

  /**
   * Applies the chosen answer effects directly to the player
   */
  public static applyAnswerEffects(player: Player, option: PressAnswerOption): void {
    player.state.confidence = Math.min(100, Math.max(0, player.state.confidence + option.effects.confidenceDelta));
    player.state.form = Math.min(100, Math.max(0, player.state.form + option.effects.formDelta));

    if (option.effects.fatigueDelta) {
      player.state.fatigue = Math.min(100, Math.max(0, player.state.fatigue + option.effects.fatigueDelta));
    }
  }
}
