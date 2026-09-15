import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { CareerManager } from '../../core/career/CareerManager';
import {
  SponsorshipManager,
  SponsorshipContract,
  SPONSORSHIP_CATALOG
} from '../../core/finance/SponsorshipManager';
import { STAFF_CATALOG } from '../../core/finance/StaffManager';
import { LIFESTYLE_UPGRADES, LifestyleManager } from '../../core/finance/LifestyleManager';
import { BOUNTIES, SponsorBounty } from '../../core/finance/SponsorBounties';
import {
  ArrowLeft, Award, TrendingUp, TrendingDown, DollarSign,
  CheckCircle2, ShieldAlert, Sparkles, Building2, Calendar, FileText, PieChart, ShieldCheck, Tag, User, Target
} from 'lucide-react';

interface FinancesScreenProps {
  career: CareerManager;
  onBack: () => void;
  onSave: () => void;
}

export const FinancesScreen: React.FC<FinancesScreenProps> = ({
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

  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSignSponsor = (offerId: string) => {
    const res = SponsorshipManager.signContract(activePlayer, offerId, activePlayer.activeSponsorships);
    if (res.success) {
      career.addLog({
        week: career.calendar.currentWeek,
        year: career.calendar.currentYear,
        title: `✍️ Commercial Deal: ${activePlayer.name}`,
        description: res.message,
        type: 'milestone'
      });
      showNotification(res.message, 'success');
      onSave();
      forceUpdate();
    } else {
      showNotification(res.message, 'error');
    }
  };

  const weeklySponsorIncome = (activePlayer.activeSponsorships || []).reduce(
    (sum: number, c) => sum + (c.weeklyStipend || 0),
    0
  );

  const hiredStaffMembers = STAFF_CATALOG.filter(s => (activePlayer.hiredStaffIds || []).includes(s.id));
  const staffCosts = hiredStaffMembers.reduce(
    (sum: number, s) => sum + s.weeklySalary,
    0
  );

  const activeLifestyleUpgrades = (activePlayer.activeLifestyleUpgrades || []).map(id => LIFESTYLE_UPGRADES.find(u => u.id === id)).filter(Boolean) as any[];
  const lifestyleCosts = activeLifestyleUpgrades.reduce(
    (sum: number, u) => sum + u.weeklyUpkeep,
    0
  );

  const netWeekly = weeklySponsorIncome - staffCosts - lifestyleCosts;

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
              <PieChart className="w-3.5 h-3.5 text-amber-400" />
              <span>Commercial Accounts & Sponsorship Bureau</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide pt-1">
              FINANCES & SPONSORS
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

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
            <span>Bank Balance</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            £{activePlayer.bankBalance.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
            Liquid Operating Funds
          </span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
            <span>Weekly Sponsorship</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
            +£{weeklySponsorIncome.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {(activePlayer.activeSponsorships || []).length} Active Contracts
          </span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5">
    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
      <span>Staff & Upkeep</span>
      <TrendingDown className="w-4 h-4 text-rose-400" />
    </div>
    <div className="text-2xl sm:text-3xl font-mono font-black text-rose-400">
      -£{(staffCosts + lifestyleCosts).toLocaleString()}
    </div>
    <span className="text-[10px] text-slate-400 block mt-1">
      {hiredStaffMembers.length} Staff, {activeLifestyleUpgrades.length} Facilities
    </span>
  </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
            <span>Net Weekly Cashflow</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-mono font-black ${netWeekly >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netWeekly >= 0 ? `+£${netWeekly.toLocaleString()}` : `-£${Math.abs(netWeekly).toLocaleString()}`}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Projected Weekly Balance Change
          </span>
        </div>
      </div>

      {/* Commercial Sponsorships Hub */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">
            COMMERCIAL OPPORTUNITIES
          </span>
          <h3 className="text-lg font-black text-white">
            PDC Brand Endorsements & Shirt Sponsors
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPONSORSHIP_CATALOG.map(sponsor => {
            const isSigned = (activePlayer.activeSponsorships || []).some(c => c.id === sponsor.id);
            const rank = activePlayer.ranking || 128;
            const meetsRank = !sponsor.requirements?.minRank || (rank > 0 && rank <= sponsor.requirements.minRank);
            const meetsRep = !sponsor.requirements?.minConfidence || (activePlayer.state?.confidence || 50) >= sponsor.requirements.minConfidence;
            const isEligible = meetsRank && meetsRep;

            return (
              <div
                key={sponsor.id}
                className={`bg-white/5 hover:bg-white/[0.08] border rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 backdrop-blur-sm ${
                  isSigned
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-emerald-500/5'
                    : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                      {sponsor.tier} • {sponsor.type}
                    </span>
                    {isSigned && (
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        ✓ Signed Contract
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-white">
                    {sponsor.sponsorName}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {sponsor.tagline || sponsor.sponsorName}
                  </p>

                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Weekly Stipend:</span>
                      <span className="font-mono font-bold text-emerald-400">+£{sponsor.weeklyStipend.toLocaleString()}/wk</span>
                    </div>
                    {sponsor.tournamentWinBonus > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Win Bonus:</span>
                        <span className="font-mono font-bold text-amber-400">+£{sponsor.tournamentWinBonus.toLocaleString()}</span>
                      </div>
                    )}
                    {sponsor.shopDiscountPercent > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Pro Shop Discount:</span>
                        <span className="font-mono font-bold text-sky-400">{sponsor.shopDiscountPercent}% Off</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400">
                    {sponsor.requirements?.minRank && (
                      <span>Req: Top {sponsor.requirements.minRank} Rank</span>
                    )}
                  </div>

                  {isSigned ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      Active Partner
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!isEligible}
                      onClick={() => handleSignSponsor(sponsor.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-black font-bold text-xs transition-colors shadow"
                    >
                      {isEligible ? 'Sign Deal' : 'Locked'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sponsor Performance Bounties */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 block">
            ONE-TIME PAYOUTS
          </span>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            Sponsor Performance Bounties
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(BOUNTIES).map(bounty => {
            const isCompleted = activePlayer.activeBounties?.includes(bounty.id);

            return (
              <div key={bounty.id} className={`p-4 rounded-xl border ${isCompleted ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-white/5 border-white/10'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-black/20 px-2 py-0.5 rounded">
                    {bounty.sponsorName}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <h4 className="font-bold text-white text-sm">{bounty.title}</h4>
                <p className="text-xs text-slate-400">{bounty.description}</p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className={`font-mono font-black ${isCompleted ? 'text-slate-500 line-through' : 'text-emerald-400'}`}>
                    £{bounty.rewardMoney.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isCompleted ? 'CLAIMED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifestyle & Facilities */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 block">
            WEEKLY UPKEEP & ASSETS
          </span>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Lifestyle & Facilities
          </h3>
          <p className="text-xs text-slate-400 mt-1">Invest in your wellbeing and preparation to gain weekly recovery and form bonuses.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LIFESTYLE_UPGRADES.map(upgrade => {
            const isOwned = activeLifestyleUpgrades.some(u => u.id === upgrade.id);
            const isEligible = !upgrade.requiredRank || (activePlayer.ranking > 0 && activePlayer.ranking <= upgrade.requiredRank);

            return (
              <div key={upgrade.id} className={`p-4 rounded-xl border ${isOwned ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-white/5 border-white/10'} flex flex-col justify-between space-y-3 shadow-md`}>
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{upgrade.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{upgrade.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Weekly Upkeep</span>
                    <span className="font-mono font-black text-rose-400">
                      -£{upgrade.weeklyUpkeep.toLocaleString()}
                    </span>
                    {!isEligible && (
                      <span className="text-[10px] text-rose-400 font-semibold mt-0.5">Req: Top {upgrade.requiredRank}</span>
                    )}
                  </div>

                  {isOwned ? (
                    <button
                      type="button"
                      onClick={() => {
                        const res = LifestyleManager.cancelUpgrade(activePlayer, upgrade.id);
                        if (res.success) {
                          showNotification(res.message, 'success');
                          onSave();
                          forceUpdate();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isEligible || activePlayer.bankBalance < upgrade.weeklyUpkeep}
                      onClick={() => {
                        const res = LifestyleManager.purchaseUpgrade(activePlayer, upgrade.id);
                        if (res.success) {
                          showNotification(res.message, 'success');
                          onSave();
                          forceUpdate();
                        } else {
                          showNotification(res.message, 'error');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black font-bold text-xs transition-colors shadow"
                    >
                      {isEligible ? 'Purchase' : 'Locked'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
