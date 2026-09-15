import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player } from '../../core/player/Player';
import { DartResult } from '../../core/match/DartResult';
import { AudioManager } from '../../core/audio/AudioManager';
import { DartboardGeometry, DartboardHitResult } from '../../core/throwing/DartboardGeometry';
import {
  ThrowPhysicsEngine,
  AimingSwayState,
  SwipeThrowInput,
  SwipeStrokePoint,
  TimingMeterThrowInput,
} from '../../core/throwing/ThrowPhysicsEngine';
import { VirtualDartboard, StuckDart } from './VirtualDartboard';
import {
  Target,
  Zap,
  RotateCcw,
  Check,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Hand,
  Activity,
  MousePointer,
  ArrowUp,
  Sliders,
  HeartPulse,
} from 'lucide-react';

import { FlickShotRecord, evaluateShotQuality } from '../../core/throwing/ShotQualityEvaluator';

export type ThrowMechanicMode = 'timing' | 'swipe' | 'tap';

interface PrecisionThrowOcheProps {
  player: Player;
  onConfirmVisit: (darts: DartResult[]) => void;
  onDartThrown?: (dart: DartResult) => void;
  disabled?: boolean;
  targetSegment?: number | null;
  targetMultiplier?: 1 | 2 | 3 | null;
  suggestedCheckout?: string | null;
  isMatchDart?: boolean;
  isDecidingLeg?: boolean;
  pressureMultiplier?: number;
}

