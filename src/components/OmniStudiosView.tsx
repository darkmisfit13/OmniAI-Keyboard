import React, { useState } from 'react';
import { 
  Bot, 
  Mic, 
  Code2, 
  FolderLock, 
  Send, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  Trash2,
  Bookmark,
  Compass
} from 'lucide-react';
import { HoloOrb, OrbPhase } from './HoloOrb';
import { omniVoice } from '../lib/omniVoice';

interface OmniStudiosViewProps {
  onInsertToKeyboard: (text: string) => void;
  currentScreenName: string;
}

export const OmniStudiosView: React.FC<OmniStudiosViewProps> = ({
  onInsertToKeyboard,
  currentScreenName,
}) => {
  const [activeStudio, setActiveStudio] = useState<'orb' | 'chat' | 'voice' | 'forge' | 'vault'>('orb');
  const [orbDemoPhase, setOrbDemoPhase] = useState<OrbPhase>('idle');

  // OmniChat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Greetings. I am Omni, your mobile keyboard consciousness. I am actively tracking your screen ("${currentScreenName}"). How can I advise you?`,
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // OmniVoice state
  const [voiceDraft, setVoiceDraft] = useState('');
  const [voiceTone, setVoiceTone] = useState<'casual' | 'executive' | 'energetic'>('executive');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [voiceResult, setVoiceResult] = useState('');

  // OmniForge state
  const [forgePrompt, setForgePrompt] = useState('');
  const [forgeOutput, setForgeOutput] = useState('');
  const [isForging, setIsForging] = useState(false);

  // Vault saved items
  const [savedSnippets, setSavedSnippets] = useState<string[]>([
    'Thank you for reaching out! Reviewing the details and will revert shortly.',
    'I will be running 5 minutes late to our sync—feel free to start without me.',
    'Per our agreement, please find the updated invoice specifications attached.',
    'Would love to grab coffee this Thursday around 3 PM if you are free!',
  ]);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  // Handle OmniChat send
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          history: chatMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          screenContext: currentScreenName,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'I am processing your screen and ready to assist.',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I am tracking your screen context. Consider keeping your current reply concise and focused on the deadline.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle OmniForge generate
  const handleForge = async (type: string) => {
    setIsForging(true);
    setForgeOutput('');
    try {
      const res = await fetch('/api/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a short mobile code snippet or system prompt for: ${type}. Keep it concise and clean for mobile display.`,
          screenContext: currentScreenName,
        }),
      });
      const data = await res.json();
      setForgeOutput(data.reply || '// Generated code snippet');
    } catch {
      setForgeOutput('// OmniForge generation ready');
    } finally {
      setIsForging(false);
    }
  };

  const studios = [
    { id: 'orb', label: 'OmniAI', icon: Sparkles },
    { id: 'chat', label: 'OmniChat', icon: Bot },
    { id: 'voice', label: 'OmniVoice', icon: Mic },
    { id: 'forge', label: 'OmniForge', icon: Code2 },
    { id: 'vault', label: 'Vault', icon: FolderLock },
  ];

  return (
    <div className="flex flex-col h-full bg-[#090e18] text-slate-100">
      {/* Studio Top Navigation Bar */}
      <div className="flex items-center justify-around p-2 bg-slate-900 border-b border-slate-800">
        {studios.map((s) => {
          const Icon = s.icon;
          const isActive = activeStudio === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStudio(s.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Content Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 0. OMNIAI - YOUR SHADOW COMPANION DECK */}
        {activeStudio === 'orb' && (
          <div className="flex flex-col items-center justify-between h-full space-y-4 animate-in fade-in">
            {/* Top info - Three.js Plasma Neural Consciousness removed per instructions */}
            <div className="w-full text-center space-y-1">
              <h2 className="text-base font-bold text-white tracking-wide font-mono">
                OmniAI - Your Shadow Companion
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Pure matte black foundations, volumetric kinetic core, and nocturnal intelligence engineered for DarkMisfitStudios.
              </p>
            </div>

            {/* 3D Hero Orb on pure matte black background */}
            <div className="relative flex flex-col items-center justify-center p-6 my-1 rounded-3xl bg-black border border-white/10 shadow-[0_0_50px_rgba(0,242,254,0.25)] w-full max-w-xs">
              <HoloOrb phase={orbDemoPhase} size="hero" showStatusLabel />
              
              <div className="mt-7 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">Current Mode:</span>
                <span className="text-[10px] font-mono font-bold text-[#00f2fe] uppercase px-2 py-0.5 rounded bg-[#00f2fe]/10 border border-[#00f2fe]/40">
                  {orbDemoPhase === 'idle' ? 'Idle (Slow Breathing)' :
                   orbDemoPhase === 'analyzing' ? 'Thinking (Turbulent Spin)' :
                   orbDemoPhase === 'talking' ? 'Talking (Sonic Resonance)' :
                   orbDemoPhase === 'texting' || orbDemoPhase === 'typing' ? 'Texting (Mechanical Cadence)' :
                   'Auto-Pilot (High-Speed)'}
                </span>
              </div>
            </div>

            {/* Interactive Kinetic State Controller */}
            <div className="w-full space-y-2 pt-1 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                Interactive Kinetic States (Dynamic Orb Motion):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'idle', label: 'Idle (Slow)', desc: 'Hypnotic calm' },
                  { id: 'analyzing', label: 'Thinking', desc: 'Turbulent spin' },
                  { id: 'talking', label: 'Talking', desc: 'Sonic waves' },
                  { id: 'texting', label: 'Texting', desc: 'Keystroke ripple' },
                  { id: 'auto', label: 'Auto Mode', desc: 'Hyper dispatch' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setOrbDemoPhase(st.id as any);
                      if (st.id === 'talking') {
                        omniVoice.speak('I am Omni. Your shadow companion. Real-time vision link established.');
                      }
                    }}
                    className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition text-center flex flex-col items-center gap-0.5 ${
                      orbDemoPhase === st.id
                        ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/50 shadow-md shadow-[#00f2fe]/20'
                        : 'bg-black/90 text-slate-400 hover:text-slate-200 border border-white/10'
                    }`}
                  >
                    <span className="font-bold">{st.label}</span>
                    <span className="text-[9px] text-slate-500">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OmniVoice Quick Speech Synthesizer Preview */}
            <div className="w-full p-3 rounded-2xl bg-black border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#00f2fe] uppercase flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#00f2fe]" />
                  OmniVoice Nocturnal Audio Engine
                </span>
                <span className="text-[9px] font-mono text-slate-400">Deep Stoic Cadence</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  'I am Omni. Your shadow companion.',
                  'The void does not negotiate. Frame your reply cold.',
                  'Autonomous auto-pilot armed. Viewport secured.'
                ].map((quote, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setOrbDemoPhase('talking');
                      omniVoice.speak(quote, {
                        onEnd: () => setOrbDemoPhase('idle'),
                      });
                    }}
                    className="flex-1 p-1.5 rounded-lg bg-[#0B0B0C] border border-white/5 hover:border-[#00f2fe]/40 text-[10px] font-mono text-slate-300 hover:text-white transition text-center truncate"
                    title={`Speak: "${quote}"`}
                  >
                    "{quote.slice(0, 18)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Official Color Palette Legend */}
            <div className="w-full p-2.5 rounded-2xl bg-black/90 border border-white/10 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700 shadow-inner" />
                <span className="text-[10px] text-slate-400">Base: Matte Black (#000000)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#7f00ff] shadow-sm shadow-[#7f00ff]/50" />
                <span className="text-[10px] text-slate-400">Plasma Violet (#7f00ff)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00f2fe] shadow-sm shadow-[#00f2fe]/50" />
                <span className="text-[10px] text-slate-400">Electric Cyan (#00f2fe)</span>
              </div>
            </div>
          </div>
        )}

        {/* 1. OMNICHAT */}
        {activeStudio === 'chat' && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <HoloOrb phase="typing" size="sm" />
              <div>
                <span className="font-semibold text-white block">Companion Stream</span>
                <span className="text-[10px] text-slate-400">Grounded in screen: {currentScreenName}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[220px]">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => onInsertToKeyboard(msg.text)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 mt-1 flex items-center gap-1 font-medium"
                    >
                      <Send className="w-2.5 h-2.5" /> Use in keyboard
                    </button>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-cyan-400/80">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Omni synthesizing thoughts...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask Omni about this screen or task..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. OMNIVOICE */}
        {activeStudio === 'voice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">OmniVoice Synthesizer</h3>
              </div>
              <p className="text-xs text-slate-400">
                Transform rough voice thoughts or messy bullets into charismatic spoken or written copy.
              </p>

              <textarea
                value={voiceDraft}
                onChange={(e) => setVoiceDraft(e.target.value)}
                placeholder="Jot down rough voice notes or messy thoughts here..."
                rows={3}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center gap-2">
                {(['executive', 'casual', 'energetic'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setVoiceTone(tone)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition ${
                      voiceTone === tone
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>

              <button
                onClick={async () => {
                  if (!voiceDraft) return;
                  setIsSynthesizing(true);
                  try {
                    const res = await fetch('/api/keyboard-rewrite', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        text: voiceDraft,
                        style: voiceTone === 'executive' ? 'professional' : voiceTone === 'casual' ? 'punchy' : 'creative',
                        screenContext: currentScreenName,
                      }),
                    });
                    const d = await res.json();
                    setVoiceResult(d.rewritten);
                  } finally {
                    setIsSynthesizing(false);
                  }
                }}
                disabled={!voiceDraft || isSynthesizing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs hover:brightness-110 transition disabled:opacity-40"
              >
                {isSynthesizing ? 'Synthesizing voice draft...' : 'Transform With OmniVoice'}
              </button>
            </div>

            {voiceResult && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2 animate-in fade-in">
                <span className="text-[10px] uppercase font-bold text-cyan-400">
                  Synthesized Output:
                </span>
                <p className="text-xs text-white leading-relaxed">{voiceResult}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onInsertToKeyboard(voiceResult)}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Use in Keyboard
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(voiceResult);
                      setSavedSnippets((prev) => [voiceResult, ...prev]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700 hover:bg-slate-700"
                  >
                    Save to Vault
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. OMNIFORGE */}
        {activeStudio === 'forge' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">OmniForge Mobile Builder</h3>
              </div>
              <p className="text-xs text-slate-400">
                Instant developer macros, regex generators, API curls, and terminal bug fixes on your phone.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleForge('Express REST API Auth middleware')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-200 transition"
                >
                  ⚡ Auth Middleware
                </button>
                <button
                  onClick={() => handleForge('React mobile touch gesture hook')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-200 transition"
                >
                  📱 Touch Hook
                </button>
                <button
                  onClick={() => handleForge('Tailwind responsive glassmorphism card')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-200 transition"
                >
                  💎 Glass UI CSS
                </button>
                <button
                  onClick={() => handleForge('Fast regex validator for emails and phones')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-200 transition"
                >
                  🔍 Regex Helper
                </button>
              </div>

              {isForging && (
                <div className="text-xs text-cyan-400 animate-pulse py-2">
                  Forging code with Gemini 3.8 Flash...
                </div>
              )}

              {forgeOutput && (
                <div className="p-3 rounded-xl bg-black border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                  {forgeOutput}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. VAULT */}
        {activeStudio === 'vault' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Keyboard Vault</h3>
              </div>
              <span className="text-[10px] text-slate-400">{savedSnippets.length} Saved</span>
            </div>

            <div className="space-y-2">
              {savedSnippets.map((snippet, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 group hover:border-cyan-500/30 transition"
                >
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed flex-1">
                    {snippet}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(snippet);
                        setCopiedSnippetIdx(idx);
                        setTimeout(() => setCopiedSnippetIdx(null), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy"
                    >
                      {copiedSnippetIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onInsertToKeyboard(snippet)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
