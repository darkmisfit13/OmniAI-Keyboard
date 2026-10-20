import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Video, 
  VideoOff, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Check, 
  Copy, 
  Send,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { HoloOrb } from './HoloOrb';

interface ScreenVisionHUDProps {
  stream: MediaStream | null;
  isStreaming: boolean;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  onManualScan: () => void;
  isAnalyzing: boolean;
  analysisData: any;
  onApplyReply: (replyText: string) => void;
  activeScreenName: string;
}

export const ScreenVisionHUD: React.FC<ScreenVisionHUDProps> = ({
  stream,
  isStreaming,
  onStartStreaming,
  onStopStreaming,
  onManualScan,
  isAnalyzing,
  analysisData,
  onApplyReply,
  activeScreenName,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto scan interval if streaming and enabled
  useEffect(() => {
    if (!autoScanEnabled || !isStreaming) return;
    const interval = setInterval(() => {
      onManualScan();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoScanEnabled, isStreaming, onManualScan]);

  const handleCopyReply = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto">
      {/* 1. VISION ENGINE HEADER */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <HoloOrb phase={isStreaming ? 'observing' : isAnalyzing ? 'analyzing' : 'idle'} size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Omni Screen Vision</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                isStreaming
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isStreaming ? '● LIVE SCREEN FEED' : 'SIMULATED SCREEN'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Context: <strong className="text-slate-200">{activeScreenName}</strong>
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <button
              onClick={onStopStreaming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span>Stop Stream</span>
            </button>
          ) : (
            <button
              onClick={onStartStreaming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition active:scale-95"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Share My Screen</span>
            </button>
          )}

          <button
            onClick={onManualScan}
            disabled={isAnalyzing}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition disabled:opacity-40"
            title="Scan Screen Now"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. REAL SCREEN DISPLAY (if streaming) */}
      {isStreaming && (
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-black aspect-video flex items-center justify-center group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />

          {/* Cyber Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,242,254,0.05)_50%,transparent_50%)] bg-[length:100%_4px]" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-cyan-500/50 backdrop-blur-md text-[11px] text-cyan-300">
            <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Scanning Window In Real Time</span>
          </div>
        </div>
      )}

      {/* 3. GEMINI IN-THE-MOMENT TACTICAL ANALYSIS */}
      <div className="space-y-3">
        {/* Context & Intent Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Screen Perception
            </span>
            <div className="flex items-center gap-2">
              {analysisData?.urgency && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Urgency: {analysisData.urgency}
                </span>
              )}
              {analysisData?.emotionalTone && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Tone: {analysisData.emotionalTone}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {analysisData?.summary || 'Omni is observing your screen. Tap "Scan Screen Now" to parse text and dialogue.'}
          </p>

          {analysisData?.intent && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">Counterpart Intent: </strong>
                <span>{analysisData.intent}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Advice Checklist */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Live In-The-Moment Coaching
          </span>

          <div className="space-y-2">
            {(analysisData?.advice || [
              'Keep message under 2 sentences to command attention.',
              'Acknowledge timeline explicitly before explaining background.',
              'Offer a concrete time rather than vague availability.'
            ]).map((tip: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
              >
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </div>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Tap Suggested Replies */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              AI Suggested Replies
            </span>
            <span className="text-[10px] text-slate-500">Tap to load into keyboard</span>
          </div>

          <div className="space-y-2">
            {(analysisData?.suggestedReplies || [
              'Finalizing the patch right now, wrapping up regression tests and pushing build in 15 min.',
              'Thanks for checking in! Build is currently compiling, I will ping you the moment staging is live.',
              'Understood. Let me jump in and confirm the auth token fix right now.'
            ]).map((reply: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 transition group"
              >
                <p className="text-xs text-slate-200 pr-3 leading-relaxed flex-1">
                  {reply}
                </p>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyReply(reply, idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Copy to clipboard"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onApplyReply(reply)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition active:scale-95"
                    title="Insert directly into keyboard"
                  >
                    <span>Use</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
