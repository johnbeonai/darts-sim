const fs = require('fs');
let content = fs.readFileSync('src/ui/screens/FinancesScreen.tsx', 'utf8');

content = content.replace(
  /<div className="bg-slate-900\/60 backdrop-blur-md border border-white\/10 shadow-xl rounded-2xl p-5">\s*<div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">\s*<span>Staff Retainers<\/span>\s*<TrendingDown className="w-4 h-4 text-rose-400" \/>\s*<\/div>\s*<div className="text-2xl sm:text-3xl font-mono font-black text-rose-400">\s*-£\{staffCosts\.toLocaleString\(\)\}\s*<\/div>\s*<span className="text-\[10px\] text-slate-400 block mt-1">\s*\{hiredStaffMembers\.length\} Specialists on Payroll\s*<\/span>\s*<\/div>/g,
  `<div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-5">
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
  </div>`
);

fs.writeFileSync('src/ui/screens/FinancesScreen.tsx', content);
