import React, { useState } from 'react';
import { SettingsManager, GameSettings } from '../../core/config/SettingsManager';
import { AudioManager } from '../../core/audio/AudioManager';
import { SaveManager } from '../../storage/SaveManager';
import {
  Volume2, VolumeX, Sliders, Target, Eye, Clock,
  ArrowLeft, CheckCircle2, RotateCcw, Megaphone, Trash2
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<GameSettings>(() => SettingsManager.getSettings());
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const update = (partial: Partial<GameSettings>) => {
    const updated = SettingsManager.saveSettings(partial);
    setSettings({ ...updated });
    setSavedNotice('Settings updated');
    setTimeout(() => setSavedNotice(null), 2000);
  };

  const handleTest180 = () => {
    AudioManager.play180();
  };

  const handleTestThud = () => {
    AudioManager.playDartThud();
  };

  const handleClearSaves = () => {
    if (confirm('Are you sure you want to delete all 4 career save slots? This will reset all careers.')) {
      SaveManager.clearAll();
      alert('All save slots have been cleared.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Game Settings</h2>
            <p className="text-xs text-neutral-400">Audio, keypad preferences, and match configuration</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      {savedNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Section 1: Audio Settings */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Sound & Announcements
        </h3>

        {/* Master Volume */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-300">Master Volume</span>
            <span className="font-mono text-amber-400 font-bold">{settings.masterVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume}
            onChange={(e) => update({ masterVolume: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Audio Toggles & Test Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-white">Classic "180!" Shout</span>
              <span className="text-[11px] text-neutral-500">Referee voice & crowd roar</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTest180}
                className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                title="Preview sound"
              >
                <Megaphone className="w-3 h-3" />
                Test
              </button>
              <input
                type="checkbox"
                checked={settings.announcer180Enabled}
                onChange={(e) => update({ announcer180Enabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-white">Dart Impact Thud</span>
              <span className="text-[11px] text-neutral-500">Board sisal impact sound</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestThud}
                className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-[11px] font-semibold transition-colors"
                title="Preview sound"
              >
                Thump
              </button>
              <input
                type="checkbox"
                checked={settings.boardThudEnabled}
                onChange={(e) => update({ boardThudEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Keypad & Input Preferences */}
      <div className="space-y-4 pt-2 border-t border-neutral-800/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Oche Keypad & Scoring
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Default Entry Mode */}
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1.5">
            <label className="block text-xs font-bold text-white">Default Entry Mode</label>
            <select
              value={settings.defaultEntryMode}
              onChange={(e) => update({ defaultEntryMode: e.target.value as any })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-white"
            >
              <option value="precision_throw">Virtual Oche (On-Screen Interactive Throw)</option>
              <option value="keypad">Dart-by-Dart Keypad (Hybrid Manual)</option>
              <option value="quick">Quick Visit Total (Real Dartboard)</option>
            </select>
          </div>

          {/* Checkout Guide Display */}
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1.5">
            <label className="block text-xs font-bold text-white">Checkout Suggestions</label>
            <select
              value={settings.showCheckoutGuide}
              onChange={(e) => update({ showCheckoutGuide: e.target.value as any })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-white"
            >
              <option value="checkout_only">When in Finish Territory (170 or lower)</option>
              <option value="always">Always Visible</option>
              <option value="never">Hide Checkout Routes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: CPU Cadence */}
      <div className="space-y-4 pt-2 border-t border-neutral-800/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Opponent Simulation Speed
        </h3>

        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'fast', label: 'Fast (200ms)', desc: 'Instant throws' },
              { id: 'normal', label: 'Normal (600ms)', desc: 'Balanced' },
              { id: 'broadcast', label: 'Broadcast (1.2s)', desc: 'TV match rhythm' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ cpuSpeed: s.id as any })}
                className={`p-2.5 rounded-xl border text-center transition-all ${settings.cpuSpeed === s.id ? 'bg-amber-500/10 border-amber-500 text-white shadow-md' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'}`}
              >
                <span className="block font-bold text-xs">{s.label}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Data & Save Management */}
      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-400 block">Clear Saved Data</span>
          <span className="text-[11px] text-neutral-600">Erase all 4 career playthroughs</span>
        </div>
        <button
          type="button"
          onClick={handleClearSaves}
          className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 border border-rose-800/50 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Reset All Slots
        </button>
      </div>
    </div>
  );
};
