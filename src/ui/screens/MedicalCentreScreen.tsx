import React, { useState } from 'react';
import { CareerManager } from '../../core/career/CareerManager';
import { Player } from '../../core/player/Player';
import { MedicalManager, TreatmentType, TREATMENT_OPTIONS, TreatmentResult } from '../../core/injury/MedicalManager';
import { INJURY_DEFINITIONS } from '../../core/injury/Injury';
import {
  ArrowLeft, Activity, Heart, ShieldAlert, Sparkles, Zap, CheckCircle2,
  AlertTriangle, Brain, Stethoscope, Clock, Battery, History, User
} from 'lucide-react';

interface MedicalCentreScreenProps {
  career: CareerManager;
  onBack: () => void;
  onSave?: () => void;
}

export const MedicalCentreScreen: React.FC<MedicalCentreScreenProps> = ({
  career,
  onBack,
  onSave
}) => {
  const is2P = career.isTwoPlayer && career.players.length > 1;
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activePlayer = career.players[selectedIdx] || career.player;

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const currentMonth = career.calendar.currentMonth;
  const currentYear = career.calendar.currentYear;

  const handleApplyTreatment = (treatmentId: TreatmentType, targetInjuryId?: string) => {
    const res: TreatmentResult = MedicalManager.applyTreatment(
      activePlayer,
      treatmentId,
      targetInjuryId,
      currentMonth,
      currentYear
    );
    if (res.success) {
      setNotification({ message: res.message, type: 'success' });
      if (onSave) onSave();
    } else {
      setNotification({ message: res.message, type: 'error' });
    }
  };

  const fatigue = activePlayer.state.fatigue;
  const getFatigueColor = (f: number) => {
    if (f < 30) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (f < 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (f < 80) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getFatigueLabel = (f: number) => {
    if (f < 30) return 'Peak Match Readiness';
    if (f < 60) return 'Moderate Muscle Strain';
    if (f < 80) return 'Elevated Fatigue (Injury Risk High)';
    return 'Exhaustion (Severe Breakdown Risk)';
  };

  const treatments = Object.values(TREATMENT_OPTIONS);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Glassmorphic Navigation Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase">
              <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
              <span>Sports Science, Physio & Rehabilitation Centre</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide pt-1">
              MEDICAL & PERFORMANCE CLINIC
            </h2>
          </div>
        </div>

        {/* 2-Player Switcher */}
        {is2P && (
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl shadow-inner">
            {career.players.map((p, idx) => {
              const isSelected = idx === selectedIdx;
              const hasInjury = p.hasActiveInjury;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(idx);
                    setNotification(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? idx === 0
                        ? 'bg-amber-500 text-black shadow-md font-black'
                        : 'bg-purple-500 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>{p.name.split(' ')[0]}</span>
                  {hasInjury && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Physical Condition & Active Injury Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fatigue & Stamina Gauge */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Battery className="w-4 h-4 text-amber-400" />
              Physical Arm Strain
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getFatigueColor(fatigue)}`}>
              {fatigue}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-black/40 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fatigue < 30 ? 'bg-emerald-500' : fatigue < 60 ? 'bg-amber-500' : fatigue < 80 ? 'bg-orange-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, fatigue))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              Status: <strong className="text-white">{getFatigueLabel(fatigue)}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Stamina: <strong className="text-white">{activePlayer.attributes.stamina}</strong></span>
            <span>Confidence: <strong className="text-white">{activePlayer.state.confidence}%</strong></span>
          </div>
        </div>

        {/* Active Injury Diagnostic Card */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              Diagnostic Clinical Scan
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Medical Funds: <strong className="text-emerald-400">£{activePlayer.bankBalance.toLocaleString()}</strong>
            </span>
          </div>

          {!activePlayer.hasActiveInjury ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Clean Bill of Health</h4>
                <p className="text-xs text-slate-400">
                  {activePlayer.name} has no diagnosed arm or shoulder injuries. Musculoskeletal status clear for competitive tour play.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlayer.activeInjuries.map((injury) => (
                <div
                  key={injury.id}
                  className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-white text-sm">{injury.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
                        {injury.severity}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-rose-300 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {injury.weeksRemaining} week(s) recovery
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {injury.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Treatment & Recovery Suites */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">
            CLINICAL PROCEDURES
          </span>
          <h3 className="text-lg font-black text-white">
            Rehabilitation & Recovery Suites
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {treatments.map((treatment) => {
            const canAfford = activePlayer.bankBalance >= treatment.cost;

            return (
              <div
                key={treatment.id}
                className="bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                      {treatment.id.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      £{treatment.cost.toLocaleString()}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white">
                    {treatment.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                    {treatment.description}
                  </p>

                  <div className="mt-3 p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-amber-300 font-mono">
                    ⚡ -{treatment.fatigueRestored}% Fatigue
                    {treatment.durationReductionWeeks > 0 && ` • -${treatment.durationReductionWeeks}w Injury Recovery`}
                    {treatment.confidenceBonus > 0 && ` • +${treatment.confidenceBonus} Confidence`}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleApplyTreatment(treatment.id as TreatmentType)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-black font-bold text-xs transition-colors shadow"
                  >
                    Administer Procedure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
