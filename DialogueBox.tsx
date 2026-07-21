/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Som } from '../sound';
import { NPC } from '../types';

interface DialogueBoxProps {
  npc: NPC;
  onComplete: () => void;
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ npc, onComplete, onClose }) => {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lines = npc.dialogue;
  const currentLine = lines[currentLineIdx] || '';

  // Typewriter effect
  useEffect(() => {
    let accumulated = '';
    setDisplayedText('');
    setIsTyping(true);
    const chars = Array.from(currentLine);
    let charIdx = 0;

    // Initial chime beep for opening dialogue screen
    Som.playTone(600, 'sine', 0.05, 0.08);

    const timer = setInterval(() => {
      if (charIdx < chars.length) {
        accumulated += chars[charIdx] || '';
        setDisplayedText(accumulated);
        charIdx++;

        // Subdued blips for retro talking voice
        if (charIdx % 2 === 0) {
          const randFreq = 350 + Math.random() * 80;
          Som.playTone(randFreq, 'sine', 0.02, 0.03);
        }
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 25); // Speed: 25ms per char

    timerRef.current = timer;

    return () => {
      clearInterval(timer);
    };
  }, [currentLineIdx, currentLine]);

  const handleAdvance = () => {
    Som.click();
    if (isTyping) {
      // Complete current sentence instantly
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(currentLine);
      setIsTyping(false);
    } else {
      // Advance to next page or finish
      if (currentLineIdx < lines.length - 1) {
        setCurrentLineIdx((prev) => prev + 1);
      } else {
        // Dialogue complete!
        onComplete();
      }
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentLineIdx]);

  return (
    <div className="absolute inset-x-0 bottom-6 flex justify-center px-4 z-40 select-none">
      <div 
        onClick={handleAdvance}
        className="w-full max-w-[720px] bg-slate-950/95 border-4 border-red-700 rounded-lg shadow-2xl p-4 flex flex-col justify-between cursor-pointer border-double ring-4 ring-amber-500/80 transition-all hover:brightness-110"
      >
        {/* Dialogue header / NPC name */}
        <div className="flex items-center gap-3 border-b-2 border-red-900 pb-2 mb-2">
          {/* Micro NPC Avatar simulation */}
          <div 
            className="w-4 h-4 rounded-full border border-amber-500 animate-pulse"
            style={{ backgroundColor: npc.color }}
          />
          <span className="text-xs font-extrabold text-amber-400 font-mono tracking-wider uppercase">
            {npc.nome}
          </span>
        </div>

        {/* Dialogue main text */}
        <div className="text-slate-200 text-xs leading-relaxed min-h-[48px] font-mono whitespace-normal py-1 pr-4">
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-3.5 bg-amber-400 ml-1 animate-ping" />}
        </div>

        {/* Legend footer */}
        <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-slate-500">
          <span className="text-slate-600 hover:text-slate-400" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            [ESC] Sair
          </span>
          <span className="text-amber-500/80 animate-bounce">
            [ESPAÇO] Avançar ➔
          </span>
        </div>
      </div>
    </div>
  );
};
