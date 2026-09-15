import React, { useState } from 'react';
import { Player } from '../../core/player/Player';
import { CareerManager } from '../../core/career/CareerManager';
import { QSchoolManager, QSchoolLeaderboardEntry } from '../../core/career/QSchoolManager';
import { Award, Trophy, ChevronRight, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface QSchoolHubModalProps {
  career: CareerManager;
  onEnterStage: () => void;
  onClose: () => void;
}

export const QSchoolHubModal: React.FC<QSchoolHubModalProps> = ({
  career,
  onEnterStage,
  onClose,
}) => {
  const currentWeek = career.calendar.currentWeek;
  const isFinalStage = currentWeek === 2;
  const stageName = isFinalStage ? 'Q-School Final Stage' : 'Q-School First Stage';
  const player = career.player;

  // Q-School Standings simulation/display
  const playerPoints = player.qSchoolPoints || 0;
  const hasCard = player.hasTourCard;
  const isQualified = isFinalStage ? true : Boolean(player.qSchoolFinalQualified);

  // Generate competitive field mock leaderboard around player
  const leaderboard: QSchoolLeaderboardEntry[] = [
    { playerId: 'p-card-1', playerName: 'Christian Kist', nationality: 'Dutch', points: 14, stageWins: 1, hasEarnedTourCard: true, isHuman: false },
    { playerId: 'p-card-2', playerName: 'Robert Owen', nationality: 'Welsh', points: 12, stageWins: 1, hasEarnedTourCard: true, isHuman: false },
    { playerId: player.id, playerName: player.name, nationality: player.nationality, points: playerPoints, stageWins: hasCard ? 1 : 0, hasEarnedTourCard: hasCard, isHuman: true },
    { playerId: 'p-card-3', playerName: 'Fallon Sherrock', nationality: 'English', points: 9, stageWins: 0, hasEarnedTourCard: false, isHuman: false },
    { playerId: 'p-card-4', playerName: 'John Henderson', nationality: 'Scottish', points: 8, stageWins: 0, hasEarnedTourCard: false, isHuman: false },
    { playerId: 'p-card-5', playerName: 'Jelle Klaasen', nationality: 'Dutch', points: 7, stageWins: 0, hasEarnedTourCard: false, isHuman: false },
    { playerId: 'p-card-6', playerName: 'Darren Webster', nationality: 'English', points: 5, stageWins: 0, hasEarnedTourCard: false, isHuman: false },
    { playerId: 'p-card-7', playerName: 'Ronny Huybrechts', nationality: 'Belgian', points: 4, stageWins: 0, hasEarnedTourCard: false, isHuman: false },
  ].sort((a, b) => b.points - a.points);

  const playerPos = leaderboard.findIndex(e => e.playerId === player.id) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-col gap-1 border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{stageName} • Robin Park, Wigan</span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-400">
              Week {currentWeek} of 52
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide pt-1">
            PDC Qualifying School Arena
          </h2>
          <p className="text-xs text-neutral-400">
            {isFinalStage
              ? 'Final Stage: 4 Days of knockout darts. Daily winners + Top Order of Merit earn an official 2-Year PDC Tour Card!'
              : 'First Stage: Battle through the field to reach the Final Stage next week and keep your Tour Card dream alive.'}
          </p>
        </div>

        {/* Tour Card Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          hasCard
            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
            : isQualified
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-neutral-950 border-neutral-800 text-neutral-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${
              hasCard ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {hasCard ? '💳' : '🎯'}
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider">
                {hasCard ? 'PDC Tour Card Secured!' : isFinalStage ? 'Tour Card Battle' : 'First Stage Qualifier'}
              </div>
              <div className="text-sm font-black text-white">
                {hasCard
                  ? 'Holder for 2026-2027 (PDC Tour Professional)'
                  : `${player.name}: ${playerPoints} Q-School Points (Rank #${playerPos})`}
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            hasCard
              ? 'bg-emerald-500 text-black'
              : playerPos <= 4
              ? 'bg-amber-500 text-black animate-pulse'
              : 'bg-neutral-800 text-neutral-400'
          }`}>
            {hasCard ? 'Tour Card Holder' : playerPos <= 4 ? 'On The Bubble' : 'Chasing Points'}
          </span>
        </div>

        {/* Live Standings Leaderboard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>Q-School Order of Merit</span>
            <span>Cut-Off Line: Top 2 Standings</span>
          </div>

          <div className="bg-neutral-950 rounded-2xl border border-neutral-800 divide-y divide-neutral-900 text-xs overflow-hidden">
            {leaderboard.map((entry, idx) => {
              const isPlayer = entry.playerId === player.id;
              const isCardZone = idx < 2 || entry.stageWins > 0;

              return (
                <div
                  key={entry.playerId}
                  className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                    isPlayer
                      ? 'bg-amber-500/10 text-amber-300 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 font-mono text-center font-bold ${idx < 2 ? 'text-amber-400' : 'text-neutral-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">
                      {entry.playerName} {isPlayer && '(YOU)'}
                    </span>
                    <span className="text-[10px] text-neutral-500">{entry.nationality}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-neutral-400">{entry.points} pts</span>
                    {entry.stageWins > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black">
                        Day Win
                      </span>
                    ) : isCardZone ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black">
                        Cut-Off
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-600">Bubble</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
          >
            Back to Calendar
          </button>

          <button
            type="button"
            onClick={onEnterStage}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Enter {isFinalStage ? 'Final Stage' : 'First Stage'} Knockout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
