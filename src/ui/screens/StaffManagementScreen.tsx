import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { CareerManager } from '../../core/career/CareerManager';
import {
  StaffManager,
  StaffMember,
  STAFF_CATALOG,
  StaffRole
} from '../../core/finance/StaffManager';
import {
  ArrowLeft, Users, CheckCircle2, ShieldAlert, Sparkles,
  UserMinus, UserCheck, Award, Briefcase, GraduationCap, Clock, Globe, HeartPulse, Brain, Target, User
} from 'lucide-react';

interface StaffManagementScreenProps {
  career: CareerManager;
  onBack: () => void;
  onSave: () => void;
}

// Realistic SVG Portraits for Support Staff Specialists
const StaffAvatar: React.FC<{ avatarKey: string; className?: string }> = ({ avatarKey, className = "w-20 h-20" }) => {
  switch (avatarKey) {
    case 'coach_dave':
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#1e293b" />
          <circle cx="50" cy="40" r="35" fill="#334155" opacity="0.6" />
          <path d="M 15 100 L 25 72 L 50 78 L 75 72 L 85 100 Z" fill="#1e3a8a" />
          <path d="M 40 76 L 50 88 L 60 76 Z" fill="#ffffff" />
          <path d="M 25 72 L 35 100" stroke="#ffffff" strokeWidth="2" />
          <path d="M 75 72 L 65 100" stroke="#ffffff" strokeWidth="2" />
          <rect x="42" y="60" width="16" height="16" fill="#fbcfe8" rx="3" />
          <ellipse cx="50" cy="46" rx="19" ry="23" fill="#fed7aa" />
          <path d="M 31 42 C 31 26, 69 26, 69 42 C 67 30, 33 30, 31 42 Z" fill="#94a3b8" />
          <path d="M 30 42 L 32 52 L 35 48 Z" fill="#94a3b8" />
          <path d="M 70 42 L 68 52 L 65 48 Z" fill="#94a3b8" />
          <circle cx="43" cy="44" r="2.2" fill="#1e293b" />
          <circle cx="57" cy="44" r="2.2" fill="#1e293b" />
          <path d="M 43 57 Q 50 62 57 57" stroke="#9a3412" strokeWidth="1.6" fill="none" />
          <circle cx="28" cy="85" r="4" fill="#f59e0b" />
          <circle cx="28" cy="85" r="2" fill="#ffffff" />
        </svg>
      );
    case 'coach_simon':
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#0f172a" />
          <circle cx="50" cy="40" r="35" fill="#1e293b" opacity="0.6" />
          <path d="M 12 100 L 24 68 L 50 74 L 76 68 L 88 100 Z" fill="#0f766e" />
          <rect x="42" y="58" width="16" height="18" fill="#fcd34d" opacity="0.8" rx="2" />
          <ellipse cx="50" cy="44" rx="18" ry="22" fill="#fde68a" />
          <path d="M 32 38 C 32 24, 68 24, 68 38 C 66 28, 34 28, 32 38 Z" fill="#cbd5e1" />
          <rect x="36" y="39" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="#0284c7" strokeWidth="1.4" />
          <rect x="52" y="39" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="#0284c7" strokeWidth="1.4" />
          <line x1="48" y1="43" x2="52" y2="43" stroke="#0284c7" strokeWidth="1.4" />
          <circle cx="42" cy="43" r="1.8" fill="#0f172a" />
          <circle cx="58" cy="43" r="1.8" fill="#0f172a" />
          <path d="M 46 56 C 46 64, 54 64, 54 56 Z" fill="#94a3b8" />
        </svg>
      );
    case 'physio_sarah':
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#0c4a6e" />
          <circle cx="50" cy="42" r="35" fill="#0284c7" opacity="0.3" />
          <path d="M 12 100 L 25 68 L 50 74 L 75 68 L 88 100 Z" fill="#ffffff" />
          <path d="M 40 72 L 50 88 L 60 72 Z" fill="#0284c7" />
          <rect x="43" y="58" width="14" height="16" fill="#ffedd5" rx="3" />
          <ellipse cx="50" cy="43" rx="17" ry="21" fill="#fed7aa" />
          <path d="M 32 40 C 30 22, 70 22, 68 40 C 65 27, 35 27, 32 40 Z" fill="#9a3412" />
          <ellipse cx="43" cy="42" rx="2" ry="2.2" fill="#1e293b" />
          <ellipse cx="57" cy="42" rx="2" ry="2.2" fill="#1e293b" />
          <path d="M 44 54 Q 50 59 56 54" stroke="#be123c" strokeWidth="1.6" fill="none" />
        </svg>
      );
    case 'physio_marcus':
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#18181b" />
          <circle cx="50" cy="40" r="35" fill="#3b82f6" opacity="0.25" />
          <path d="M 14 100 L 24 68 L 50 74 L 76 68 L 86 100 Z" fill="#334155" />
          <rect x="43" y="58" width="14" height="16" fill="#fed7aa" rx="2" />
          <ellipse cx="50" cy="43" rx="18" ry="22" fill="#fcd34d" />
          <path d="M 32 38 C 32 23, 68 23, 68 38 C 65 27, 35 27, 32 38 Z" fill="#1e293b" />
          <circle cx="43" cy="42" r="2.2" fill="#0f172a" />
          <circle cx="57" cy="42" r="2.2" fill="#0f172a" />
          <path d="M 36 46 C 36 65, 64 65, 64 46 C 60 58, 40 58, 36 46 Z" fill="#1e293b" opacity="0.85" />
        </svg>
      );
    case 'psych_clara':
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#4c1d95" />
          <circle cx="50" cy="42" r="35" fill="#a855f7" opacity="0.3" />
          <path d="M 15 100 L 26 70 L 50 72 L 74 70 L 85 100 Z" fill="#18181b" />
          <rect x="41" y="58" width="18" height="16" fill="#27272a" rx="4" />
          <ellipse cx="50" cy="43" rx="17" ry="21" fill="#fed7aa" />
          <path d="M 31 42 C 28 20, 72 20, 69 42 C 73 56, 68 62, 66 62 C 64 46, 68 28, 50 28 C 32 28, 36 46, 34 62 C 32 62, 27 56, 31 42 Z" fill="#1f2937" />
          <ellipse cx="44" cy="42" rx="2.2" ry="2.4" fill="#1e293b" />
          <ellipse cx="56" cy="42" rx="2.2" ry="2.4" fill="#1e293b" />
          <path d="M 45 53 Q 50 57 55 53" stroke="#991b1b" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'psych_mercer':
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#1e1b4b" />
          <circle cx="50" cy="40" r="35" fill="#4338ca" opacity="0.3" />
          <path d="M 12 100 L 24 68 L 50 74 L 76 68 L 88 100 Z" fill="#1e293b" />
          <rect x="42" y="58" width="16" height="16" fill="#fed7aa" rx="2" />
          <ellipse cx="50" cy="44" rx="18" ry="22" fill="#fed7aa" />
          <circle cx="43" cy="43" r="2.2" fill="#1e293b" />
          <circle cx="57" cy="43" r="2.2" fill="#1e293b" />
          <path d="M 44 55 Q 50 59 56 55" stroke="#9a3412" strokeWidth="1.5" fill="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-2xl shadow-md overflow-hidden bg-neutral-900 border border-neutral-700`}>
          <rect width="100" height="100" fill="#1e293b" />
          <circle cx="50" cy="42" r="35" fill="#0284c7" opacity="0.3" />
          <path d="M 15 100 L 25 72 L 50 78 L 75 72 L 85 100 Z" fill="#334155" />
          <rect x="42" y="60" width="16" height="16" fill="#fed7aa" rx="3" />
          <ellipse cx="50" cy="45" rx="18" ry="22" fill="#fed7aa" />
          <circle cx="43" cy="44" r="2.2" fill="#1e293b" />
          <circle cx="57" cy="44" r="2.2" fill="#1e293b" />
        </svg>
      );
  }
};