export const PrecisionThrowOche: React.FC<PrecisionThrowOcheProps> = ({
  player,
  onConfirmVisit,
  onDartThrown,
  disabled = false,
  targetSegment = null,
  targetMultiplier = null,
  suggestedCheckout = null,
  isMatchDart = false,
  isDecidingLeg = false,
  pressureMultiplier = 1.0,
}) => {
  const [controlMode, setControlMode] = useState<ThrowMechanicMode>('timing');
  const [aimPoint, setAimPoint] = useState<{ x: number; y: number }>({ x: 0, y: -102 }); // default T20
  const [sway, setSway] = useState<AimingSwayState>({ offsetX: 0, offsetY: 0, amplitude: 3, tremor: 0 });
  const [stuckDarts, setStuckDarts] = useState<StuckDart[]>([]);
  const [flyingDartCoord, setFlyingDartCoord] = useState<{ x: number; y: number; progress: number } | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);
  const [lastThrowFeedback, setLastThrowFeedback] = useState<string | null>(null);

  // 1. DUAL-STAGE TIMING METER STATE
  const [timingStage, setTimingStage] = useState<'idle' | 'stage1_x' | 'stage2_y' | 'resolving'>('idle');
  const [meterXValue, setMeterXValue] = useState<number>(50);
  const [lockedX, setLockedX] = useState<number | null>(null);
  const [meterYValue, setMeterYValue] = useState<number>(50);
  const [lockedY, setLockedY] = useState<number | null>(null);
  const meterAnimRef = useRef<number | null>(null);

  // 2. UNIVERSAL FLICK & SWIPE STATE
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [liveTrajectory, setLiveTrajectory] = useState<{ dx: number; dy: number; speed: number } | null>(null);
  const [isRecordingMouseStroke, setIsRecordingMouseStroke] = useState<boolean>(false);
  const strokePointsRef = useRef<SwipeStrokePoint[]>([]);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Flick Stroke Visualization & Quality Feedback State
  const [lastFlickShot, setLastFlickShot] = useState<FlickShotRecord | null>(null);
  const [liveStrokeRelPoints, setLiveStrokeRelPoints] = useState<{ x: number; y: number }[]>([]);
  const runwayRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Hold-to-Flick state
  const [isKeyCharging, setIsKeyCharging] = useState<boolean>(false);
  const keyChargeStartRef = useRef<number>(0);

  // 3. AUTO-ADVANCE AFTER 3 DARTS
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(false);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // Update aimPoint if targetSegment changes
  useEffect(() => {
    if (targetSegment !== null) {
      const coords = DartboardGeometry.getTargetCoordinates(targetSegment, targetMultiplier || 1);
      setAimPoint({ x: coords.x, y: coords.y });
    }
  }, [targetSegment, targetMultiplier]);

  // Breathing Sway Animation Loop with Pressure Composure Tremor
  useEffect(() => {
    let animId: number;
    const startTime = Date.now();
    const situation = (isMatchDart || isDecidingLeg || (pressureMultiplier && pressureMultiplier > 1.0))
      ? {
          remainingScore: 100,
          opponentRemaining: 100,
          isDecidingLeg: Boolean(isDecidingLeg),
          isMatchDart: Boolean(isMatchDart),
          pressureMultiplier: pressureMultiplier || (isMatchDart ? 1.4 : 1.25)
        }
      : null;

    const loop = () => {
      const elapsed = Date.now() - startTime;
      const curSway = ThrowPhysicsEngine.calculateAimSway(player, elapsed, situation);
      setSway(curSway);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [player, isMatchDart, isDecidingLeg, pressureMultiplier]);

  // 2-STAGE TIMING METER OSCILLATION LOOP
  useEffect(() => {
    if (timingStage !== 'stage1_x' && timingStage !== 'stage2_y') {
      if (meterAnimRef.current) cancelAnimationFrame(meterAnimRef.current);
      return;
    }

    let val = 0;
    let dir = 1;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Stage 1 (X) oscillates at ~1.5 Hz, Stage 2 (Y) at ~1.9 Hz
      const speed = timingStage === 'stage1_x' ? 0.16 : 0.20;
      val += delta * speed * dir;

      if (val >= 100) {
        val = 100;
        dir = -1;
      } else if (val <= 0) {
        val = 0;
        dir = 1;
      }

      if (timingStage === 'stage1_x') {
        setMeterXValue(Math.round(val));
      } else if (timingStage === 'stage2_y') {
        setMeterYValue(Math.round(val));
      }

      meterAnimRef.current = requestAnimationFrame(animate);
    };

    meterAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (meterAnimRef.current) cancelAnimationFrame(meterAnimRef.current);
    };
  }, [timingStage]);

  // Handle Landed Dart with Flight Trajectory Animation
  const processLandedDart = useCallback((hitResult: DartboardHitResult, feedback?: string) => {
    setIsThrowing(true);
    if (feedback) setLastThrowFeedback(feedback);

    const startX = hitResult.x * 0.3;
    const startY = 220; // starts below bottom of board
    const startTime = performance.now();
    const flightDuration = 120; // 120ms smooth arc

    const animateFlight = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / flightDuration);
      const ease = 1 - (1 - progress) * (1 - progress);
      const curX = startX + (hitResult.x - startX) * ease;
      const curY = startY + (hitResult.y - startY) * ease;

      setFlyingDartCoord({ x: curX, y: curY, progress: ease });

      if (progress < 1) {
        requestAnimationFrame(animateFlight);
      } else {
        // Impact!
        setFlyingDartCoord(null);
        AudioManager.playDartThud();

        if (hitResult.dart.isInnerBull) {
          AudioManager.playCrowdCheer(1.5);
        } else if (targetMultiplier === 2 && hitResult.multiplier !== 2) {
          // Missed critical double wire
          AudioManager.playCrowdGasp();
        }

        const newDart: StuckDart = {
          id: `dart-${Date.now()}-${stuckDarts.length + 1}`,
          x: hitResult.x,
          y: hitResult.y,
          segment: hitResult.segment,
          multiplier: hitResult.multiplier,
          label: hitResult.dart.label,
          dartNumber: stuckDarts.length + 1,
          landingAngleDeg: hitResult.landingAngleDeg,
          landingPitchDeg: hitResult.landingPitchDeg,
        };

        const updated = [...stuckDarts, newDart];
        setStuckDarts(updated);

        if (onDartThrown) {
          onDartThrown(hitResult.dart);
        }

        // Auto-advance after 3 darts are thrown (no manual confirm needed!)
        if (updated.length >= 3) {
          setIsAutoAdvancing(true);
          if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
          }
          autoAdvanceTimeoutRef.current = setTimeout(() => {
            const dartResults: DartResult[] = updated.map(
              d => new DartResult(player.id, d.segment, d.multiplier, 'manual', true)
            );
            onConfirmVisit(dartResults);
            setStuckDarts([]);
            setLastThrowFeedback(null);
            setLastFlickShot(null);
            setLiveStrokeRelPoints([]);
            setIsAutoAdvancing(false);
          }, 750);
        }

        setTimeout(() => {
          setIsThrowing(false);
          setTimingStage('idle');
          setLockedX(null);
          setLockedY(null);
          setLiveTrajectory(null);
        }, 300);
      }
    };

    requestAnimationFrame(animateFlight);
  }, [stuckDarts, onDartThrown, onConfirmVisit, player, targetMultiplier]);

  // 1. TIMING METER STEP HANDLERS
  const handleTimingStep = () => {
    if (disabled || stuckDarts.length >= 3 || isThrowing) return;

    if (timingStage === 'idle') {
      setLockedX(null);
      setLockedY(null);
      setTimingStage('stage1_x');
    } else if (timingStage === 'stage1_x') {
      const currentX = meterXValue;
      setLockedX(currentX);
      AudioManager.playDartThud();
      setTimingStage('stage2_y');
    } else if (timingStage === 'stage2_y') {
      const currentY = meterYValue;
      setLockedY(currentY);
      setTimingStage('resolving');

      const xVal = lockedX !== null ? lockedX : 50;
      const timingInput: TimingMeterThrowInput = {
        meterX: xVal,
        meterY: currentY,
        targetX: aimPoint.x,
        targetY: aimPoint.y,
      };

      const hit = ThrowPhysicsEngine.resolveTimingThrow(player, timingInput, sway);
      const xDiff = xVal - 50;
      const yDiff = currentY - 50;
      const fb = `X: ${xDiff >= 0 ? '+' : ''}${xDiff}% • Y: ${yDiff >= 0 ? '+' : ''}${yDiff}%`;
      processLandedDart(hit, fb);
    }
  };

  const handleResetTiming = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimingStage('idle');
    setLockedX(null);
    setLockedY(null);
  };

  // 2. FLICK & SWIPE GESTURE HANDLERS
  const executeSwipeThrow = useCallback((swipeInput: SwipeThrowInput, flickRecord?: FlickShotRecord) => {
    const hit = ThrowPhysicsEngine.resolveSwipeThrow(
      player,
      aimPoint.x,
      aimPoint.y,
      swipeInput,
      sway
    );

    const speed = Math.hypot(swipeInput.endX - swipeInput.startX, swipeInput.endY - swipeInput.startY) / swipeInput.durationMs;
    const deflectionDeg = (Math.atan2(swipeInput.endX - swipeInput.startX, -(swipeInput.endY - swipeInput.startY)) * 180 / Math.PI);
    const absDef = Math.abs(deflectionDeg);
    const direction = absDef < 1.5 ? 'Dead Straight' : deflectionDeg > 0 ? `Veered Right (+${deflectionDeg.toFixed(1)}°)` : `Veered Left (${deflectionDeg.toFixed(1)}°)`;
    
    const qualityPrefix = flickRecord
      ? flickRecord.quality === 'green'
        ? '🟢 EXCELLENT SHOT'
        : flickRecord.quality === 'amber'
        ? '🟡 GOOD SHOT'
        : '🔴 BAD SHOT'
      : absDef <= 2.0
      ? '🟢 EXCELLENT SHOT'
      : absDef <= 4.5
      ? '🟡 GOOD SHOT'
      : '🔴 BAD SHOT';

    const fb = `${qualityPrefix} • ${direction} • Speed: ${speed.toFixed(2)} px/ms${absDef > 2.5 ? ' [Lateral Drift Penalty!]' : ''}`;
    processLandedDart(hit, fb);
  }, [player, aimPoint, sway, processLandedDart]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || stuckDarts.length >= 3 || isThrowing || controlMode !== 'swipe') return;

    const runway = runwayRef.current;
    const rect = runway ? runway.getBoundingClientRect() : null;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();

    swipeStartRef.current = { x: startX, y: startY, time: startTime };
    strokePointsRef.current = [{ x: startX, y: startY, time: startTime }];
    setIsSwiping(true);
    setLastFlickShot(null);

    const relStartX = rect ? Math.max(8, Math.min(rect.width - 8, startX - rect.left)) : 130;
    const relStartY = rect ? Math.max(8, Math.min(rect.height - 8, startY - rect.top)) : 250;
    const relPoints: { x: number; y: number }[] = [{ x: relStartX, y: relStartY }];
    setLiveStrokeRelPoints([...relPoints]);

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!swipeStartRef.current) return;
      const curX = moveEvt.clientX;
      const curY = moveEvt.clientY;
      const curTime = Date.now();

      strokePointsRef.current.push({ x: curX, y: curY, time: curTime });

      const dx = curX - swipeStartRef.current.x;
      const dy = curY - swipeStartRef.current.y;
      const elapsed = Math.max(1, curTime - swipeStartRef.current.time);
      const spd = Math.hypot(dx, dy) / elapsed;

      setLiveTrajectory({ dx, dy, speed: spd });

      if (rect) {
        const rx = Math.max(8, Math.min(rect.width - 8, curX - rect.left));
        const ry = Math.max(8, Math.min(rect.height - 8, curY - rect.top));
        relPoints.push({ x: rx, y: ry });
        setLiveStrokeRelPoints([...relPoints]);
      }
    };

    const handlePointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsSwiping(false);

      if (!swipeStartRef.current) return;

      const endX = upEvt.clientX;
      const endY = upEvt.clientY;
      const duration = Date.now() - swipeStartRef.current.time;
      const dy = endY - swipeStartRef.current.y;
      const dx = endX - swipeStartRef.current.x;

      if (dy > -15 && Math.hypot(dx, dy) < 25) {
        setLastThrowFeedback('Flick upward with mouse to throw!');
        swipeStartRef.current = null;
        setLiveTrajectory(null);
        setLiveStrokeRelPoints([]);
        return;
      }

      if (rect && relPoints.length < 2) {
        const rx = Math.max(8, Math.min(rect.width - 8, endX - rect.left));
        const ry = Math.max(8, Math.min(rect.height - 8, endY - rect.top));
        relPoints.push({ x: rx, y: ry });
      }

      const flickRecord = evaluateShotQuality(dx, dy, duration, [...relPoints]);
      setLastFlickShot(flickRecord);
      setLiveStrokeRelPoints([]);

      const swipeInput: SwipeThrowInput = {
        startX: swipeStartRef.current.x,
        startY: swipeStartRef.current.y,
        endX,
        endY,
        durationMs: duration,
        points: [...strokePointsRef.current],
      };

      swipeStartRef.current = null;
      executeSwipeThrow(swipeInput, flickRecord);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleToggleRecordMouseStroke = () => {
    if (disabled || stuckDarts.length >= 3 || isThrowing) return;

    if (!isRecordingMouseStroke) {
      setIsRecordingMouseStroke(true);
      strokePointsRef.current = [];
      swipeStartRef.current = null;
      setLastFlickShot(null);
      setLiveStrokeRelPoints([]);
      setLastThrowFeedback('Recording stroke... Move mouse upward and click to release!');

      const runway = runwayRef.current;
      const rect = runway ? runway.getBoundingClientRect() : null;
      const localRelPoints: { x: number; y: number }[] = [];

      const handleMove = (e: MouseEvent) => {
        if (!swipeStartRef.current) {
          swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        }
        strokePointsRef.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });

        if (rect) {
          const rx = Math.max(8, Math.min(rect.width - 8, e.clientX - rect.left));
          const ry = Math.max(8, Math.min(rect.height - 8, e.clientY - rect.top));
          localRelPoints.push({ x: rx, y: ry });
          setLiveStrokeRelPoints([...localRelPoints]);
        }

        const dx = e.clientX - swipeStartRef.current.x;
        const dy = e.clientY - swipeStartRef.current.y;
        const dur = Math.max(1, Date.now() - swipeStartRef.current.time);
        setLiveTrajectory({ dx, dy, speed: Math.hypot(dx, dy) / dur });
      };

      const handleClickRelease = (e: MouseEvent) => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('click', handleClickRelease, true);
        setIsRecordingMouseStroke(false);

        if (!swipeStartRef.current || strokePointsRef.current.length < 2) {
          setLastThrowFeedback('Stroke cancelled');
          setLiveTrajectory(null);
          setLiveStrokeRelPoints([]);
          return;
        }

        const duration = Date.now() - swipeStartRef.current.time;
        const endX = e.clientX;
        const endY = e.clientY;
        const dy = endY - swipeStartRef.current.y;
        const dx = endX - swipeStartRef.current.x;

        if (rect && localRelPoints.length < 2) {
          const rx = Math.max(8, Math.min(rect.width - 8, endX - rect.left));
          const ry = Math.max(8, Math.min(rect.height - 8, endY - rect.top));
          localRelPoints.push({ x: rx, y: ry });
        }

        const flickRecord = evaluateShotQuality(dx, dy, duration, [...localRelPoints]);
        setLastFlickShot(flickRecord);
        setLiveStrokeRelPoints([]);

        const swipeInput: SwipeThrowInput = {
          startX: swipeStartRef.current.x,
          startY: swipeStartRef.current.y,
          endX,
          endY,
          durationMs: duration,
          points: [...strokePointsRef.current],
        };

        executeSwipeThrow(swipeInput, flickRecord);
      };

      setTimeout(() => {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('click', handleClickRelease, true);
      }, 50);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || stuckDarts.length >= 3 || isThrowing) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (controlMode === 'timing' && e.code === 'Space') {
        e.preventDefault();
        handleTimingStep();
      } else if (controlMode === 'swipe' && (e.code === 'ArrowUp' || e.code === 'Space') && !isKeyCharging) {
        e.preventDefault();
        setIsKeyCharging(true);
        keyChargeStartRef.current = Date.now();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (controlMode === 'swipe' && (e.code === 'ArrowUp' || e.code === 'Space') && isKeyCharging) {
        e.preventDefault();
        setIsKeyCharging(false);
        const duration = Date.now() - keyChargeStartRef.current;
        const upwardDistance = Math.min(240, Math.max(60, duration * 0.7));
        const runwayW = runwayRef.current ? runwayRef.current.clientWidth : 260;
        const runwayH = runwayRef.current ? runwayRef.current.clientHeight : 310;
        const startX = runwayW / 2;
        const startY = runwayH - 40;
        const endX = runwayW / 2;
        const endY = Math.max(40, startY - upwardDistance);

        const kbPoints = [
          { x: startX, y: startY },
          { x: endX, y: endY },
        ];

        const flickRecord = evaluateShotQuality(0, -upwardDistance, duration, kbPoints);
        setLastFlickShot(flickRecord);
        setLiveStrokeRelPoints([]);

        const swipeInput: SwipeThrowInput = {
          startX: 0,
          startY: upwardDistance,
          endX: 0,
          endY: 0,
          durationMs: Math.max(120, Math.min(350, duration)),
        };
        executeSwipeThrow(swipeInput, flickRecord);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlMode, timingStage, disabled, stuckDarts, isThrowing, isKeyCharging, executeSwipeThrow]);

  const handleBoardClick = (x: number, y: number) => {
    if (disabled || isThrowing) return;
    setAimPoint({ x, y });

    if (controlMode === 'tap' && stuckDarts.length < 3) {
      const hit = ThrowPhysicsEngine.resolveTapThrow(player, x, y, sway);
      processLandedDart(hit, 'Quick Tap Executed');
    }
  };

  const handleQuickAim = (seg: number, mult: 1 | 2 | 3 = 1) => {
    const coords = DartboardGeometry.getTargetCoordinates(seg, mult);
    setAimPoint({ x: coords.x, y: coords.y });
  };

  const handleUndo = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsAutoAdvancing(false);
    if (stuckDarts.length === 0) return;
    setStuckDarts(stuckDarts.slice(0, -1));
    setLastThrowFeedback(null);
    setLastFlickShot(null);
    setLiveStrokeRelPoints([]);
  };

  const handleConfirmVisit = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsAutoAdvancing(false);
    if (stuckDarts.length === 0) return;
    const dartResults: DartResult[] = stuckDarts.map(
      d => new DartResult(player.id, d.segment, d.multiplier, 'manual', true)
    );
    onConfirmVisit(dartResults);
    setStuckDarts([]);
    setLastThrowFeedback(null);
    setLastFlickShot(null);
    setLiveStrokeRelPoints([]);
  };

  const currentVisitTotal = stuckDarts.reduce((acc, d) => acc + d.segment * d.multiplier, 0);

  return (
    <div className="w-full mx-auto space-y-3 font-sans animate-fade-in">
      {/* Top Header Controls Strip */}
      <div className="flex items-center justify-between gap-2 flex-wrap p-2 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setControlMode('timing');
              setTimingStage('idle');
              setLastFlickShot(null);
              setLiveStrokeRelPoints([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              controlMode === 'timing' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2-Stage Timing</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setControlMode('swipe');
              setLastFlickShot(null);
              setLiveStrokeRelPoints([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              controlMode === 'swipe' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Mouse/Touch Flick</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setControlMode('tap');
              setLastFlickShot(null);
              setLiveStrokeRelPoints([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              controlMode === 'tap' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
            title="Dev & Rapid Testing Mode"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Quick Tap (Test)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {targetMultiplier === 2 && (
            <div className="px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Tension Cam</span>
            </div>
          )}

          {sway.isHighPressure && (
            <div className="px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[11px] font-mono font-bold flex items-center gap-1.5 animate-pulse shadow-md" title={`Match Pressure Active: Composure ${player.attributes.pressure}/100`}>
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>Pulse ({player.attributes.pressure})</span>
            </div>
          )}

          {suggestedCheckout && (
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <span>🎯 Checkout:</span>
              <span className="font-mono">{suggestedCheckout}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
            title="Toggle Close-up Cam"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4 text-amber-400" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 2-Column Side-by-Side Play Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: Virtual Dartboard & Quick Aim Presets */}
        <div className="lg:col-span-7 flex flex-col items-center justify-between bg-neutral-950/90 p-3 sm:p-4 rounded-3xl border border-neutral-800/80 shadow-2xl relative">
          <VirtualDartboard
            stuckDarts={stuckDarts}
            aimPoint={aimPoint}
            sway={sway}
            onBoardClick={handleBoardClick}
            isThrowing={isThrowing}
            flyingDartCoord={flyingDartCoord}
            zoomTarget={isZoomed ? aimPoint : null}
            highlightSegment={targetSegment}
            highlightMultiplier={targetMultiplier}
          />

          {isSwiping && liveTrajectory && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="bg-black/80 px-3 py-1 rounded-full border border-amber-500 text-amber-400 text-xs font-mono font-black animate-pulse shadow-xl">
                Flick Speed: {liveTrajectory.speed.toFixed(2)} px/ms
              </div>
            </div>
          )}

          {/* Quick Aim Presets docked cleanly below board in normal flow */}
          <div className="flex items-center justify-center gap-1.5 pt-2.5 flex-wrap pointer-events-auto">
            <span className="text-[10px] uppercase font-bold text-neutral-500 mr-0.5">Aim:</span>
            <button
              type="button"
              onClick={() => handleQuickAim(20, 3)}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-neutral-700 text-amber-400 font-mono text-xs font-bold shadow-sm hover:border-amber-500"
            >
              T20
            </button>
            <button
              type="button"
              onClick={() => handleQuickAim(19, 3)}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-neutral-700 text-amber-400 font-mono text-xs font-bold shadow-sm hover:border-amber-500"
            >
              T19
            </button>
            <button
              type="button"
              onClick={() => handleQuickAim(18, 3)}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-neutral-700 text-amber-400 font-mono text-xs font-bold shadow-sm hover:border-amber-500"
            >
              T18
            </button>
            <button
              type="button"
              onClick={() => handleQuickAim(16, 2)}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-neutral-700 text-emerald-400 font-mono text-xs font-bold shadow-sm hover:border-emerald-500"
            >
              D16
            </button>
            <button
              type="button"
              onClick={() => handleQuickAim(20, 2)}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-neutral-700 text-emerald-400 font-mono text-xs font-bold shadow-sm hover:border-emerald-500"
            >
              D20
            </button>
            <button
              type="button"
              onClick={() => handleQuickAim(25, 2)}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-neutral-700 text-rose-400 font-mono text-xs font-bold shadow-sm hover:border-rose-500"
            >
              BULL
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Throw Controls & Visit Hub */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-3">
          {/* Main Controls by active mode */}
          {controlMode === 'timing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider ${
                      timingStage === 'stage1_x'
                        ? 'bg-blue-500 text-white'
                        : lockedX !== null
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    1. X-Aim {lockedX !== null ? '✓' : ''}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider ${
                      timingStage === 'stage2_y'
                        ? 'bg-amber-500 text-black'
                        : lockedY !== null
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    2. Power {lockedY !== null ? '✓' : ''}
                  </span>
                </div>

                {timingStage !== 'idle' && (
                  <button
                    type="button"
                    onClick={handleResetTiming}
                    className="text-neutral-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
                  <span>Stage 1: Horizontal Aim</span>
                  <span className="font-mono text-amber-400">
                    {lockedX !== null ? `Locked: ${lockedX}%` : timingStage === 'stage1_x' ? 'Oscillating...' : 'Ready'}
                  </span>
                </div>
                <div className="relative w-full h-6 bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex items-center">
                  <div className="absolute left-[45%] w-[10%] h-full bg-emerald-500/30 border-x border-emerald-400" />
                  <div className="absolute left-[30%] w-[40%] h-full bg-amber-500/10 border-x border-amber-500/30 pointer-events-none" />

                  <div
                    className={`absolute w-2.5 h-full rounded-full transition-all duration-75 shadow-lg ${
                      lockedX !== null
                        ? 'bg-emerald-400 ring-2 ring-emerald-300'
                        : timingStage === 'stage1_x'
                        ? 'bg-blue-400'
                        : 'bg-neutral-700'
                    }`}
                    style={{
                      left: `${lockedX !== null ? lockedX : meterXValue}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
                  <span>Stage 2: Elevation / Power</span>
                  <span className="font-mono text-amber-400">
                    {lockedY !== null ? `Locked: ${lockedY}%` : timingStage === 'stage2_y' ? 'Oscillating...' : 'Pending Stage 1'}
                  </span>
                </div>
                <div className="relative w-full h-6 bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex items-center">
                  <div className="absolute left-[45%] w-[10%] h-full bg-emerald-500/30 border-x border-emerald-400" />
                  <div className="absolute left-[30%] w-[40%] h-full bg-amber-500/10 border-x border-amber-500/30 pointer-events-none" />

                  <div
                    className={`absolute w-2.5 h-full rounded-full transition-all duration-75 shadow-lg ${
                      lockedY !== null
                        ? 'bg-emerald-400 ring-2 ring-emerald-300'
                        : timingStage === 'stage2_y'
                        ? 'bg-amber-400'
                        : 'bg-neutral-700'
                    }`}
                    style={{
                      left: `${lockedY !== null ? lockedY : meterYValue}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={disabled || stuckDarts.length >= 3 || isThrowing}
                onClick={handleTimingStep}
                className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  stuckDarts.length >= 3
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : timingStage === 'idle'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-blue-500/20'
                    : timingStage === 'stage1_x'
                    ? 'bg-gradient-to-r from-blue-400 to-amber-400 text-black animate-pulse shadow-amber-500/20'
                    : timingStage === 'stage2_y'
                    ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-black animate-pulse shadow-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {stuckDarts.length >= 3
                    ? '3 DARTS THROWN'
                    : timingStage === 'idle'
                    ? 'START THROW (OR SPACEBAR)'
                    : timingStage === 'stage1_x'
                    ? 'LOCK X-AIM LINE'
                    : timingStage === 'stage2_y'
                    ? 'RELEASE DART (POWER)!'
                    : 'THROWING...'}
                </span>
              </button>
            </div>
          )}

          {controlMode === 'swipe' && (
            <div className="space-y-2.5">
              {/* Vertical Throwing Runway with SVG Stroke Line & Quality Badge */}
              <div
                ref={runwayRef}
                onPointerDown={handlePointerDown}
                className={`w-full max-w-[260px] h-[210px] sm:h-[230px] mx-auto rounded-3xl border-2 border-dashed flex flex-col items-center justify-between p-2.5 sm:p-3 transition-all select-none touch-none relative overflow-hidden shadow-2xl ${
                  stuckDarts.length >= 3
                    ? 'bg-neutral-950/80 border-neutral-800 text-neutral-600 cursor-not-allowed'
                    : isSwiping
                    ? 'bg-amber-500/10 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 cursor-grabbing'
                    : 'bg-neutral-950 hover:bg-neutral-900 border-amber-500/50 text-amber-400 hover:border-amber-400 cursor-grab active:cursor-grabbing'
                }`}
              >
                {/* SVG Stroke Tracking Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
                  <defs>
                    <filter id="flick-glow-green" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" />
                    </filter>
                    <filter id="flick-glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" />
                    </filter>
                    <filter id="flick-glow-red" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" />
                    </filter>
                  </defs>

                  {/* Live stroke polyline while dragging */}
                  {isSwiping && liveStrokeRelPoints.length > 1 && (
                    <g>
                      <polyline
                        points={liveStrokeRelPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="4 2"
                      />
                      <circle
                        cx={liveStrokeRelPoints[liveStrokeRelPoints.length - 1].x}
                        cy={liveStrokeRelPoints[liveStrokeRelPoints.length - 1].y}
                        r="5"
                        fill="#38bdf8"
                      />
                    </g>
                  )}

                  {/* Completed stroke line from last throw */}
                  {!isSwiping && lastFlickShot && lastFlickShot.points.length > 1 && (
                    <g>
                      {/* Outer glowing stroke */}
                      <polyline
                        points={lastFlickShot.points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={
                          lastFlickShot.quality === 'green'
                            ? '#10b981'
                            : lastFlickShot.quality === 'amber'
                            ? '#f59e0b'
                            : '#ef4444'
                        }
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={
                          lastFlickShot.quality === 'green'
                            ? 'url(#flick-glow-green)'
                            : lastFlickShot.quality === 'amber'
                            ? 'url(#flick-glow-amber)'
                            : 'url(#flick-glow-red)'
                        }
                        opacity="0.9"
                      />

                      {/* Inner crisp line */}
                      <polyline
                        points={lastFlickShot.points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Click start anchor dot */}
                      <circle
                        cx={lastFlickShot.points[0].x}
                        cy={lastFlickShot.points[0].y}
                        r="5"
                        fill={
                          lastFlickShot.quality === 'green'
                            ? '#10b981'
                            : lastFlickShot.quality === 'amber'
                            ? '#f59e0b'
                            : '#ef4444'
                        }
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* Release tip anchor dot */}
                      <circle
                        cx={lastFlickShot.points[lastFlickShot.points.length - 1].x}
                        cy={lastFlickShot.points[lastFlickShot.points.length - 1].y}
                        r="6"
                        fill="#ffffff"
                        stroke={
                          lastFlickShot.quality === 'green'
                            ? '#10b981'
                            : lastFlickShot.quality === 'amber'
                            ? '#f59e0b'
                            : '#ef4444'
                        }
                        strokeWidth="3"
                      />
                    </g>
                  )}
                </svg>

                {/* Quality Feedback Badge Overlay in center of runway */}
                {lastFlickShot && !isSwiping && (
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-2xl border text-center shadow-2xl backdrop-blur-md transition-all pointer-events-none ${
                      lastFlickShot.quality === 'green'
                        ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-200 shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                        : lastFlickShot.quality === 'amber'
                        ? 'bg-amber-950/95 border-amber-500/80 text-amber-200 shadow-amber-500/30 ring-2 ring-amber-400/40'
                        : 'bg-rose-950/95 border-rose-500/80 text-rose-200 shadow-rose-500/30 ring-2 ring-rose-400/40'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-black tracking-wider uppercase flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span>{lastFlickShot.badgeText}</span>
                    </div>
                    <div className="text-[10px] font-mono mt-0.5 whitespace-nowrap opacity-95">
                      {lastFlickShot.subText}
                    </div>
                  </div>
                )}

                {/* TOP: Release Target Zone */}
                <div className="flex flex-col items-center gap-0.5 text-center pointer-events-none z-10">
                  <ArrowUp className={`w-7 h-7 ${isSwiping ? 'animate-bounce text-emerald-400' : 'text-amber-400'}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    {stuckDarts.length >= 3
                      ? '3 Darts Thrown'
                      : isSwiping
                      ? 'Release Mouse to Throw!'
                      : 'Target Release Zone'}
                  </span>
                  <span className="text-[9px] text-neutral-400">
                    Fast = High • Slow = Low
                  </span>
                </div>

                {/* CENTER: Vertical Alignment Track & Lateral Veer Alert */}
                <div className="w-full flex-1 flex items-center justify-center relative pointer-events-none py-1">
                  <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-amber-500/25" />

                  {liveTrajectory && Math.abs(liveTrajectory.dx) > 10 && (
                    <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-md animate-pulse z-20 bg-rose-950/90 text-rose-300 border-rose-500/60 whitespace-nowrap">
                      ⚠️ Veering {liveTrajectory.dx > 0 ? 'Right' : 'Left'} (Severe Drift!)
                    </div>
                  )}

                  <div className="flex flex-col justify-between h-full text-[9px] font-mono text-neutral-600 select-none py-1">
                    <span>• | •</span>
                    <span>• | •</span>
                  </div>
                </div>

                {/* BOTTOM: Strike Pad (Click & Flick Start) */}
                <div className="w-full p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center pointer-events-none z-10 space-y-0.5">
                  <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center justify-center gap-1">
                    <Hand className="w-3.5 h-3.5 text-amber-400" />
                    <span>CLICK & FLICK UPWARD</span>
                  </span>
                  <span className="text-[9px] text-neutral-400 block leading-tight">
                    Straight flick = Bullseye • Veer = Severe Penalty
                  </span>
                </div>
              </div>

              {/* Auxiliary Tools */}
              <div className="flex items-center justify-between gap-2 max-w-[260px] mx-auto">
                <button
                  type="button"
                  disabled={disabled || stuckDarts.length >= 3 || isThrowing}
                  onClick={handleToggleRecordMouseStroke}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isRecordingMouseStroke
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>{isRecordingMouseStroke ? 'Finish Stroke' : 'Trackpad Mode'}</span>
                </button>

                <div className="text-[10px] text-neutral-400 font-mono px-2 py-1.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-amber-400 font-bold">Space / ↑</span> Hold
                </div>
              </div>
            </div>
          )}

          {controlMode === 'tap' && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                <MousePointer className="w-3.5 h-3.5" />
                <span>⚡ Quick Tap (Test & Dev Mode Active)</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Click any bed on the dartboard on the left to throw with calibrated player RPG attributes.
              </p>
            </div>
          )}

          {lastThrowFeedback && (
            <div className="text-center text-[11px] font-mono font-bold text-amber-300 py-1 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fade-in">
              {lastThrowFeedback}
            </div>
          )}

          {/* Bottom Visit Tray & Confirmation Actions */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(idx => {
                const dart = stuckDarts[idx];
                return (
                  <div
                    key={idx}
                    className={`w-11 h-8 rounded-lg flex flex-col items-center justify-center font-mono text-[11px] font-bold border transition-all ${
                      dart
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-600'
                    }`}
                  >
                    <span className="text-[8px] text-neutral-500 leading-none">D{idx + 1}</span>
                    <span className="leading-tight">{dart ? dart.label : '—'}</span>
                  </div>
                );
              })}
              <div className="ml-1 pl-2 border-l border-neutral-800">
                <span className="text-[9px] text-neutral-500 block">Total</span>
                <span className="font-mono text-sm font-black text-white">{currentVisitTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={stuckDarts.length === 0 || disabled || isThrowing}
                onClick={handleUndo}
                className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo Last Dart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={stuckDarts.length === 0 || disabled}
                onClick={handleConfirmVisit}
                className={`px-3 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1 ${
                  isAutoAdvancing
                    ? 'bg-emerald-400 text-black shadow-emerald-400/30 animate-pulse'
                    : stuckDarts.length === 3
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : stuckDarts.length > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  {isAutoAdvancing
                    ? 'Auto...'
                    : stuckDarts.length === 3
                    ? 'Confirm 3'
                    : 'Log'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
