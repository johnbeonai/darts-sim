const fs = require('fs');
let content = fs.readFileSync('src/ui/screens/FinancesScreen.tsx', 'utf8');

const lifestyleSection = `
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
              <div key={upgrade.id} className={\`p-4 rounded-xl border \${isOwned ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-white/5 border-white/10'} flex flex-col justify-between space-y-3 shadow-md\`}>
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
`;

content = content.replace(
  /        <\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/g,
  `        </div>\n      </div>\n${lifestyleSection}\n    </div>\n  );\n};`
);

fs.writeFileSync('src/ui/screens/FinancesScreen.tsx', content);
