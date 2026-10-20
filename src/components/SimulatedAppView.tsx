import React from 'react';
import { 
  Briefcase, 
  Heart, 
  Mail, 
  Users, 
  MessageSquare, 
  Terminal, 
  Upload, 
  Sparkles,
  Camera,
  RefreshCw,
  Video
} from 'lucide-react';

export interface ScreenScenario {
  id: string;
  name: string;
  category: string;
  icon: any;
  appHeader: {
    title: string;
    subtitle: string;
    avatar: string;
    badge?: string;
  };
  messages: Array<{
    sender: 'them' | 'me';
    text: string;
    time: string;
  }>;
  contextHint: string;
  defaultDraft: string;
}

export const PRESET_SCENARIOS: ScreenScenario[] = [
  {
    id: 'work_slack',
    name: 'Work Slack',
    category: 'Work',
    icon: Briefcase,
    appHeader: {
      title: 'Alex Rivera (VP Eng)',
      subtitle: 'Active now • #product-launch',
      avatar: '👨‍💼',
      badge: 'URGENT',
    },
    messages: [
      {
        sender: 'them',
        text: 'Hey! The client VP is asking why staging build #402 is delayed. Did you push the auth fix yet? Need an ETA immediately.',
        time: '10:42 AM',
      },
    ],
    contextHint: 'Alex is under pressure from executive leadership. Be accountable, clear on the timeline, and don’t over-explain.',
    defaultDraft: 'I have the patch tested locally, wrapping up regression tests and pushing to staging in 15 minutes.',
  },
  {
    id: 'dating_hinge',
    name: 'Hinge Match',
    category: 'Social',
    icon: Heart,
    appHeader: {
      title: 'Maya Lin',
      subtitle: '2 miles away • Just matched',
      avatar: '✨',
      badge: 'NEW',
    },
    messages: [
      {
        sender: 'them',
        text: 'Haha okay but what’s your most controversial food opinion? And please do not say pineapple on pizza 😂',
        time: '9:15 PM',
      },
    ],
    contextHint: 'Maya wants witty, playful banter. Avoid cliches, be charmingly specific, and invite an easy reply.',
    defaultDraft: 'Cold leftovers taste 30% better standing in the refrigerator light at 1 AM. Fight me.',
  },
  {
    id: 'client_dispute',
    name: 'Client Email',
    category: 'Business',
    icon: Mail,
    appHeader: {
      title: 'Billing Inquiry: Apex Corp',
      subtitle: 'From: Sarah Jenkins (CFO)',
      avatar: '📊',
      badge: 'HIGH PRIORITY',
    },
    messages: [
      {
        sender: 'them',
        text: 'We noticed an unexpected $240 charge on our corporate invoice #8819. Can someone explain this line item before we dispute it with our credit card provider?',
        time: '11:05 AM',
      },
    ],
    contextHint: 'Sarah is threatening a dispute. De-escalate immediately, validate her concern, review the audit log, and offer a quick credit or clarification.',
    defaultDraft: 'Hi Sarah, thanks for bringing this up. Let me inspect invoice #8819 immediately with our billing team and clarify or credit that line item today.',
  },
  {
    id: 'group_chat',
    name: 'Weekend Trip',
    category: 'Friends',
    icon: Users,
    appHeader: {
      title: 'Cabin Weekend 🌲 (5)',
      subtitle: 'David, Liam, Chloe, Emma',
      avatar: '🏔️',
    },
    messages: [
      {
        sender: 'them',
        text: 'David: Are we booking the lake cabin or the mountain ridge one? We need to lock this down before midnight or the discount expires!',
        time: '2:14 PM',
      },
      {
        sender: 'them',
        text: 'Chloe: Mountain ridge has the hot tub though 🧖‍♀️',
        time: '2:16 PM',
      },
    ],
    contextHint: 'Indecisive group with an impending deadline. Synthesize the consensus and propose a definitive choice.',
    defaultDraft: 'Let’s lock in Mountain Ridge. Hot tub wins every time and we can split the difference.',
  },
  {
    id: 'terminal_bug',
    name: 'Code Terminal',
    category: 'Dev',
    icon: Terminal,
    appHeader: {
      title: 'Crash Log: worker-auth',
      subtitle: 'node:v22.14 • Exit code 1',
      avatar: '⚡',
    },
    messages: [
      {
        sender: 'them',
        text: 'FATAL: TypeError: Cannot read properties of undefined (reading "bearerToken") at verifySession (/app/auth.js:84:22). Server crashed.',
        time: '3:01 PM',
      },
    ],
    contextHint: 'Null check missing on auth header. Quick safe optional chaining `req.headers?.authorization?.split(" ")[1]` needed.',
    defaultDraft: 'The auth header is undefined for unauthenticated ping health-checks. Adding optional chaining on req.headers.authorization.',
  },
];

