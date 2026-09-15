import React, { useState, useEffect } from 'react';
import { BroadcastDartboard } from '../components/BroadcastDartboard';
import { DartCoordinates, DartCoordinate } from '../../core/match/DartCoordinates';
import { MinigameType, MinigameManager, MinigameResult } from '../../core/training/Minigames';
import { Player } from '../../core/player/Player';
import { DartResult } from '../../core/match/DartResult';
import { ArrowLeft, Target, Award } from 'lucide-react';

interface TrainingMinigameScreenProps {
  player: Player;
  minigame: MinigameType;
  onComplete: (result: MinigameResult) => void;
  onCancel: () => void;
}

export const TrainingMinigameScreen: React.FC<TrainingMinigameScreenProps> = ({
  player, minigame, onComplete, onCancel
}) => {
  const [score, setScore] = useState(minigame === 'bobs_27' ? 27 : 0);
  const [targetIndex, setTargetIndex] = useState(1);
  const [thrownDarts, setThrownDarts] = useState<DartCoordinate[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalResult, setFinalResult] = useState<MinigameResult | null>(null);

  const targetSegment = targetIndex <= 20 ? targetIndex : 25;

  const handleBoardClick = (x: number, y: number) => {
    if (gameOver) return;

    // Apply attribute-based scatter (lower attribute = higher scatter)
    // Scatter radius up to 10 SVG units if attribute is 0, 1 unit if 90.
    const doublingAttr = player.attributes.doubling;
    const scatterRange = Math.max(1, (100 - doublingAttr) * 0.15); // e.g. doubling 50 -> 7.5 max radius
    
    const rScatter = Math.random() * scatterRange;
    const angleScatter = Math.random() * 2 * Math.PI;
    const finalX = x + rScatter * Math.cos(angleScatter);
    const finalY = y + rScatter * Math.sin(angleScatter);

    const dartCoords = { x: finalX, y: finalY };
    const result = DartCoordinates.getDartFromCoordinate(finalX, finalY);

    setThrownDarts(prev => {
      const next = [...prev, dartCoords];
      if (next.length > 3) return [dartCoords]; // clear previous visit visually
      return next;
    });

    // Process logic
    if (minigame === 'bobs_27') {
      processBobs27(result);
    } else {
      processAroundTheClock(result);
    }
  };

  const processBobs27 = (dart: DartResult) => {
    let newScore = score;
    let hit = false;
    
    // We throw 3 darts at the same target.
    // Wait, Bob's 27 rule: 3 darts at D1, then 3 darts at D2, etc.
    // For simplicity, every click evaluates the dart.
    if (dart.segment === targetSegment && dart.multiplier === 2) {
      newScore += targetSegment * 2;
      hit = true;
    }

    // Keep track of darts in current visit
    const dartsThisTarget = thrownDarts.length + 1;
    let turnMsg = `Dart ${dartsThisTarget}: ${dart.label}`;

    if (dartsThisTarget === 3) {
      // End of turn for this target
      if (!hit && newScore === score) {
        // Did not hit it at all in 3 darts, subtract
        newScore -= targetSegment * 2;
        turnMsg += ` (Failed D${targetSegment}, Score -${targetSegment*2})`;
      } else {
        turnMsg += ` (Success!)`;
      }
      
      if (newScore < 0) {
        // Game Over
        setScore(newScore);
        endGame(newScore);
        return;
      }
      
      if (targetSegment === 25) {
        // Completed Bob's 27!
        setScore(newScore);
        endGame(newScore);
        return;
      }

      setTargetIndex(targetIndex + 1);
    }

    setScore(newScore);
    setHistory(prev => [turnMsg, ...prev].slice(0, 5));
  };

  const processAroundTheClock = (dart: DartResult) => {
    // Just hit the single segment (or double/treble of it)
    const newScore = score + 1; // score tracks darts thrown

    if (dart.segment === targetSegment) {
      setHistory(prev => [`Hit ${targetSegment}! (${dart.label})`, ...prev].slice(0, 5));
      if (targetSegment === 25) {
        setScore(newScore);
        endGame(newScore);
        return;
      }
      setTargetIndex(targetIndex + 1);
    } else {
      setHistory(prev => [`Missed ${targetSegment}. (${dart.label})`, ...prev].slice(0, 5));
    }
    
    setScore(newScore);
  };

  const endGame = (endScore: number) => {
    setGameOver(true);
    let res: MinigameResult;
    if (minigame === 'bobs_27') res = MinigameManager.calculateBobs27Result(endScore);
    else res = MinigameManager.calculateAroundTheClockResult(endScore);
    setFinalResult(res);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center md:items-start animate-fade-in">
      <div className="flex-1 w-full bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-amber-400 uppercase tracking-widest">
            {minigame === 'bobs_27' ? "Bob's 27" : "Around the Clock"}
          </h2>
          <button onClick={onCancel} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-sm text-neutral-400 font-semibold mb-1">CURRENT TARGET</div>
          <div className="text-5xl font-black text-white font-mono">
            {minigame === 'bobs_27' ? `D${targetSegment}` : targetSegment}
          </div>
          <div className="mt-2 text-amber-400 font-bold font-mono">
            {minigame === 'bobs_27' ? `Score: ${score}` : `Darts Thrown: ${score}`}
          </div>
        </div>

        <div className="flex justify-center mb-6 relative">
          <BroadcastDartboard
            darts={thrownDarts}
            onBoardClick={handleBoardClick}
            className="w-full max-w-[300px] mx-auto"
          />
          {gameOver && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex flex-col items-center justify-center">
              <Award className="w-16 h-16 text-amber-400 mb-2" />
              <div className="text-2xl font-black text-white">FINISHED</div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-80 space-y-4">
        {gameOver && finalResult && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-lg animate-bounce-in">
            <h3 className="text-lg font-black text-amber-400 mb-2 uppercase">Results</h3>
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex justify-between text-white">
                <span>Final Score:</span>
                <span>{finalResult.score}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>XP Earned:</span>
                <span>+{finalResult.xpEarned}</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>Form Change:</span>
                <span>{finalResult.formChange > 0 ? '+' : ''}{finalResult.formChange}</span>
              </div>
            </div>
            <button
              onClick={() => onComplete(finalResult)}
              className="w-full mt-4 py-3 bg-amber-500 text-black font-black uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 h-64 overflow-y-auto">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Throw Log</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="text-sm font-medium text-neutral-300 bg-neutral-800/50 p-2 rounded-lg border border-neutral-700/50">
                {h}
              </div>
            ))}
            {history.length === 0 && <div className="text-xs text-neutral-600">No darts thrown yet. Click the board!</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
