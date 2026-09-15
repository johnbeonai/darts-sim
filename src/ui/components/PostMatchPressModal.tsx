import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import {
  PressQuestion,
  PressAnswerOption,
  PressConferenceManager,
} from '../../core/media/PressConferenceManager';
import {
  Mic,
  MessageSquare,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';

interface PostMatchPressModalProps {
  player: Player;
  questions: PressQuestion[];
  onComplete: () => void;
}

export const PostMatchPressModal: React.FC<PostMatchPressModalProps> = ({
  player,
  questions,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<PressAnswerOption | null>(null);
  const [answeredHistory, setAnsweredHistory] = useState<
    { question: PressQuestion; option: PressAnswerOption }[]
  >([]);
  const [isDone, setIsDone] = useState(false);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (opt: PressAnswerOption) => {
    if (selectedOption) return; // already selected for this question
    setSelectedOption(opt);
    PressConferenceManager.applyAnswerEffects(player, opt);

    setAnsweredHistory(prev => [...prev, { question: currentQ, option: opt }]);

    // Move to next question or complete
    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(c => c + 1);
        setSelectedOption(null);
      } else {
        setIsDone(true);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900/95 border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-100 space-y-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base tracking-wide uppercase">
                  Post-Match Press Conference
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PDC Media Centre • Player: <span className="text-amber-400 font-bold">{player.name}</span>
              </p>
            </div>
          </div>

          {!isDone && (
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-slate-300">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {!isDone && currentQ ? (
          <div className="space-y-6 relative z-10 animate-fade-in">
            {/* Journalist Question Box */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {currentQ.journalistName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-slate-300">
                  {currentQ.mediaOutlet}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-white italic leading-relaxed">
                "{currentQ.question}"
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                Choose Your Response:
              </span>

              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map(opt => {
                  const isChosen = selectedOption?.id === opt.id;
                  const isOther = selectedOption !== null && !isChosen;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.99] group ${
                        isChosen
                          ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-400 shadow-xl'
                          : isOther
                          ? 'opacity-40 bg-white/5 border-white/5'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              opt.tone === 'confident'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : opt.tone === 'humble'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : opt.tone === 'defiant'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {opt.tone}
                          </span>
                          <span className="text-xs font-bold text-white tracking-wide">
                            {opt.label}
                          </span>
                        </div>

                        {/* Effects Preview Badges */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          {opt.effects.confidenceDelta !== 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                opt.effects.confidenceDelta > 0
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'text-rose-400 bg-rose-500/10'
                              }`}
                            >
                              {opt.effects.confidenceDelta > 0 ? '+' : ''}
                              {opt.effects.confidenceDelta} Conf
                            </span>
                          )}
                          {opt.effects.formDelta !== 0 && (
                            <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                              +{opt.effects.formDelta} Form
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        "{opt.statement}"
                      </p>

                      {isChosen && opt.effects.sponsorPraise && (
                        <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center gap-2 text-xs font-bold text-amber-300 animate-fade-in">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{opt.effects.sponsorPraise}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Press Conference Wrap-Up Summary */
          <div className="space-y-6 relative z-10 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center font-black shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-white">Press Conference Concluded</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Your responses have been transmitted to PDC media partners and will shape player morale and fan sentiment.
              </p>
            </div>

            {/* Quick Player Stat Impacts */}
            <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 max-w-md mx-auto grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Confidence</span>
                <span className="font-mono font-black text-lg text-amber-400">{player.state.confidence}%</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Form</span>
                <span className="font-mono font-black text-lg text-emerald-400">{player.state.form}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="w-full max-w-md mx-auto py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Return to Tournament Hub</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
