import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { TournamentConfig } from '../../core/tournament/Tournament';
import { TravelManager, TravelOption } from '../../core/finance/TravelManager';
import { Plane, Building, MapPin, AlertTriangle, ShieldCheck, Wallet } from 'lucide-react';
import { GeographyManager, CITIES } from '../../core/world/Geography';

interface TravelBookingModalProps {
  player: Player;
  tournament: TournamentConfig;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TravelBookingModal: React.FC<TravelBookingModalProps> = ({ player, tournament, onConfirm, onCancel }) => {
  const options = TravelManager.getTravelOptions(player, tournament);
  const [selectedOption, setSelectedOption] = useState<TravelOption>(options[options.length > 1 ? 1 : 0]);
  
  const homeBase = CITIES[player.homeBaseId || 'london']?.name || 'London';
  const destCityId = tournament.locationId || GeographyManager.getCityIdFromLocationString(tournament.location);
  const destination = CITIES[destCityId]?.name || tournament.location;
  
  const isLocal = homeBase.toLowerCase() === destination.toLowerCase();

  const handleBook = () => {
    const res = TravelManager.bookTravel(player, selectedOption);
    if (res.success) {
      onConfirm();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-xl w-full">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Travel & Logistics</h2>
            <p className="text-xs text-slate-400">Book your itinerary for {tournament.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Home Base</span>
            <div className="font-mono font-bold text-white flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {homeBase}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative px-4">
            <div className="h-px w-full bg-white/10 relative">
              <Plane className="w-4 h-4 text-slate-500 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Destination</span>
            <div className="font-mono font-bold text-white flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {destination}
            </div>
          </div>
        </div>

        {isLocal ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2 mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-emerald-300">Local Tournament</h3>
            <p className="text-sm text-emerald-400/80">This event is in your home city. No travel expenses or jet lag incurred.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Select Travel Class</span>
            {options.map((opt, i) => {
              const canAfford = player.bankBalance >= opt.cost;
              const isSelected = selectedOption === opt;
              
              return (
                <button
                  key={i}
                  disabled={!canAfford}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                      : canAfford 
                        ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10' 
                        : 'bg-red-500/5 border-red-500/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-black text-sm uppercase ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                      {opt.travelClass} Class
                    </span>
                    <span className={`font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      £{opt.cost.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-3">{opt.description}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
                    <span className={opt.fatigueCost > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {opt.fatigueCost > 0 ? `+${opt.fatigueCost}% Fatigue` : 'No Fatigue'}
                    </span>
                    <span className={opt.formCost < 0 ? 'text-rose-400' : opt.formCost > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                      {opt.formCost < 0 ? `${opt.formCost} Form` : opt.formCost > 0 ? `+${opt.formCost} Form` : 'No Form Change'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-slate-300">Bal: £{player.bankBalance.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={!isLocal && player.bankBalance < selectedOption.cost}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition-all"
            >
              Book & Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
