import { SettingsManager } from '../config/SettingsManager';

/**
 * Universal Offline Audio Engine
 * Uses Web Audio API synthesis for crowd noise and dartboard thuds,
 * and Web Speech Synthesis for the classic British darts referee "ONE HUNDRED AND EIGHTY!" call.
 */
export class AudioManager {
  private static audioCtx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Classic authentic darts board thud (sisal impact)
   */
  public static playDartThud(): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled || !settings.boardThudEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const masterVol = settings.masterVolume / 100;
      const now = ctx.currentTime;

      // Deep, quick impact frequency drop (120Hz down to 30Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(0.6 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio playback not allowed or supported', e);
    }
  }

  /**
   * Synthesizes authentic crowd cheer roar
   */
  public static playCrowdCheer(duration: number = 2.5): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink noise synthesis for crowd applause
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter to sculpt crowd tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.8;

      const gain = ctx.createGain();
      const masterVol = settings.masterVolume / 100;
      const now = ctx.currentTime;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4 * masterVol, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (e) {
      console.warn('Crowd audio error', e);
    }
  }

  /**
   * Universal speech synthesis helper for referee callouts
   */
  public static speak(text: string, options?: { rate?: number; pitch?: number; volumeMultiplier?: number; cancelPrevious?: boolean }): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (options?.cancelPrevious !== false) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
        const vol = (settings.masterVolume / 100) * (options?.volumeMultiplier ?? 1.0);
        utterance.volume = Math.min(1.0, Math.max(0, vol));

        // Prefer British English voice for authentic professional referee feel
        const voices = window.speechSynthesis.getVoices();
        const britishVoice = voices.find(v =>
          v.lang === 'en-GB' || v.lang.includes('GB') || v.name.includes('UK') || v.name.includes('British')
        );
        if (britishVoice) {
          utterance.voice = britishVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error', e);
      }
    }
  }

  /**
   * The Classic "ONE HUNDRED AND EIGHTY!" Announcement!
   * Combines an emphatic British referee cry with explosive crowd applause.
   */
  public static play180(): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled || !settings.announcer180Enabled) return;

    this.playCrowdCheer(3.0);
    this.speak('ONE HUNDRED AND EIGHTY!', { rate: 0.95, pitch: 1.25, volumeMultiplier: 1.2 });
  }

  /**
   * Announces total score from 3 throws with authentic PDC caller cadence
   */
  public static speakScore(score: number): void {
    if (score === 180) {
      this.play180();
      return;
    }
    if (score <= 0) {
      this.speak('No score', { rate: 1.0, pitch: 0.95 });
      return;
    }
    if (score === 140) {
      this.speak('Ton forty!', { rate: 1.02, pitch: 1.15, volumeMultiplier: 1.15 });
      return;
    }
    if (score === 100) {
      this.speak('Ton!', { rate: 1.05, pitch: 1.12, volumeMultiplier: 1.1 });
      return;
    }
    if (score === 26) {
      this.speak('Twenty-six', { rate: 1.0, pitch: 0.95 });
      return;
    }
    if (score === 60) {
      this.speak('Sixty', { rate: 1.0, pitch: 1.05 });
      return;
    }
    if (score === 45) {
      this.speak('Forty-five', { rate: 1.0, pitch: 1.0 });
      return;
    }
    if (score === 41) {
      this.speak('Forty-one', { rate: 1.0, pitch: 1.0 });
      return;
    }
    this.speak(`${score}`, { rate: 1.0, pitch: 1.05 });
  }

  /**
   * Announces "Bust!" when a player busts at the doubles or overscores
   */
  public static playBust(): void {
    this.speak('Bust!', { rate: 1.05, pitch: 1.15, volumeMultiplier: 1.1 });
  }

  /**
   * Announces remaining score before throw when 170 remains
   */
  public static announce170(): void {
    this.speak('You require 170', { rate: 0.95, pitch: 1.1, volumeMultiplier: 1.15 });
  }

  /**
   * Heartbeat thud pulse for Tension Cam / high-pressure match darts
   */
  public static playHeartbeat(volumeMultiplier: number = 1.0): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterVol = (settings.masterVolume / 100) * volumeMultiplier;

      // Lub (first thump)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);
      gain1.gain.setValueAtTime(0.5 * masterVol, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Dub (second thump, slightly quieter and 150ms later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(70, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      gain2.gain.setValueAtTime(0.35 * masterVol, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.warn('Heartbeat audio error', e);
    }
  }

  /**
   * Crowd gasp reaction when a wire is struck or critical double is missed
   */
  public static playCrowdGasp(): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const duration = 0.8;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850;
      filter.Q.value = 2.0;

      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const masterVol = settings.masterVolume / 100;

      gain.gain.setValueAtTime(0.05 * masterVol, now);
      gain.gain.linearRampToValueAtTime(0.3 * masterVol, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn('Gasp audio error', e);
    }
  }

  /**
   * Announces "Game on!" at the start of a match
   */
  public static playGameOn(): void {
    this.speak('Game on!', { rate: 1.05, pitch: 1.15, volumeMultiplier: 1.2 });
  }

  /**
   * Announces "You require [score]" when stepping to the oche on a finish <= 170
   */
  public static playRequires(score: number, playerName?: string): void {
    if (score > 170 || score <= 1) return;
    const prefix = playerName ? `${playerName}, you require` : 'You require';
    this.speak(`${prefix} ${score}`, { rate: 1.0, pitch: 1.05, volumeMultiplier: 1.1 });
  }

  /**
   * Announces leg victory with proper referee cadence
   */
  public static playGameShotLeg(winnerName: string, legNumber?: number, isDecidingLeg?: boolean): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    this.playCrowdCheer(2.2);
    if (isDecidingLeg) {
      this.speak(`Game shot, and the match! ${winnerName}!`, { rate: 0.95, pitch: 1.2, volumeMultiplier: 1.25 });
    } else {
      this.speak(`Game shot, ${winnerName}!`, { rate: 1.0, pitch: 1.1, volumeMultiplier: 1.1 });
    }
  }

  /**
   * Game shot announcer for non-deciding legs
   */
  public static playGameShot(winnerName: string): void {
    this.playGameShotLeg(winnerName);
  }

  /**
   * Announces match winner: "(the winning player's name) wins!"
   */
  public static playMatchWon(winnerName: string): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    this.playCrowdCheer(3.5);
    this.speak(`Game shot, and the match! ${winnerName}!`, { rate: 0.95, pitch: 1.2, volumeMultiplier: 1.25 });
  }

  /**
   * Tension crowd whistle before high-stakes match darts
   */
  public static playCrowdWhistle(): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const masterVol = settings.masterVolume / 100;

      osc.type = 'sine';
      // Classic ascending and fluttering arena whistle
      osc.frequency.setValueAtTime(2100, now);
      osc.frequency.exponentialRampToValueAtTime(2850, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25 * masterVol, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Whistle audio error', e);
    }
  }

  /**
   * Iconic "Chase the Sun" style celebratory brass fanfare synthesized via Web Audio API
   */
  public static playVictoryFanfare(): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const masterVol = (settings.masterVolume / 100) * 0.35;
      const now = ctx.currentTime;

      // Celebratory melody notes: [freq, duration, delay]
      const notes = [
        { f: 659.25, d: 0.14, t: 0.00 }, // E5
        { f: 659.25, d: 0.14, t: 0.16 }, // E5
        { f: 783.99, d: 0.20, t: 0.32 }, // G5
        { f: 739.99, d: 0.20, t: 0.54 }, // F#5
        { f: 659.25, d: 0.28, t: 0.76 }, // E5
        { f: 587.33, d: 0.20, t: 1.06 }, // D5
        { f: 659.25, d: 0.45, t: 1.28 }  // E5
      ];

      for (const n of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = n.f;

        filter.type = 'lowpass';
        filter.frequency.value = 1600;
        filter.Q.value = 3.0;

        const start = now + n.t;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(masterVol, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + n.d);
      }
    } catch (e) {
      console.warn('Victory fanfare audio error', e);
    }
  }

  /**
   * Explosive 9-Darter Broadcast Pandemonium Audio
   */
  public static playNineDartCelebration(playerName: string): void {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEffectsEnabled) return;

    this.playCrowdCheer(5.0);
    this.playVictoryFanfare();
    this.speak(`NINE DART FINISH! ABSOLUTE SCENES! ${playerName} HAS DONE IT!`, {
      rate: 1.05,
      pitch: 1.3,
      volumeMultiplier: 1.3
    });
  }

  /**
   * Cancels any active speech synthesis queue (e.g. when exiting match)
   */
  public static stopAllSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}
