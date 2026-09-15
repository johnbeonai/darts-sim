const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// P1
content = content.replace(
  /<div>\s*<label className="block text-xs text-neutral-400 mb-1 font-semibold">\s*Player Name\s*<\/label>\s*<div className="relative">\s*<User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" \/>\s*<input\s*type="text"\s*value=\{playerName\}\s*onChange=\{\(e\) => setPlayerName\(e\.target\.value\)\}\s*className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"\s*\/>\s*<\/div>\s*<\/div>/g,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Player Name
    </label>
    <div className="relative">
      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"
      />
    </div>
  </div>
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Home Base / Travel Hub
    </label>
    <select
      value={homeBaseId}
      onChange={(e) => setHomeBaseId(e.target.value)}
      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
    >
      {Object.values(CITIES).map(city => (
        <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
      ))}
    </select>
  </div>
</div>`
);

// P2
content = content.replace(
  /<div>\s*<label className="block text-xs text-neutral-400 mb-1 font-semibold">\s*Player 2 Name\s*<\/label>\s*<div className="relative">\s*<User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" \/>\s*<input\s*type="text"\s*value=\{player2Name\}\s*onChange=\{\(e\) => setPlayer2Name\(e\.target\.value\)\}\s*className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"\s*\/>\s*<\/div>\s*<\/div>/g,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Player 2 Name
    </label>
    <div className="relative">
      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
      <input
        type="text"
        value={player2Name}
        onChange={(e) => setPlayer2Name(e.target.value)}
        className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white"
      />
    </div>
  </div>
  <div>
    <label className="block text-xs text-neutral-400 mb-1 font-semibold">
      Home Base / Travel Hub
    </label>
    <select
      value={player2HomeBaseId}
      onChange={(e) => setPlayer2HomeBaseId(e.target.value)}
      className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
    >
      {Object.values(CITIES).map(city => (
        <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
      ))}
    </select>
  </div>
</div>`
);

fs.writeFileSync('src/App.tsx', content);
