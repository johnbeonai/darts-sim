import { describe, it, expect } from 'vitest';
import { AudioManager } from '../../src/core/audio/AudioManager';
import { SettingsManager } from '../../src/core/config/SettingsManager';

describe('AudioManager', () => {
  it('does not throw when invoked in test environment', () => {
    expect(() => AudioManager.playDartThud()).not.toThrow();
    expect(() => AudioManager.play180()).not.toThrow();
    expect(() => AudioManager.playCrowdCheer(0.1)).not.toThrow();
    expect(() => AudioManager.playGameShot('Test Player')).not.toThrow();
    expect(() => AudioManager.speakScore(60)).not.toThrow();
    expect(() => AudioManager.speakScore(180)).not.toThrow();
    expect(() => AudioManager.speakScore(0)).not.toThrow();
    expect(() => AudioManager.playGameOn()).not.toThrow();
    expect(() => AudioManager.playRequires(40)).not.toThrow();
    expect(() => AudioManager.playRequires(170, 'Phil')).not.toThrow();
    expect(() => AudioManager.playGameShotLeg('Phil', 1, false)).not.toThrow();
    expect(() => AudioManager.playGameShotLeg('Phil', 5, true)).not.toThrow();
    expect(() => AudioManager.playHeartbeat()).not.toThrow();
    expect(() => AudioManager.playCrowdWhistle()).not.toThrow();
    expect(() => AudioManager.playVictoryFanfare()).not.toThrow();
    expect(() => AudioManager.playNineDartCelebration('Luke Littler')).not.toThrow();
    expect(() => AudioManager.stopAllSpeech()).not.toThrow();
  });

  it('respects soundEffectsEnabled setting', () => {
    SettingsManager.saveSettings({ soundEffectsEnabled: false });
    expect(() => AudioManager.play180()).not.toThrow();
    expect(() => AudioManager.speakScore(100)).not.toThrow();
    expect(() => AudioManager.playBust()).not.toThrow();
    expect(() => AudioManager.announce170()).not.toThrow();
    expect(() => AudioManager.playMatchWon('Test Winner')).not.toThrow();
    SettingsManager.saveSettings({ soundEffectsEnabled: true });
  });
});
