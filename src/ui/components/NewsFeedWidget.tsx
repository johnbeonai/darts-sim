import React, { useState } from 'react';
import { NewsArticle, NewsCategory } from '../../core/media/OcheGazetteNews';
import {
  Newspaper,
  Trophy,
  BarChart3,
  Flame,
  Globe,
  Tag,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NewsFeedWidgetProps {
  articles: NewsArticle[];
}

export const NewsFeedWidget: React.FC<NewsFeedWidgetProps> = ({ articles }) => {
  const [filter, setFilter] = useState<NewsCategory | 'all'>('all');

  const filtered = filter === 'all'
    ? articles
    : articles.filter(a => a.category === filter);

  const getCategoryIcon = (cat: NewsCategory) => {
    switch (cat) {
      case 'tournament':
        return Trophy;
      case 'ranking':
        return BarChart3;
      case 'rivalry':
        return Flame;
      case 'sponsor':
        return Tag;
      default:
        return Globe;
    }
  };

  const getCategoryColor = (cat: NewsCategory) => {
    switch (cat) {
      case 'tournament':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'ranking':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'rivalry':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'sponsor':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-slate-300 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-black tracking-widest text-slate-200">
              The Oche Gazette • Tour Wire
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Official PDC Circuit News, Stories & Headlines
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'tournament', 'ranking', 'circuit'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === cat
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map(art => {
          const Icon = getCategoryIcon(art.category);
          const colorClass = getCategoryColor(art.category);

          return (
            <div
              key={art.id}
              className={`p-4 rounded-2xl border transition-all duration-200 space-y-2 flex flex-col justify-between ${
                art.isUrgent
                  ? 'bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${colorClass}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{art.category}</span>
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">
                    {art.dateString}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {art.headline}
                </h4>

                <p className="text-xs text-slate-300/90 leading-relaxed">
                  {art.snippet}
                </p>
              </div>

              {art.isUrgent && (
                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Major Headline
                  </span>
                  <span>Week {art.week}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
