/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Player, NPC, Chest } from '../types';
import { MapManager } from '../map';
import { Som } from '../sound';

interface MiniMapProps {
  player: Player;
  npcs: NPC[];
  chests: Chest[];
  mapManager: MapManager;
}

export const MiniMap: React.FC<MiniMapProps> = ({ player, npcs, chests, mapManager }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
      // Auto collapse on mobile
      if (mobile) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = mapManager.COLS;
    const rows = mapManager.ROWS;
    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / cols;
    const cellH = h / rows;

    // 1. Clear background
    ctx.fillStyle = '#0f172a'; // Slate background for border
    ctx.fillRect(0, 0, w, h);

    // 2. Draw map biomes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let color = '#22c55e'; // default grass

        // Rivers and lakes
        const isVerticalRiver = (c === 18 || c === 19) && (r > 2 && r < 40);
        const isHorizontalRiver = (r === 14 || r === 15) && (c > 2 && c < 55);
        const isLago = (r >= 3 && r <= 10) && (c >= 47 && c <= 54);

        if (isLago || isVerticalRiver || isHorizontalRiver) {
          const isBridge = (isHorizontalRiver && (c === 6 || c === 14 || c === 22 || c === 30 || c === 38 || c === 46 || c === 52)) ||
                           (isVerticalRiver && (r === 6 || r === 12 || r === 18 || r === 24 || r === 30 || r === 36));
          color = isBridge ? '#854d0e' : '#2563eb';
        } else if (r < 12) {
          if (c < 20) {
            color = '#e2e8f0'; // Snow
          } else {
            color = '#15803d'; // Bamboo / dark grass
          }
        } else if (r > 30 && c < 18) {
          color = '#eab308'; // Desert
        } else if (r >= 30 && c >= 35) {
          color = '#b91c1c'; // Lava
        } else {
          color = '#4ade80'; // Light grass / village
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    // 3. Draw Chests (Baus)
    chests.forEach((chest) => {
      const mc = Math.floor(chest.x / mapManager.TILE_SIZE);
      const mr = Math.floor(chest.y / mapManager.TILE_SIZE);
      
      ctx.fillStyle = chest.aberto ? '#475569' : '#f59e0b'; // Gold for unopened, gray for opened
      ctx.beginPath();
      ctx.arc((mc + 0.5) * cellW, (mr + 0.5) * cellH, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw NPCs
    npcs.forEach((npc) => {
      const mc = Math.floor(npc.x / mapManager.TILE_SIZE);
      const mr = Math.floor(npc.y / mapManager.TILE_SIZE);

      // Blinking circle for NPC
      const isBlink = Math.sin(Date.now() / 150) > 0;
      ctx.fillStyle = isBlink ? '#c084fc' : npc.color;
      ctx.beginPath();
      ctx.arc((mc + 0.5) * cellW, (mr + 0.5) * cellH, 3.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw tiny outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // 5. Draw Player
    const pCol = Math.floor(player.x / mapManager.TILE_SIZE);
    const pRow = Math.floor(player.y / mapManager.TILE_SIZE);
    
    // Pulse ring
    const pulseRadius = 4 + Math.abs(Math.sin(Date.now() / 200)) * 3;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc((pCol + 0.5) * cellW, (pRow + 0.5) * cellH, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Player dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc((pCol + 0.5) * cellW, (pRow + 0.5) * cellH, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [player, npcs, chests, mapManager]);

  if (collapsed) {
    return (
      <button
        onClick={() => {
          Som.click();
          setCollapsed(false);
        }}
        className={`absolute ${isTouch ? 'bottom-20 right-2' : 'bottom-2 right-2 sm:bottom-4 sm:right-4'} bg-slate-950/95 hover:bg-slate-900 border-2 border-red-700 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-1 select-none pointer-events-auto z-20 text-[9px] font-mono font-bold text-amber-400 cursor-pointer transition-transform hover:scale-105 active:scale-95`}
      >
        🗺️ MAPA
      </button>
    );
  }

  return (
    <div className={`absolute ${isTouch ? 'bottom-20 right-2' : 'bottom-2 right-2 sm:bottom-4 sm:right-4'} bg-slate-950/95 border-2 border-red-700/80 rounded p-1.5 shadow-2xl flex flex-col items-center gap-1.5 select-none pointer-events-auto z-20 w-[146px]`}>
      <div className="flex items-center justify-between w-full px-1 gap-2">
        <span className="text-[7.5px] font-extrabold text-amber-400 font-mono tracking-widest">MAPA DA ILHA</span>
        <button
          onClick={() => {
            Som.click();
            setCollapsed(true);
          }}
          className="text-[9px] text-red-400 hover:text-red-300 px-1 font-bold cursor-pointer font-mono"
        >
          [X]
        </button>
      </div>
      
      <div className="relative border border-slate-800 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          width={132}
          height={99}
          className="block image-render-pixelated"
        />
      </div>

      <div className="flex gap-1.5 text-[6px] font-mono text-slate-300 leading-none">
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-1 bg-white rounded-full inline-block border border-black" /> Você
        </div>
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-1 bg-purple-400 rounded-full inline-block" /> Champ
        </div>
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-1 bg-amber-500 rounded-full inline-block" /> Baú
        </div>
      </div>
    </div>
  );
};
