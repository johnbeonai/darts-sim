const fs = require('fs');
let content = fs.readFileSync('src/ui/screens/HybridMatchScreen.tsx', 'utf-8');

content = content.replace(
  /const handleUndoDart = \(\) => \{\s*setSelectedDarts\(prev => prev\.slice\(0, -1\)\);\s*\};/g,
  `const handleUndoDart = () => {
    setSelectedDarts(prev => prev.slice(0, -1));
  };

  const handleSubmitEarly = () => {
    if (selectedDarts.length === 0) return;
    const visit = new Visit(activePlayerId, playerScore, selectedDarts);
    controller.processPlayerVisit(visit);
    setSelectedDarts([]);
  };`
);

content = content.replace(
  /\{selectedDarts\.length > 0 && \(\s*<button\s*type="button"\s*onClick=\{handleUndoDart\}\s*className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"\s*>\s*<RotateCcw className="w-4 h-4" \/>\s*<\/button>\s*\)\}/g,
  `{selectedDarts.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUndoDart}
                    className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    title="Undo Last Dart"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitEarly}
                    className="p-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2 transition-all shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm</span>
                  </button>
                </div>
              )}`
);

fs.writeFileSync('src/ui/screens/HybridMatchScreen.tsx', content);
