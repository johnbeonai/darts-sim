import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { CareerManager } from '../../core/career/CareerManager';
import {
  EquipmentItem,
  EQUIPMENT_CATALOG,
  EquipmentCategory,
  getEquipmentItemById
} from '../../core/equipment/EquipmentItem';
import { SponsorshipManager } from '../../core/finance/SponsorshipManager';
import { DartVisualizer } from '../components/DartVisualizer';
import {
  ArrowLeft, ShoppingBag, CheckCircle2, ShieldAlert,
  Sparkles, Check, Eye, Search, Filter, ArrowUpDown, Truck, ShieldCheck, Award, User
} from 'lucide-react';

interface EquipmentShopScreenProps {
  career: CareerManager;
  onBack: () => void;
  onSave: () => void;
}

export const EquipmentShopScreen: React.FC<EquipmentShopScreenProps> = ({
  career,
  onBack,
  onSave,
}) => {
  const [, setRenderTick] = useState(0);
  const forceUpdate = () => setRenderTick(t => t + 1);

  const is2P = career.isTwoPlayer;
  const p1 = career.players[0];
  const p2 = is2P && career.players.length > 1 ? career.players[1] : null;

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(career.activePlayerIndex);
  const activePlayer: Player = selectedPlayerIndex === 0 ? p1 : (p2 || p1);

  const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'weight'>('default');

  // Previewing Item State on the Dart Visualizer
  const [previewItem, setPreviewItem] = useState<EquipmentItem | null>(null);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const shopDiscount = SponsorshipManager.getShopDiscount(activePlayer.activeSponsorships || []);
  const loadout = activePlayer.equippedLoadout || {
    barrelId: 'barrel-brass-22',
    shaftId: 'shaft-nylon-medium',
    flightId: 'flight-standard-100',
    totalWeightGrams: 24,
    modifiers: { scoringModifier: 1.0, doublingModifier: 1.0, consistencyModifier: 1.0, fatigueModifier: 1.0 }
  };

  // Shop Handlers
  const handleBuy = (item: EquipmentItem) => {
    const res = activePlayer.buyEquipmentItem(item, shopDiscount);
    if (res.success) {
      showNotification(res.message, 'success');
      onSave();
      forceUpdate();
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleEquip = (item: EquipmentItem) => {
    activePlayer.equipItem(item);
    if (previewItem?.id === item.id) {
      setPreviewItem(null);
    }
    showNotification(`Equipped ${item.name}! Match darts profile updated.`, 'success');
    onSave();
    forceUpdate();
  };

  const handlePreview = (item: EquipmentItem) => {
    setPreviewItem(item);
    showNotification(`Previewing ${item.name} on the workbench! Check the assembled dart above.`, 'success');
  };

  const handleResetPreview = () => {
    setPreviewItem(null);
  };

  const allBrands = Array.from(new Set(EQUIPMENT_CATALOG.map(i => i.brand)));

  let filteredItems = EQUIPMENT_CATALOG.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (brandFilter !== 'all' && item.brand !== brandFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchBrand = item.brand.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchBrand) return false;
    }
    return true;
  });

  if (sortBy === 'price_asc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'weight') {
    filteredItems.sort((a, b) => b.weightGrams - a.weightGrams);
  }

  // Active or preview items
  const activeBarrel = previewItem?.category === 'barrel' ? previewItem : getEquipmentItemById(loadout.barrelId);
  const activeShaft = previewItem?.category === 'shaft' ? previewItem : getEquipmentItemById(loadout.shaftId);
  const activeFlight = previewItem?.category === 'flight' ? previewItem : getEquipmentItemById(loadout.flightId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Glassmorphic Navigation & Brand Strip */}
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
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Target & Oche Direct • Official Megastore</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide pt-1">
              DARTS PRO WORKSHOP & SHOP
            </h2>
          </div>
        </div>

        {/* 2-Player Switcher & Bank Balance */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {is2P && p2 && (
            <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlayerIndex(0);
                  setPreviewItem(null);
                }}
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
                onClick={() => {
                  setSelectedPlayerIndex(1);
                  setPreviewItem(null);
                }}
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

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Wallet:</span>
            <span className="font-mono font-black text-emerald-400 text-base">
              £{activePlayer.bankBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Award className="w-3.5 h-3.5" />
            Official PDC Match Specification Equipment
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            Express Tour Delivery Included
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Match-Weighted Guarantee (±0.05g)
          </span>
        </div>

        {shopDiscount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
            {shopDiscount}% Commercial Sponsor Discount Applied
          </span>
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

      {/* Assembled Dart Workshop Stage */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">
              PRECISION WORKBENCH
            </span>
            <h3 className="text-lg font-black text-white">
              Currently Fitted Match Darts
            </h3>
          </div>

          {previewItem && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold animate-pulse">
                Previewing: {previewItem.name}
              </span>
              <button
                type="button"
                onClick={handleResetPreview}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors"
              >
                Reset Preview
              </button>
            </div>
          )}
        </div>

        {/* Visualizer Display */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 overflow-hidden flex items-center justify-center min-h-[140px]">
          <DartVisualizer
            loadout={loadout}
            previewItem={previewItem}
            onResetPreview={handleResetPreview}
            onEquipPreview={handleEquip}
          />
        </div>

        {/* Loadout Vitals Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Barrel Spec</span>
            <span className="text-xs sm:text-sm font-bold text-white truncate block">
              {activeBarrel?.name || 'Default Brass'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold capitalize">
              {activeBarrel?.weightGrams || 22}g ({activeBarrel?.barrelMaterial?.replace('_', ' ') || 'Brass'})
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Shaft Spec</span>
            <span className="text-xs sm:text-sm font-bold text-white truncate block">
              {activeShaft?.name || 'Standard Nylon'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono capitalize">
              {activeShaft?.shaftMaterial || 'Polymer'}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Flight Spec</span>
            <span className="text-xs sm:text-sm font-bold text-white truncate block">
              {activeFlight?.name || 'Standard 100'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              100 Micron
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Setup Weight</span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
              {loadout.totalWeightGrams || 24}g
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              Tournament Legal
            </span>
          </div>
        </div>
      </div>

      {/* Catalog Filters & Search */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['all', 'barrel', 'shaft', 'flight'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-black shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Items' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Brands</option>
              {allBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="default">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="weight">Weight (g)</option>
            </select>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredItems.map(item => {
            const isOwned = activePlayer.ownedEquipmentIds?.includes(item.id);
            const isEquipped =
              loadout.barrelId === item.id ||
              loadout.shaftId === item.id ||
              loadout.flightId === item.id;
            const isPreviewing = previewItem?.id === item.id;

            const discountedPrice = Math.round(item.price * (1 - shopDiscount / 100));
            const canAfford = activePlayer.bankBalance >= discountedPrice;

            return (
              <div
                key={item.id}
                className={`bg-white/5 hover:bg-white/[0.08] border rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 backdrop-blur-sm ${
                  isEquipped
                    ? 'border-amber-500/60 ring-1 ring-amber-500/40 bg-amber-500/5'
                    : isPreviewing
                    ? 'border-sky-500/60 ring-1 ring-sky-500/40 bg-sky-500/5'
                    : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {item.brand} • {item.category}
                    </span>
                    {isEquipped ? (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        ✓ Equipped
                      </span>
                    ) : isOwned ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        In Bag
                      </span>
                    ) : null}
                  </div>

                  <h4 className="text-base font-black text-white leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px] font-mono">
                    <span className="bg-black/40 px-2 py-0.5 rounded border border-white/5 text-slate-300">
                      {item.weightGrams}g
                    </span>
                    <span className="bg-black/40 px-2 py-0.5 rounded border border-white/5 text-slate-300 capitalize">
                      {item.barrelMaterial?.replace('_', ' ') || item.shaftMaterial || item.flightShape || item.category}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div>
                    {!isOwned ? (
                      <div>
                        {shopDiscount > 0 ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-black text-emerald-400 text-base">
                              £{discountedPrice}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 line-through">
                              £{item.price}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono font-black text-white text-base">
                            £{item.price}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400">
                        Owned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePreview(item)}
                      className={`p-2 rounded-xl border text-xs transition-colors ${
                        isPreviewing
                          ? 'bg-sky-500 text-white border-sky-400'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                      title="Preview on workbench"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {isEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        Fitted
                      </span>
                    ) : isOwned ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(item)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => handleBuy(item)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black font-bold text-xs transition-colors shadow flex items-center gap-1"
                      >
                        <span>Buy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