interface SimulatedAppViewProps {
  currentScenario: ScreenScenario;
  onSelectScenario: (scenario: ScreenScenario) => void;
  customScreenshot: string | null;
  onUploadScreenshot: (file: File) => void;
  onClearCustomScreenshot: () => void;
  isLiveScreenSharing: boolean;
  onToggleLiveScreenSharing: () => void;
  currentDraftText: string;
}

export const SimulatedAppView: React.FC<SimulatedAppViewProps> = ({
  currentScenario,
  onSelectScenario,
  customScreenshot,
  onUploadScreenshot,
  onClearCustomScreenshot,
  isLiveScreenSharing,
  onToggleLiveScreenSharing,
  currentDraftText,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadScreenshot(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top scenario selector ribbon */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 shrink-0">
          Screen:
        </span>

        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = !customScreenshot && !isLiveScreenSharing && currentScenario.id === scenario.id;
          const Icon = scenario.icon;
          return (
            <button
              key={scenario.id}
              onClick={() => {
                if (customScreenshot) onClearCustomScreenshot();
                onSelectScenario(scenario);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{scenario.name}</span>
            </button>
          );
        })}

        {/* Live screen share toggle button */}
        <button
          onClick={onToggleLiveScreenSharing}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            isLiveScreenSharing
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Share your real device screen with Gemini Vision"
        >
          <Video className="w-3 h-3 text-rose-400" />
          <span>{isLiveScreenSharing ? 'Screen Live ●' : 'Live Screen'}</span>
        </button>

        {/* Upload custom phone screenshot button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            customScreenshot
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Upload a screenshot of any app on your phone"
        >
          <Upload className="w-3 h-3 text-emerald-400" />
          <span>{customScreenshot ? 'Custom Image ✓' : 'Upload Screen'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Screen display container */}
      <div className="flex-1 relative overflow-y-auto p-4 flex flex-col justify-between min-h-[220px]">
        {/* If live screen sharing or custom screenshot */}
        {customScreenshot ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative max-h-[240px] rounded-xl overflow-hidden border border-cyan-500/40 shadow-xl group">
              <img
                src={customScreenshot}
                alt="Uploaded mobile screen"
                className="max-h-[240px] object-contain rounded-xl"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={onClearCustomScreenshot}
                  className="px-2 py-1 rounded-md bg-black/70 text-slate-200 text-[10px] font-medium hover:bg-black transition backdrop-blur-sm"
                >
                  Clear Screen
                </button>
              </div>
            </div>
            <p className="text-[11px] text-cyan-400/90 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Omni Vision is actively analyzing your uploaded phone screenshot
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Simulated App Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-inner">
                  {currentScenario.appHeader.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">
                      {currentScenario.appHeader.title}
                    </span>
                    {currentScenario.appHeader.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {currentScenario.appHeader.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {currentScenario.appHeader.subtitle}
                  </span>
                </div>
              </div>

              {/* Screen vision tag */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>AI Screen Feed</span>
              </div>
            </div>

            {/* Simulated Messages / Screen content */}
            <div className="space-y-2 py-1">
              {currentScenario.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'them' ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-md ${
                      msg.sender === 'them'
                        ? 'bg-slate-800/90 text-slate-100 rounded-tl-sm border border-slate-700/60'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}

              {/* Real-time typing reflection */}
              {currentDraftText && (
                <div className="flex flex-col items-end pt-1 animate-in fade-in duration-150">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed bg-cyan-600/30 border border-cyan-500/40 text-cyan-100 rounded-tr-sm shadow-md">
                    <span>{currentDraftText}</span>
                    <span className="inline-block w-1.5 h-3 ml-1 bg-cyan-400 animate-pulse align-middle" />
                  </div>
                  <span className="text-[9px] text-cyan-400/80 mt-0.5 px-1">
                    Drafting in active keyboard...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ambient context note */}
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[80%] italic">
            Context: {currentScenario.contextHint}
          </span>
          <span className="text-cyan-400 font-mono text-[9px]">
            {currentDraftText.length} chars
          </span>
        </div>
      </div>
    </div>
  );
};