export const StaffManagementScreen: React.FC<StaffManagementScreenProps> = ({
  career,
  onBack,
  onSave
}) => {
  const [, setRenderTick] = useState(0);
  const forceUpdate = () => setRenderTick(t => t + 1);

  const is2P = career.isTwoPlayer;
  const p1 = career.players[0];
  const p2 = is2P && career.players.length > 1 ? career.players[1] : null;

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(career.activePlayerIndex);
  const activePlayer: Player = selectedPlayerIndex === 0 ? p1 : (p2 || p1);

  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleHire = (staffId: string) => {
    const res = StaffManager.hireStaff(activePlayer, staffId, activePlayer.hiredStaffIds);
    if (res.success) {
      career.addLog({
        week: career.calendar.currentWeek,
        year: career.calendar.currentYear,
        title: `🤝 Support Team: ${activePlayer.name}`,
        description: res.message,
        type: 'training'
      });
      showNotification(res.message, 'success');
      onSave();
      forceUpdate();
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleDismiss = (staffId: string) => {
    const res = StaffManager.dismissStaff(staffId, activePlayer.hiredStaffIds);
    showNotification(res.message, 'success');
    onSave();
    forceUpdate();
  };

  const hiredStaff = STAFF_CATALOG.filter(s => activePlayer.hiredStaffIds?.includes(s.id));
  const totalWeeklyPayroll = hiredStaff.reduce((sum, s) => sum + s.weeklySalary, 0);

  const availableStaff = STAFF_CATALOG.filter(s => {
    if (roleFilter === 'all') return true;
    return s.role === roleFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Glassmorphic Navigation Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow"
            title="Return to Career Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>High-Performance Support Staff & Coaches</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide pt-1">
              SUPPORT STAFF TEAM
            </h2>
          </div>
        </div>

        {/* 2-Player Switcher */}
        {is2P && p2 && (
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setSelectedPlayerIndex(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedPlayerIndex === 0
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{p1.name}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlayerIndex(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedPlayerIndex === 1
                  ? 'bg-purple-500 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{p2.name}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notice && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
          notice.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500 text-rose-200'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Payroll Overview Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Team</span>
            <div className="text-lg font-black text-white">
              {hiredStaff.length} Specialist{hiredStaff.length === 1 ? '' : 's'} Under Contract
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Payroll</span>
            <span className="font-mono font-black text-rose-400 text-lg">
              -£{totalWeeklyPayroll.toLocaleString()}/wk
            </span>
          </div>
          <div className="text-right pl-4 border-l border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Funds</span>
            <span className="font-mono font-black text-emerald-400 text-lg">
              £{activePlayer.bankBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-white/10 p-1.5 rounded-xl w-fit overflow-x-auto">
        {(['all', 'coach', 'physio', 'psychologist', 'manager'] as const).map(role => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(role)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              roleFilter === role
                ? 'bg-amber-500 text-black shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {role === 'all' ? 'All Specialists' : role}
          </button>
        ))}
      </div>

      {/* Staff Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableStaff.map(staff => {
          const isHired = activePlayer.hiredStaffIds?.includes(staff.id);
          const canAfford = activePlayer.bankBalance >= staff.weeklySalary;

          return (
            <div
              key={staff.id}
              className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 ${
                isHired
                  ? 'border-emerald-500/60 ring-1 ring-emerald-500/30 bg-emerald-950/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <StaffAvatar avatarKey={staff.avatarKey || 'coach_dave'} className="w-20 h-20 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                      {staff.role} • Tier: {staff.tierRequired}
                    </span>
                    {isHired && (
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        ✓ On Team
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white truncate">
                    {staff.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {staff.description}
                  </p>
                </div>
              </div>

              {/* Specialist Attributes & Financials */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-amber-300 font-medium">
                  ⭐ <strong className="text-white">Perk:</strong> {staff.perkSummary}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Weekly Retainer / Salary: </span>
                    <span className="font-mono font-bold text-rose-400">£{staff.weeklySalary.toLocaleString()}/wk</span>
                  </div>

                  {isHired ? (
                    <button
                      type="button"
                      onClick={() => handleDismiss(staff.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors"
                    >
                      Release
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleHire(staff.id)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-bold text-xs transition-colors shadow"
                    >
                      Hire Specialist
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
