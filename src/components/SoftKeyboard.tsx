import React, { useState } from 'react';
import { 
  Delete, 
  ArrowUp, 
  Smile, 
  Globe, 
  CornerDownLeft, 
  Volume2, 
  VolumeX,
  ChevronDown
} from 'lucide-react';

interface SoftKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onSpace: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SoftKeyboard: React.FC<SoftKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onSpace,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isShift, setIsShift] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'alpha' | 'numbers' | 'symbols'>('alpha');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Play subtle keyboard click sound using Web Audio API
  const playClick = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch {
      // Audio not permitted or context suspended
    }
  };

  const handleKey = (char: string) => {
    playClick();
    const finalChar = isShift ? char.toUpperCase() : char.toLowerCase();
    onKeyPress(finalChar);
  };

  const handleBackspaceClick = () => {
    playClick();
    onBackspace();
  };

  const handleSpaceClick = () => {
    playClick();
    onSpace();
  };

  const handleEnterClick = () => {
    playClick();
    onEnter();
  };

  // Keyboard Rows
  const alphaRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const numberRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '#', '%'],
  ];

  const symbolRows = [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['.', ',', '?', '!', '`', '…', '"'],
  ];

  const emojis = [
    '👍', '🙌', '🔥', '✨', '💡', '🚀', '💯', '❤️',
    '😂', '🤝', '👀', '🎯', '⚡', '☕', '💼', '🙏',
  ];

  if (isCollapsed) {
    return (
      <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
        <span>Keyboard Minimized</span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Expand Keyboard ↑
          </button>
        )}
      </div>
    );
  }

  const currentRows = layoutMode === 'alpha' ? alphaRows : layoutMode === 'numbers' ? numberRows : symbolRows;

  return (
    <div className="bg-[#0b0f19] select-none border-t border-slate-800/80 p-1.5 pb-2 touch-manipulation">
      {/* Mini Keyboard Toolbar */}
      <div className="flex items-center justify-between px-2 py-0.5 text-[10px] text-slate-400 mb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 hover:text-slate-200 transition"
            title="Toggle Key Sounds"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
            <span>{soundEnabled ? 'Sound On' : 'Mute'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-cyan-400/80 font-mono">Omni Key Engine</span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hover:text-slate-200 p-0.5"
              title="Minimize Keyboard"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Emoji Drawer */}
      {showEmojiPicker && (
        <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-900 rounded-xl mb-1.5 border border-slate-800 animate-in fade-in duration-100">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                playClick();
                onKeyPress(emoji);
              }}
              className="text-lg p-1.5 rounded-lg hover:bg-slate-800 active:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Row 1 */}
      <div className="flex justify-center gap-1 mb-1">
        {currentRows[0].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="flex-1 max-w-[38px] h-10 rounded-lg bg-slate-800/90 text-white font-medium text-sm flex items-center justify-center shadow hover:bg-slate-700 active:bg-cyan-600/40 active:scale-95 transition-all border border-slate-700/60"
          >
            {isShift && layoutMode === 'alpha' ? k.toUpperCase() : k}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 mb-1 px-3">
        {currentRows[1].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="flex-1 max-w-[38px] h-10 rounded-lg bg-slate-800/90 text-white font-medium text-sm flex items-center justify-center shadow hover:bg-slate-700 active:bg-cyan-600/40 active:scale-95 transition-all border border-slate-700/60"
          >
            {isShift && layoutMode === 'alpha' ? k.toUpperCase() : k}
          </button>
        ))}
      </div>

      {/* Row 3 with Shift & Backspace */}
      <div className="flex justify-center gap-1 mb-1">
        {layoutMode === 'alpha' ? (
          <button
            onClick={() => {
              playClick();
              setIsShift(!isShift);
            }}
            className={`w-11 h-10 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all ${
              isShift
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/90 text-slate-200 border-slate-700/60 hover:bg-slate-700'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              playClick();
              setLayoutMode(layoutMode === 'numbers' ? 'symbols' : 'numbers');
            }}
            className="w-11 h-10 rounded-lg bg-slate-800/90 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-700/60 hover:bg-slate-700"
          >
            {layoutMode === 'numbers' ? '#+=' : '123'}
          </button>
        )}

        {currentRows[2].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="flex-1 max-w-[38px] h-10 rounded-lg bg-slate-800/90 text-white font-medium text-sm flex items-center justify-center shadow hover:bg-slate-700 active:bg-cyan-600/40 active:scale-95 transition-all border border-slate-700/60"
          >
            {isShift && layoutMode === 'alpha' ? k.toUpperCase() : k}
          </button>
        ))}

        <button
          onClick={handleBackspaceClick}
          className="w-11 h-10 rounded-lg bg-slate-800/90 text-slate-200 text-xs font-semibold flex items-center justify-center border border-slate-700/60 hover:bg-slate-700 active:bg-red-500/30 active:text-red-300 transition-all"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Row 4: Switch mode, Emoji, Spacebar, Return */}
      <div className="flex justify-center gap-1.5 px-0.5">
        <button
          onClick={() => {
            playClick();
            setLayoutMode(layoutMode === 'alpha' ? 'numbers' : 'alpha');
          }}
          className="w-12 h-10 rounded-lg bg-slate-800/90 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-700/60 hover:bg-slate-700"
        >
          {layoutMode === 'alpha' ? '?123' : 'ABC'}
        </button>

        <button
          onClick={() => {
            playClick();
            setShowEmojiPicker(!showEmojiPicker);
          }}
          className={`w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
            showEmojiPicker
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-800/90 text-slate-300 border-slate-700/60 hover:bg-slate-700'
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Spacebar */}
        <button
          onClick={handleSpaceClick}
          className="flex-1 h-10 rounded-lg bg-gradient-to-r from-slate-800 via-slate-800/95 to-slate-800 text-slate-400 text-xs font-medium flex items-center justify-center shadow border border-slate-700/60 hover:border-cyan-500/40 active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <span className="relative z-10 text-[11px] text-slate-300 group-hover:text-cyan-300 transition-colors">
            space
          </span>
          <div className="absolute inset-x-8 bottom-1 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        </button>

        {/* Enter key */}
        <button
          onClick={handleEnterClick}
          className="w-14 h-10 rounded-lg bg-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md shadow-cyan-600/30 hover:bg-cyan-500 active:scale-95 transition-all"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
