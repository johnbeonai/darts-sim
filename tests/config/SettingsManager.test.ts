import { describe, it, expect } from 'vitest';
import { SettingsManager, DEFAULT_SETTINGS } from '../../src/core/config/SettingsManager';

describe('SettingsManager', () => {
  it('returns default settings when uninitialized', () => {
    const s = SettingsManager.getSettings();
    expect(s.masterVolume).toBe(80);
    expect(s.announcer180Enabled).toBe(true);
    expect(s.soundEffectsEnabled).toBe(true);
  });

  it('updates and persists settings values', () => {
    SettingsManager.saveSettings({ masterVolume: 55, cpuSpeed: 'fast' });
    const s = SettingsManager.getSettings();
    expect(s.masterVolume).toBe(55);
    expect(s.cpuSpeed).toBe('fast');
    expect(SettingsManager.getCpuDelayMs()).toBe(200);
  });
});
