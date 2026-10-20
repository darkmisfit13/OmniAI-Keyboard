import React, { useState } from 'react';
import { HoloOrb, OrbPhase } from './HoloOrb';
import { 
  Sparkles, 
  Wand2, 
  Send, 
  Copy, 
  Check, 
  Mic, 
  RotateCcw, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  Briefcase,
  Smile,
  Shield,
  Lightbulb,
  Info
} from 'lucide-react';

interface AIKeyboardBarProps {
  currentText: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  suggestedReplies: string[];
  liveAdvice: string[];
  onSelectSuggestion: (text: string) => void;
  onRewrite: (style: string) => void;
  onRequestInstantAdvice: () => void;
  isAnalyzing: boolean;
  orbPhase: OrbPhase;
  screenName: string;
}

export const AIKeyboardBar: React.FC<AIKeyboardBarProps> = ({
  currentText,
  onChangeText,
  onSend,
  suggestedReplies,
  liveAdvice,
  onSelectSuggestion,
  onRewrite,
  onRequestInstantAdvice,
  isAnalyzing,
  orbPhase,
  screenName,
}) => {
  const [copied, setCopied] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMicDictate = () => {
    // Dictation simulation / Web Speech API if supported
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsListening(true);
      setTimeout(() => {
        onChangeText(currentText ? `${currentText} (voice note captured)` : 'Checking on the build status right now.');
        setIsListening(false);
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChangeText(currentText ? `${currentText} ${transcript}` : transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const toneOptions = [
    { id: 'professional', label: 'Professional', icon: Briefcase, color: 'text-blue-400' },
    { id: 'punchy', label: 'Punchy & Fast', icon: Flame, color: 'text-amber-400' },
    { id: 'diplomatic', label: 'Diplomatic & Calm', icon: Shield, color: 'text-emerald-400' },
    { id: 'flirty', label: 'Witty & Playful', icon: Smile, color: 'text-pink-400' },
    { id: 'fix_grammar', label: 'Fix & Polish', icon: Sparkles, color: 'text-cyan-400' },
  ];

  return (
    <div className="flex flex-col bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl relative z-20">
      {/* 1. TOP INTELLIGENCE STATUS STRIP */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Reactive HoloOrb */}
          <HoloOrb
            phase={orbPhase}
            size="sm"
            onClick={onRequestInstantAdvice}
          />

          {/* In-the-moment live advice marquee / pill */}
          <div 
            onClick={() => setShowAdviceModal(true)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-300 hover:bg-cyan-900/50 cursor-pointer truncate transition max-w-[85%]"
            title="Click for full AI coaching"
          >
            <Lightbulb className="w-3 h-3 text-cyan-400 shrink-0 animate-pulse" />
            <span className="truncate font-medium">
              {liveAdvice[0] || 'Omni watching screen... tap for live coaching.'}
            </span>
            <Info className="w-3 h-3 text-cyan-400/70 shrink-0 ml-0.5" />
          </div>
        </div>

        {/* Tone menu toggle */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setShowToneMenu(!showToneMenu)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              showToneMenu
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Rewrite Tone"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px]">Tone</span>
          </button>
        </div>
      </div>

      {/* TONE POPOVER / SELECTOR */}
      {showToneMenu && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-2 bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2 duration-150">
          {toneOptions.map((tone) => {
            const Icon = tone.icon;
            return (
              <button
                key={tone.id}
                onClick={() => {
                  onRewrite(tone.id);
                  setShowToneMenu(false);
                }}
                disabled={!currentText.trim() || isAnalyzing}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/80 transition text-center disabled:opacity-40"
              >
                <Icon className={`w-4 h-4 mb-1 ${tone.color}`} />
                <span className="text-[10px] font-medium text-slate-200">{tone.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. LIVE SUGGESTION PILLS RIBBON */}
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar bg-slate-950/80">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Suggestions:
        </span>

        {isAnalyzing ? (
          <div className="flex items-center gap-2 text-xs text-cyan-400/80 animate-pulse px-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Omni reading screen and drafting replies...</span>
          </div>
        ) : suggestedReplies && suggestedReplies.length > 0 ? (
          suggestedReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(reply)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 border border-cyan-500/30 hover:border-cyan-400 hover:from-cyan-950/40 hover:to-slate-800 text-xs text-slate-200 whitespace-nowrap shadow-sm transition active:scale-95 group"
            >
              <span className="text-cyan-400 text-[10px] font-bold group-hover:translate-x-0.5 transition-transform">
                {idx + 1}.
              </span>
              <span className="truncate max-w-[200px] sm:max-w-[280px] font-medium">
                {reply}
              </span>
            </button>
          ))
        ) : (
          <button
            onClick={onRequestInstantAdvice}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 px-2"
          >
            Tap to analyze active screen
          </button>
        )}
      </div>

      {/* 3. ACTIVE TYPING DOCK */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 border-t border-slate-800/80">
        <button
          onClick={handleMicDictate}
          className={`p-2 rounded-xl border transition ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Dictate with voice"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Text Input / Buffer */}
        <div className="relative flex-1">
          <input
            type="text"
            value={currentText}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSend(currentText);
              }
            }}
            placeholder="Type with Omni AI assistance..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition pr-8"
          />
          {currentText && (
            <button
              onClick={() => onChangeText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              title="Clear text"
            >
              ×
            </button>
          )}
        </div>

        {/* Copy to phone clipboard */}
        <button
          onClick={handleCopy}
          disabled={!currentText}
          className={`p-2 rounded-xl border transition disabled:opacity-30 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Copy text to phone clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Send / Insert into screen */}
        <button
          onClick={() => onSend(currentText)}
          disabled={!currentText}
          className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-40"
          title="Send into conversation"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* ADVICE DETAIL MODAL */}
      {showAdviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HoloOrb phase="suggesting" size="sm" />
                <h3 className="text-sm font-semibold text-white">Omni Live Screen Coaching</h3>
              </div>
              <button
                onClick={() => setShowAdviceModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Active Screen Context
                </span>
                <p className="text-xs text-slate-300">{screenName}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  In-The-Moment Advice & Insights
                </span>
                <div className="space-y-2">
                  {liveAdvice.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAdviceModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition"
            >
              Resume Typing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
