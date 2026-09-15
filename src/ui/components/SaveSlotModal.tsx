import React from 'react';
import { SaveSlotMetadata, SaveManager } from '../../storage/SaveManager';
import { User, Users, Trash2, ArrowRight, PlusCircle, X, Play, Shield } from 'lucide-react';

interface SaveSlotModalProps {
  mode: 'load' | 'select_for_new' | 'manage';
  onSelectSlot: (slotId: number) => void;
  onNewGameInSlot?: (slotId: number) => void;
  onClose: () => void;
}

export const SaveSlotModal: React.FC<SaveSlotModalProps> = ({
  mode,
  onSelectSlot,
  onNewGameInSlot,
  onClose,
}) => {
  const [slots, setSlots] = React.useState<SaveSlotMetadata[]>(() => SaveManager.listSlots());

  const handleDelete = (e: React.MouseEvent, slotId: number) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete Save Slot ${slotId}? All progress in this slot will be lost.`)) {
      SaveManager.deleteSlot(slotId);
      setSlots(SaveManager.listSlots());
    }
  };

  const handleSlotClick = (slot: SaveSlotMetadata) => {
    if (slot.exists) {
      if (mode === 'select_for_new') {
        if (confirm(`Slot ${slot.slotId} already contains a saved career (${slot.playerName}). Overwrite this slot?`)) {
          if (onNewGameInSlot) {
            onNewGameInSlot(slot.slotId);
          } else {
            onSelectSlot(slot.slotId);
          }
        }
      } else {
        // Load mode
        onSelectSlot(slot.slotId);
      }
    } else {
      // Empty slot
      if (onNewGameInSlot) {
        onNewGameInSlot(slot.slotId);
      } else {
        onSelectSlot(slot.slotId);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-black text-white">
                {mode === 'select_for_new' ? 'Choose Slot for New Career' : 'Select Game Save'}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Choose an existing playthrough to continue or pick a slot for a new Solo / 2-Player career.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Save Slots Grid */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {slots.map((slot) => {
            if (slot.exists) {
              return (
                <div
                  key={slot.slotId}
                  onClick={() => handleSlotClick(slot)}
                  className="p-4 rounded-2xl bg-neutral-950 hover:bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
                      {slot.slotId}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                          {slot.playerName}
                          {slot.isTwoPlayer && slot.player2Name && ` & ${slot.player2Name}`}
                        </span>
                        {slot.isTwoPlayer ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <Users className="w-3 h-3" />
                            2-Player Rivalry
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <User className="w-3 h-3" />
                            Solo Career
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {slot.tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1.5 font-mono">
                        <span>Age {slot.age}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">£{slot.bankBalance}</span>
                        <span>•</span>
                        <span className="text-neutral-500">{slot.dateString}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Delete Save Slot"
                      onClick={(e) => handleDelete(e, slot.slotId)}
                      className="p-2.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSlotClick(slot)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shadow transition-all group-hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>{mode === 'select_for_new' ? 'Overwrite' : 'Resume'}</span>
                    </button>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={slot.slotId}
                  onClick={() => handleSlotClick(slot)}
                  className="p-4 rounded-2xl border border-dashed border-neutral-800 hover:border-amber-500/60 hover:bg-amber-500/5 cursor-pointer text-neutral-400 hover:text-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono font-bold text-sm text-neutral-500 group-hover:border-amber-500/40 group-hover:text-amber-400 transition-colors">
                      {slot.slotId}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-neutral-300 group-hover:text-white">
                        Slot {slot.slotId} — Empty
                      </span>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Ready for a new Solo or 2-Player Career
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black text-amber-400 text-xs font-bold transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    <span>New Career</span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
