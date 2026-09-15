export interface GameSettings {
  masterVolume: number; // 0 to 100
  soundEffectsEnabled: boolean;
  announcer180Enabled: boolean;
  boardThudEnabled: boolean;
  defaultEntryMode: 'precision_throw' | 'keypad' | 'quick';
  autoConfirm3rdDart: boolean;
  showCheckoutGuide: 'always' | 'checkout_only' | 'never';
  cpuSpeed: 'fast' | 'normal' | 'broadcast'; // fast: 200ms, normal: 600ms, broadcast: 1200ms
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  soundEffectsEnabled: true,
  announcer180Enabled: true,
  boardThudEnabled: true,
  defaultEntryMode: 'precision_throw',
  autoConfirm3rdDart: false,
  showCheckoutGuide: 'checkout_only',
  cpuSpeed: 'normal'
};

export class SettingsManager {
  private static readonly STORAGE_KEY = 'darts_career_sim_settings';
  private static currentSettings: GameSettings = { ...DEFAULT_SETTINGS };

  public static getSettings(): GameSettings {
    if (typeof window === 'undefined') return this.currentSettings;

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        this.currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Failed to read settings from localStorage', e);
    }
    return this.currentSettings;
  }

  public static saveSettings(settings: Partial<GameSettings>): GameSettings {
    this.currentSettings = { ...this.getSettings(), ...settings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSettings));
      } catch (e) {
        console.error('Failed to write settings to localStorage', e);
      }
    }
    return this.currentSettings;
  }

  public static getCpuDelayMs(): number {
    const speed = this.getSettings().cpuSpeed;
    if (speed === 'fast') return 200;
    if (speed === 'broadcast') return 1200;
    return 600;
  }
}
