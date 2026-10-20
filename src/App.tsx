import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard as KeyboardIcon, 
  Eye, 
  Sparkles, 
  Smartphone, 
  Settings, 
  Layers, 
  Wifi, 
  Battery, 
  Sliders, 
  Maximize2, 
  Minimize2,
  Tv,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { HoloOrb, OrbPhase } from './components/HoloOrb';
import { AIKeyboardBar } from './components/AIKeyboardBar';
import { SoftKeyboard } from './components/SoftKeyboard';
import { SimulatedAppView, PRESET_SCENARIOS, ScreenScenario } from './components/SimulatedAppView';
import { ScreenVisionHUD } from './components/ScreenVisionHUD';
import { OmniStudiosView } from './components/OmniStudiosView';
import { MobileSetupGuide } from './components/MobileSetupGuide';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'keyboard' | 'vision' | 'studios' | 'setup'>('keyboard');

  // Active typing text
  const [currentDraftText, setCurrentDraftText] = useState<string>(PRESET_SCENARIOS[0].defaultDraft);

  // Active screen scenario
  const [currentScenario, setCurrentScenario] = useState<ScreenScenario>(PRESET_SCENARIOS[0]);
  const [customScreenshot, setCustomScreenshot] = useState<string | null>(null);

  // Live Screen Sharing stream (real display media)
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Keyboard collapsed state
  const [isKeyboardCollapsed, setIsKeyboardCollapsed] = useState(false);

  // Phone frame simulation toggle for desktop screens
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [analysisData, setAnalysisData] = useState<any>({
    summary: 'Alex Rivera (VP Eng) is asking for an immediate ETA on the staging build #402 deployment.',
    intent: 'Urgent accountability and deadline confirmation for client executive',
    urgency: 'High',
    emotionalTone: 'Anxious / High-Pressure',
    advice: [
      'State the exact ETA in the very first sentence.',
      'Confirm the auth patch is validated without over-promising.',
      'Reassure that you will notify the team the second it hits staging.'
    ],
    suggestedReplies: [
      'Patch is verified locally, running quick regression checks and pushing build in 15 mins.',
      'On it—deploying the auth fix right now. Expect staging live by 11:00 AM sharp.',
      'Testing the final token edge-case now; deploying to staging in under 20 minutes.'
    ],
  });

  // Clock in status bar
  const [currentTime, setCurrentTime] = useState('9:41');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const mins = d.getMinutes();
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      const formattedHours = hours % 12 || 12;
      setCurrentTime(`${formattedHours}:${formattedMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper to capture a frame from the live video stream if active
  const captureStreamFrame = useCallback((): string | null => {
    if (!stream) return null;
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return null;

      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.play();

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch {
      return null;
    }
  }, [stream]);

  // Trigger Gemini Screen Analysis
  const analyzeActiveScreen = useCallback(async (customPrompt?: string) => {
    setIsAnalyzing(true);
    setOrbPhase('analyzing');

    try {
      let imageBase64: string | null = customScreenshot;

      if (!imageBase64 && stream) {
        imageBase64 = captureStreamFrame();
      }

      const res = await fetch('/api/screen-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          currentInput: currentDraftText,
          screenScenario: isStreaming
            ? 'Live Desktop/Phone Window'
            : customScreenshot
            ? 'Uploaded Mobile Screen'
            : `${currentScenario.name} - ${currentScenario.category} (${currentScenario.messages.map(m => m.text).join(' ')})`,
          customPrompt,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisData(data.analysis);
        setOrbPhase('suggesting');
      } else {
        setOrbPhase('idle');
      }
    } catch (err) {
      console.error('Failed to analyze screen:', err);
      setOrbPhase('idle');
    } finally {
      setIsAnalyzing(false);
    }
  }, [customScreenshot, stream, captureStreamFrame, currentDraftText, isStreaming, currentScenario]);

  // Handle switching scenario
  const handleSelectScenario = (scenario: ScreenScenario) => {
    setCurrentScenario(scenario);
    setCurrentDraftText(scenario.defaultDraft);
    setOrbPhase('observing');
    setTimeout(() => {
      analyzeActiveScreen();
    }, 300);
  };

  // Handle uploading custom screenshot
  const handleUploadScreenshot = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomScreenshot(result);
      setOrbPhase('observing');
      setTimeout(() => {
        analyzeActiveScreen();
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  // Toggle real screen sharing with getDisplayMedia
  const handleToggleLiveScreenSharing = async () => {
    if (isStreaming) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null);
      setIsStreaming(false);
      setOrbPhase('idle');
    } else {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          alert('Screen capture API is not supported on this browser/platform. You can still upload any screenshot of your screen.');
          return;
        }

        const newStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setStream(newStream);
        setIsStreaming(true);
        setOrbPhase('observing');

        // Handle user stopping stream from browser chrome
        newStream.getVideoTracks()[0].onended = () => {
          setIsStreaming(false);
          setStream(null);
          setOrbPhase('idle');
        };

        // Immediately analyze the new screen
        setTimeout(() => {
          analyzeActiveScreen();
        }, 1000);
      } catch (err) {
        console.warn('Screen share canceled or denied:', err);
        setIsStreaming(false);
      }
    }
  };

  // Rewrite current text with target tone
  const handleRewrite = async (style: string) => {
    if (!currentDraftText.trim()) return;
    setIsAnalyzing(true);
    setOrbPhase('typing');

    try {
      const res = await fetch('/api/keyboard-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentDraftText,
          style,
          screenContext: isStreaming ? 'Live Screen' : currentScenario.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.rewritten) {
        setCurrentDraftText(data.rewritten);
        setOrbPhase('suggesting');
      }
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Keyboard soft touch interactions
  const handleKeyPress = (char: string) => {
    setCurrentDraftText((prev) => prev + char);
    setOrbPhase('typing');
  };

  const handleBackspace = () => {
    setCurrentDraftText((prev) => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setCurrentDraftText((prev) => prev + ' ');
  };

  const handleEnter = (text?: string) => {
    const final = text || currentDraftText;
    if (!final.trim()) return;

    // Simulate sending into current scenario
    currentScenario.messages.push({
      sender: 'me',
      text: final,
      time: 'Just now',
    });
    setCurrentDraftText('');
    setOrbPhase('suggesting');

    // Trigger AI response suggestion in 1 sec
    setTimeout(() => {
      analyzeActiveScreen();
    }, 1200);
  };

  const activeScreenName = isStreaming
    ? 'Live Screen Broadcast'
    : customScreenshot
    ? 'Uploaded Screen Image'
    : currentScenario.name;

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      {/* OFFLINE INDICATOR FROM PWA SKILL */}
      <OfflineIndicator />

      {/* TOP DESKTOP CONTROLS BAR (Shown when previewing on desktop) */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-300">Omni Keyboard AI</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400">
            PWA Mobile App
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhoneFrameMode(!phoneFrameMode)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition"
            title="Toggle between phone bezel and full view"
          >
            {phoneFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{phoneFrameMode ? 'Full View' : 'Phone Bezel'}</span>
          </button>
          <PWAInstallButton variant="compact" />
        </div>
      </div>

      {/* MAIN PHONE CONTAINER */}
      <div
        className={`w-full flex flex-col bg-[#090b12] overflow-hidden transition-all duration-300 ${
          phoneFrameMode
            ? 'sm:max-w-[420px] sm:h-[840px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800/90 sm:shadow-[0_0_60px_rgba(0,242,254,0.15)] sm:ring-1 sm:ring-cyan-500/30'
            : 'max-w-2xl h-screen rounded-none sm:rounded-2xl border-0 sm:border sm:border-slate-800'
        } relative h-[100dvh]`}
      >
        {/* 1. NATIVE MOBILE STATUS BAR & HARDWARE NOTCH */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-slate-300 shrink-0 z-30">
          <span>{currentTime}</span>

          {/* Dynamic Island / Camera Notch */}
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2 border border-slate-800/60 shadow-inner px-2">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
            <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500/70'}`} />
          </div>

          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-slate-400" />
            <Battery className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* 2. APP HEADER & PWA INSTALL BADGE */}
        <header className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <HoloOrb phase={orbPhase} size="sm" onClick={() => analyzeActiveScreen()} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-bold tracking-tight text-white">OmniKey AI</h1>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <span className="text-[10px] text-cyan-400/90 font-mono block leading-none">
                {isStreaming ? 'Screen Live ●' : 'Vision Armed'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PWAInstallButton variant="compact" />
          </div>
        </header>

        {/* 3. MAIN TAB CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'keyboard' && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              {/* Top part: The screen being observed */}
              <div className="flex-1 overflow-hidden p-2">
                <SimulatedAppView
                  currentScenario={currentScenario}
                  onSelectScenario={handleSelectScenario}
                  customScreenshot={customScreenshot}
                  onUploadScreenshot={handleUploadScreenshot}
                  onClearCustomScreenshot={() => setCustomScreenshot(null)}
                  isLiveScreenSharing={isStreaming}
                  onToggleLiveScreenSharing={handleToggleLiveScreenSharing}
                  currentDraftText={currentDraftText}
                />
              </div>

              {/* Bottom part: The Keyboard AI Bar + Soft Keyboard */}
              <div className="shrink-0 flex flex-col">
                <AIKeyboardBar
                  currentText={currentDraftText}
                  onChangeText={setCurrentDraftText}
                  onSend={handleEnter}
                  suggestedReplies={analysisData?.suggestedReplies || []}
                  liveAdvice={analysisData?.advice || []}
                  onSelectSuggestion={(reply) => setCurrentDraftText(reply)}
                  onRewrite={handleRewrite}
                  onRequestInstantAdvice={() => analyzeActiveScreen()}
                  isAnalyzing={isAnalyzing}
                  orbPhase={orbPhase}
                  screenName={activeScreenName}
                />

                <SoftKeyboard
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onEnter={() => handleEnter()}
                  onSpace={handleSpace}
                  isCollapsed={isKeyboardCollapsed}
                  onToggleCollapse={() => setIsKeyboardCollapsed(!isKeyboardCollapsed)}
                />
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <ScreenVisionHUD
              stream={stream}
              isStreaming={isStreaming}
              onStartStreaming={handleToggleLiveScreenSharing}
              onStopStreaming={handleToggleLiveScreenSharing}
              onManualScan={() => analyzeActiveScreen()}
              isAnalyzing={isAnalyzing}
              analysisData={analysisData}
              onApplyReply={(reply) => {
                setCurrentDraftText(reply);
                setActiveTab('keyboard');
              }}
              activeScreenName={activeScreenName}
            />
          )}

          {activeTab === 'studios' && (
            <OmniStudiosView
              onInsertToKeyboard={(text) => {
                setCurrentDraftText(text);
                setActiveTab('keyboard');
              }}
              currentScreenName={activeScreenName}
            />
          )}

          {activeTab === 'setup' && (
            <MobileSetupGuide
              onTestKeyboard={() => setActiveTab('keyboard')}
            />
          )}
        </main>

        {/* 4. MOBILE BOTTOM TAB NAVIGATION BAR */}
        <nav className="h-14 bg-slate-950 border-t border-slate-800/90 flex items-center justify-around px-2 shrink-0 z-30 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setActiveTab('keyboard')}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
              activeTab === 'keyboard'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyboardIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Keyboard</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all relative ${
              activeTab === 'vision'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Vision</span>
            {isStreaming && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('studios')}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
              activeTab === 'studios'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Studios</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
              activeTab === 'setup'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Install App</span>
          </button>
        </nav>

        {/* 5. NATIVE MOBILE HOME INDICATOR BAR */}
        <div className="w-full pb-1 pt-0.5 bg-slate-950 flex justify-center shrink-0">
          <div className="w-28 h-1 rounded-full bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
}
