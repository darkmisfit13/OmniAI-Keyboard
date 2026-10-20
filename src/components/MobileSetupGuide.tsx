import React from 'react';
import { 
  Smartphone, 
  Download, 
  Layers, 
  ShieldCheck, 
  Share2, 
  Sliders, 
  Volume2, 
  Vibrate, 
  Cpu, 
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileSetupGuideProps {
  onTestKeyboard: () => void;
}

export const MobileSetupGuide: React.FC<MobileSetupGuideProps> = ({ onTestKeyboard }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-slate-100">
      {/* 1. APP INSTALLATION HERO */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Turn into a Phone App</h2>
            <p className="text-xs text-slate-400">Install as a standalone home screen app</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Omni Keyboard AI is built as a Progressive Web App (PWA). When installed, it runs without browser url bars, works offline, and operates at native 60fps.
        </p>

        <div className="pt-2">
          <PWAInstallButton variant="full" />
        </div>
      </div>

      {/* 2. HOW KEYBOARD AI SEES YOUR SCREEN */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">How Screen Vision Works</h3>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-slate-100 block">Live Screen Perception</strong>
              Tap "Live Screen" or "Share My Screen" to let Gemini 3.8 Flash read the active window, Slack discussion, email, or chat conversation in real-time.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-slate-100 block">Keyboard Ribbon Sits Above Your Typing</strong>
              The Omni AI bar sits right above the keyboard, constantly displaying live coaching insights and 3 tactical one-tap reply pills.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-slate-100 block">One-Tap Copy to Any App</strong>
              Tap any suggestion or use the Copy icon to paste immediately into your native WhatsApp, iMessage, Slack, or Instagram apps.
            </div>
          </div>
        </div>
      </div>

      {/* 3. STEP-BY-STEP PHONE PLATFORM GUIDES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* iOS Setup */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            🍎 iOS (iPhone / iPad) Setup
          </span>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Open this URL in <strong>Safari</strong></li>
            <li>Tap the <strong>Share</strong> button at bottom</li>
            <li>Select <strong>Add to Home Screen</strong></li>
            <li>Launch from Home Screen for full immersion</li>
            <li>On iPad, run in <strong>Slide Over</strong> or <strong>Split View</strong> alongside messages</li>
          </ol>
        </div>

        {/* Android Setup */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            🤖 Android Setup
          </span>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Open in <strong>Chrome</strong> or your browser</li>
            <li>Tap <strong>Install App</strong> in the prompt</li>
            <li>Or tap the 3 dots <strong>(⋮) → Install App</strong></li>
            <li>Supports <strong>Pop-up View</strong> / <strong>Floating Window</strong> for system-wide multitasking</li>
          </ol>
        </div>
      </div>

      {/* 4. PRIVACY & SECURITY NOTE */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-100 block">Privacy Preserving Architecture</strong>
          All screen frames and keyboard drafts are securely processed via server-side proxy directly with Google GenAI. No keylogging is ever stored or tracked.
        </div>
      </div>

      <button
        onClick={onTestKeyboard}
        className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition active:scale-98"
      >
        Open Keyboard AI & Test Live Screen Now
      </button>
    </div>
  );
};
