import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard as KeyboardIcon, 
  Eye, 
  Sparkles, 
  Smartphone, 
  Wifi, 
  Battery, 
  Maximize2, 
  FolderOpen, 
  Code,
  Activity,
  Layers,
  Cpu,
  Laptop
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
import { WorkspaceHub } from './components/WorkspaceHub';
import { KeyboardExtensionBridge } from './components/KeyboardExtensionBridge';
import { DesktopSyncBridge } from './components/DesktopSyncBridge';
import { DesktopFloatingWidget } from './components/DesktopFloatingWidget';
import { JarvisTelemetryHUD, TelemetryNoteItem } from './components/JarvisTelemetryHUD';
import { onDeviceAI, DualLaneAnalysisResult } from './lib/onDeviceAI';
import { auth, testFirestoreConnection } from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'keyboard' | 'vision' | 'workspace' | 'extension' | 'studios' | 'sync' | 'setup'>('keyboard');
  const [isDesktopOverlayActive, setIsDesktopOverlayActive] = useState(false);

  // Active typing text
  const [currentDraftText, setCurrentDraftText] = useState<string>(PRESET_SCENARIOS[0].defaultDraft);

  // Active screen scenario
  const [currentScenario, setCurrentScenario] = useState<ScreenScenario>(PRESET_SCENARIOS[0]);
  const [customScreenshot, setCustomScreenshot] = useState<string | null>(null);

  // Live Screen Sharing stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Keyboard collapsed state
  const [isKeyboardCollapsed, setIsKeyboardCollapsed] = useState(false);

  // Phone frame simulation toggle for desktop screens
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);

  // On-Device AI Mode vs Cloud Mode
  const [isOnDeviceMode, setIsOnDeviceMode] = useState(true);
  const [localLatencyMs, setLocalLatencyMs] = useState(6.4);

  // Jarvis Telemetry HUD state
  const [isTelemetryHUDOpen, setIsTelemetryHUDOpen] = useState(false);

  // Current Firebase Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Dual-Lane AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [analysisData, setAnalysisData] = useState<DualLaneAnalysisResult>({
    summary: 'Alex Rivera (VP Eng) is demanding an unvarnished ETA on the staging build #402 deployment.',
    counterpartDossier: 'Alex Rivera • VP Engineering • #product-launch',
    emotionalRegister: 'High-Stakes Pressure & Zero-Fluff Accountability',
    urgency: 'High',
    suggestionTrio: {
      witty: 'Code is compiling—unless the server catches fire, staging is live at 11:00 AM.',
      rawHonest: 'The delay was on our auth regression check. We caught the flaw before client demo, pushing in 15m.',
      directAction: 'Fix is verified locally; regression test passing. Pushing build #402 to staging in 15 minutes.',
    },
    suggestedReplies: [
      'Code is compiling—unless the server catches fire, staging is live at 11:00 AM.',
      'The delay was on our auth regression check. We caught the flaw before client demo, pushing in 15m.',
      'Fix is verified locally; regression test passing. Pushing build #402 to staging in 15 minutes.',
    ],
    tacticalAdvice: [
      'Lead with the exact timestamp. Under extreme pressure, adjectives look like excuses.',
      'Acknowledge the client visibility risk without getting defensive.',
      'Commit to immediate channel confirmation the second artifacts hit staging.'
    ],
    telemetryNotes: [
      {
        id: 'init_note_1',
        category: 'Commitment',
        label: 'Build #402 Staging Target',
        detail: 'Commitment to deliver staging deploy within 15 minutes (11:00 AM hard cutoff).',
        timestamp: '10:42 AM',
      },
      {
        id: 'init_note_2',
        category: 'Risk',
        label: 'Client Executive Escalation',
        detail: 'VP of client operations is actively pinging engineering leadership.',
        timestamp: '10:42 AM',
      },
      {
        id: 'init_note_3',
        category: 'Emotion',
        label: 'Executive Urgency',
        detail: 'Uncompromising tone; demands unambiguous milestone certainty.',
        timestamp: '10:42 AM',
      }
    ],
    telemetry: {
      latencyMs: 6.4,
      memoryMb: 19.2,
      accelerator: 'WebGPU (NPU/GPU)',
      privacyStatus: 'Shielded (Zero Network Data)',
      modelName: 'OmniWave-DualLane-v4',
    }
  });

  // Clock in status bar
  const [currentTime, setCurrentTime] = useState('9:41');
  useEffect(() => {
    testFirestoreConnection();
    const unsub = auth.onAuthStateChanged((u) => setCurrentUser(u));

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
    return () => {
      clearInterval(interval);
      unsub();
    };
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

  // Trigger Dual-Lane Viewport Cognition
  const analyzeActiveScreen = useCallback(async (customPrompt?: string) => {
    setIsAnalyzing(true);
    setOrbPhase('analyzing');

    const screenContextText = `${currentScenario.name} - ${currentScenario.category} (${currentScenario.messages.map(m => m.text).join(' ')})`;
    const speaker = currentScenario.appHeader.title;

    // Dual-Lane On-Device Execution (Sub-10ms, Private)
    try {
      const result = await onDeviceAI.processViewportCognition(
        screenContextText,
        currentDraftText,
        speaker
      );
      setAnalysisData(result);
      setLocalLatencyMs(result.telemetry.latencyMs);
      setOrbPhase('suggesting');
    } catch (err) {
      console.error('Cognition failed:', err);
      setOrbPhase('idle');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentScenario, currentDraftText]);

  // Handle switching scenario
  const handleSelectScenario = (scenario: ScreenScenario) => {
    setCurrentScenario(scenario);
    setCurrentDraftText(scenario.defaultDraft);
    setOrbPhase('observing');
    setTimeout(() => {
      analyzeActiveScreen();
    }, 180);
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
      }, 250);
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
          alert('Screen capture API is not supported on this browser/platform. You can still upload screenshots.');
          return;
        }

        const newStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setStream(newStream);
        setIsStreaming(true);
        setOrbPhase('observing');

        newStream.getVideoTracks()[0].onended = () => {
          setIsStreaming(false);
          setStream(null);
          setOrbPhase('idle');
        };

        setTimeout(() => {
          analyzeActiveScreen();
        }, 900);
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
      const { rewritten, telemetry } = await onDeviceAI.rewriteLocally(
        currentDraftText,
        style as any
      );
      setCurrentDraftText(rewritten);
      setLocalLatencyMs(telemetry.latencyMs);
      setOrbPhase('suggesting');
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

    currentScenario.messages.push({
      sender: 'me',
      text: final,
      time: 'Just now',
    });
    setCurrentDraftText('');
    setOrbPhase('suggesting');

    setTimeout(() => {
      analyzeActiveScreen();
    }, 900);
  };

  const handleLoadIntoScreenSimulator = (title: string, body: string, sender: string) => {
    const customScenario: ScreenScenario = {
      id: `screen_${Date.now()}`,
      name: title,
      category: 'Workspace',
      icon: FolderOpen,
      appHeader: {
        title: sender,
        subtitle: title,
        avatar: '✉️',
        badge: 'WORKSPACE',
      },
      messages: [
        {
          sender: 'them',
          text: body,
          time: 'Just now',
        },
      ],
      contextHint: `Real-time context from ${title}. Inspecting live dialogue.`,
      defaultDraft: '',
    };
    setCurrentScenario(customScenario);
    setActiveTab('keyboard');
    setOrbPhase('observing');
    setTimeout(() => {
      analyzeActiveScreen();
    }, 250);
  };

  const activeScreenName = isStreaming
    ? 'Live Screen Broadcast'
    : customScreenshot
    ? 'Uploaded Screen Image'
    : currentScenario.name;

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      <OfflineIndicator />

      {/* TOP DESKTOP CONTROLS BAR (Desktop only) */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between mb-2.5 px-2 text-xs font-mono text-slate-400">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold text-white tracking-wider text-xs">OMNI KEY</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe]">
              PC Sync (⌘⇧K)
            </span>
          </div>
          <span className="text-[8.5px] font-mono text-slate-400 tracking-wider">
            Dark Misfit Studios
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
              isDesktopOverlayActive
                ? 'bg-[#00f2fe] text-black border-[#00f2fe] font-bold shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                : 'bg-[#0B0B0C] border-white/10 hover:border-[#00f2fe]/40 text-slate-300 hover:text-white'
            }`}
            title="Launch Floating Laptop Co-Pilot Overlay (⌘+Shift+K)"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{isDesktopOverlayActive ? 'Dock Active' : 'PC Overlay'}</span>
          </button>
          <button
            onClick={() => setPhoneFrameMode(!phoneFrameMode)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B0B0C] border border-white/10 hover:border-[#00f2fe]/40 text-slate-300 hover:text-white transition"
            title="Toggle between phone bezel and full view"
          >
            {phoneFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{phoneFrameMode ? 'Full View' : 'Phone Bezel'}</span>
          </button>
          <PWAInstallButton variant="compact" />
        </div>
      </div>

      {/* MAIN PHONE CONTAINER - Pure Matte Black (#000000) Foundation */}
      <div
        className={`w-full flex flex-col bg-[#000000] overflow-hidden transition-all duration-300 ${
          phoneFrameMode
            ? 'sm:max-w-[420px] sm:h-[840px] sm:rounded-[44px] sm:border-[8px] sm:border-[#0B0B0C] sm:shadow-[0_0_80px_rgba(0,242,254,0.18),0_0_120px_rgba(127,0,255,0.15)] sm:ring-1 sm:ring-[#00f2fe]/40'
            : 'max-w-2xl h-screen rounded-none sm:rounded-2xl border-0 sm:border sm:border-white/10'
        } relative h-[100dvh]`}
      >
        {/* 1. NATIVE MOBILE STATUS BAR & HARDWARE NOTCH */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between bg-[#000000] text-[11px] font-mono font-semibold text-slate-400 shrink-0 z-30">
          <span>{currentTime}</span>

          {/* Dynamic Island / Hardware Notch */}
          <div className="w-24 h-4 bg-[#0B0B0C] rounded-full flex items-center justify-center gap-2 border border-white/10 shadow-inner px-2">
            <div className="w-2 h-2 rounded-full bg-black border border-slate-700" />
            <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#00f2fe] animate-pulse' : 'bg-[#7f00ff]'}`} />
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi className="w-3 h-3 text-[#00f2fe]" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* 2. APP HEADER & PWA INSTALL BADGE */}
        <header className="px-4 py-2 bg-[#0B0B0C] border-b border-white/10 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <HoloOrb phase={orbPhase} size="sm" onClick={() => analyzeActiveScreen()} />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-xs font-bold tracking-wider font-mono text-white">
                  OMNI <span className="text-[#00f2fe]">KEY</span>
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-ping" />
              </div>
              <span className="text-[8.5px] font-mono tracking-wider text-slate-400 mt-0.5">
                Dark Misfit Studios
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick PC Overlay Toggle */}
            <button
              onClick={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#7f00ff]/15 border border-[#7f00ff]/40 text-[#c084fc] hover:bg-[#7f00ff]/25 transition"
              title="Launch Floating Laptop Co-Pilot Overlay"
            >
              <Laptop className="w-3 h-3" />
              <span>PC</span>
            </button>

            {/* Quick HUD Button */}
            <button
              onClick={() => setIsTelemetryHUDOpen(!isTelemetryHUDOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#00f2fe]/10 border border-[#00f2fe]/40 text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.2)] hover:bg-[#00f2fe]/20 transition"
              title="Toggle Jarvis Telemetry HUD"
            >
              <Activity className="w-3 h-3" />
              <span>HUD</span>
            </button>

            <PWAInstallButton variant="compact" />
          </div>
        </header>

        {/* 3. MAIN TAB CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#000000]">
          {/* SLIDE-UP JARVIS TELEMETRY HUD CARD */}
          <JarvisTelemetryHUD
            isOpen={isTelemetryHUDOpen}
            onClose={() => setIsTelemetryHUDOpen(false)}
            activeScreenTitle={activeScreenName}
            detectedSpeaker={analysisData.counterpartDossier}
            emotionalRegister={analysisData.emotionalRegister}
            telemetryNotes={analysisData.telemetryNotes}
            latencyMs={localLatencyMs}
            npuAccelerator={analysisData.telemetry.accelerator}
            onClearNotes={() => setAnalysisData(prev => ({ ...prev, telemetryNotes: [] }))}
          />

          {activeTab === 'keyboard' && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              {/* Host viewport display */}
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

              {/* Keyboard AI Bar + Volumetric 3D Soft Keyboard */}
              <div className="shrink-0 flex flex-col">
                <AIKeyboardBar
                  currentText={currentDraftText}
                  onChangeText={setCurrentDraftText}
                  onSend={handleEnter}
                  suggestedReplies={analysisData.suggestedReplies}
                  suggestionTrio={analysisData.suggestionTrio}
                  liveAdvice={analysisData.tacticalAdvice}
                  onSelectSuggestion={(reply) => setCurrentDraftText(reply)}
                  onRewrite={handleRewrite}
                  onRequestInstantAdvice={() => analyzeActiveScreen()}
                  isAnalyzing={isAnalyzing}
                  orbPhase={orbPhase}
                  screenName={activeScreenName}
                  isOnDeviceMode={isOnDeviceMode}
                  onToggleOnDeviceMode={() => setIsOnDeviceMode(!isOnDeviceMode)}
                  localLatencyMs={localLatencyMs}
                  onOpenTelemetryHUD={() => setIsTelemetryHUDOpen(!isTelemetryHUDOpen)}
                  telemetryNotesCount={analysisData.telemetryNotes.length}
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

          {activeTab === 'workspace' && (
            <WorkspaceHub
              onInsertToKeyboard={(text) => {
                setCurrentDraftText(text);
                setActiveTab('keyboard');
              }}
              onLoadIntoScreenSimulator={handleLoadIntoScreenSimulator}
            />
          )}

          {activeTab === 'extension' && (
            <KeyboardExtensionBridge />
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

          {activeTab === 'sync' && (
            <DesktopSyncBridge
              onInsertToKeyboard={(text) => {
                setCurrentDraftText(text);
                setActiveTab('keyboard');
              }}
              onToggleDesktopOverlay={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
              isDesktopOverlayActive={isDesktopOverlayActive}
            />
          )}

          {activeTab === 'setup' && (
            <MobileSetupGuide
              onTestKeyboard={() => setActiveTab('keyboard')}
            />
          )}
        </main>

        {/* 4. MOBILE BOTTOM TAB NAVIGATION BAR */}
        <nav className="h-14 bg-[#0B0B0C] border-t border-white/10 flex items-center justify-around px-1 shrink-0 z-30 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setActiveTab('keyboard')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'keyboard'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <KeyboardIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all relative ${
              activeTab === 'vision'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Vision</span>
            {isStreaming && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#00f2fe] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'workspace'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Google Drive, Gmail, Keep"
          >
            <FolderOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'sync'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Laptop & PC Sync (Dark Misfit Studios)"
          >
            <Laptop className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">PC Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('extension')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'extension'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="iOS & Android Extension Code"
          >
            <Code className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Extension</span>
          </button>

          <button
            onClick={() => setActiveTab('studios')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'studios'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Orb & 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'setup'
                ? 'text-[#00f2fe] font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Install</span>
          </button>
        </nav>

        {/* 5. NATIVE MOBILE HOME INDICATOR BAR */}
        <div className="w-full pb-1 pt-0.5 bg-[#0B0B0C] flex justify-center shrink-0">
          <div className="w-28 h-1 rounded-full bg-slate-800" />
        </div>
      </div>

      {/* 6. SYSTEM-WIDE FLOATING COMPANION WIDGET (OMNI KEY • DARK MISFIT STUDIOS) */}
      <DesktopFloatingWidget
        isOpen={isDesktopOverlayActive}
        onToggle={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
        phoneDraftText={currentDraftText}
        onSendToPhone={(text) => setCurrentDraftText(text)}
        onSelectSuggestion={(text) => setCurrentDraftText(text)}
        activeScreenName={activeScreenName}
      />
    </div>
  );
}
