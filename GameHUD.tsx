/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Trophy, Sparkles, HelpCircle, Volume2, VolumeX, Backpack } from 'lucide-react';

interface GameHUDProps {
  playerHp: number;
  playerMaxHp: number;
  playerLevel: number;
  playerCristais: number;
  pocoes: number;
  onUsePotion: () => void;
  onOpenHelp: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerHp,
  playerMaxHp,
  playerLevel,
  playerCristais,
  pocoes,
  onUsePotion,
  onOpenHelp,
  soundMuted,
  onToggleSound,
}) => {
  const hpPercentage = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  return (
    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-950/95 to-slate-900/90 border-b-4 border-red-700 flex items-center justify-between px-4 sm:px-6 z-30 select-none shadow-md">
      {/* Hero Stats */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider font-mono">HERÓI</span>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wide">LUCKY 🐾</span>
            <span className="bg-blue-600/80 text-white text-[9px] px-1.5 py-0.5 rounded border border-blue-400 font-bold">Nível {playerLevel}</span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="flex flex-col w-32 sm:w-44">
          <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold mb-1 font-mono">
            <span className="flex items-center gap-1"><Heart size={10} className="fill-emerald-400" /> ENERGIA</span>
            <span>{playerHp}/{playerMaxHp}</span>
          </div>
          <div className="w-full h-3 bg-slate-950 border border-slate-700 rounded-sm overflow-hidden p-[1px]">
            <div
              className="h-full bg-emerald-500 rounded-sm transition-all duration-300"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Inventory & Medals */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Potions Box */}
        <button
          onClick={onUsePotion}
          disabled={pocoes === 0 || playerHp >= playerMaxHp}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded border-2 select-none font-mono transition-all ${
            pocoes > 0 && playerHp < playerMaxHp
              ? 'bg-emerald-950/60 border-emerald-500 hover:bg-emerald-900/80 hover:scale-105 active:scale-95 cursor-pointer text-white'
              : 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed'
          }`}
          title="Usar Poção de Cura (Tecla P)"
        >
          <Backpack size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold">POÇÕES:</span>
          <span className={`text-xs font-bold ${pocoes > 0 ? 'text-emerald-400 animate-pulse' : ''}`}>{pocoes}</span>
        </button>

        {/* Medals Display */}
        <div className="flex items-center gap-2 bg-purple-950/40 border-2 border-purple-500/80 px-2.5 py-1.5 rounded text-white font-mono">
          <Trophy size={14} className="text-yellow-400 fill-yellow-400/20" />
          <span className="text-[10px] font-bold text-purple-300 hidden sm:inline">MEDALHAS:</span>
          <span className="text-xs font-bold text-yellow-400">{playerCristais}/7</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-800 pl-3 sm:pl-4">
          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
            title={soundMuted ? 'Ativar som' : 'Mudar som'}
          >
            {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Help guides */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 rounded border border-slate-700 transition-colors cursor-pointer"
            title="Ver controles e dicas"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
