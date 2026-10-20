import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Mail, 
  CheckSquare, 
  Plus, 
  ExternalLink, 
  Send, 
  Copy, 
  Check, 
  LogOut, 
  RefreshCw, 
  Folder, 
  FileCode, 
  Paperclip,
  BookmarkPlus
} from 'lucide-react';
import { 
  auth, 
  signInWithGoogleWorkspace, 
  signOut, 
  getCachedAccessToken 
} from '../lib/firebase';
import { 
  listGoogleDriveFiles, 
  listGmailThreads, 
  sendGmail, 
  DEFAULT_KEEP_NOTES, 
  DriveFileItem, 
  GmailMessageItem, 
  KeepNoteItem 
} from '../lib/workspace';
import { User } from 'firebase/auth';

interface WorkspaceHubProps {
  onInsertToKeyboard: (text: string) => void;
  onLoadIntoScreenSimulator: (title: string, body: string, sender: string) => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  onInsertToKeyboard,
  onLoadIntoScreenSimulator,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'keep'>('drive');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  // Gmail state
  const [gmailMessages, setGmailMessages] = useState<GmailMessageItem[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSentSuccess, setMailSentSuccess] = useState(false);

  // Keep state
  const [keepNotes, setKeepNotes] = useState<KeepNoteItem[]>(DEFAULT_KEEP_NOTES);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        loadDrive();
        loadGmail();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadDrive = async () => {
    setIsLoadingDrive(true);
    try {
      const files = await listGoogleDriveFiles();
      setDriveFiles(files);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const loadGmail = async () => {
    setIsLoadingGmail(true);
    try {
      const msgs = await listGmailThreads();
      setGmailMessages(msgs);
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const { user } = await signInWithGoogleWorkspace();
      setCurrentUser(user);
      loadDrive();
      loadGmail();
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setIsSendingMail(true);
    try {
      const ok = await sendGmail(composeTo, composeSubject, composeBody);
      if (ok) {
        setMailSentSuccess(true);
        setTimeout(() => {
          setMailSentSuccess(false);
          setShowCompose(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
        }, 1500);
      }
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleCreateKeepNote = () => {
    if (!newNoteTitle.trim()) return;
    const newNote: KeepNoteItem = {
      id: `keep_${Date.now()}`,
      title: newNoteTitle.trim(),
      body: newNoteBody.trim(),
      isPinned: true,
      color: 'cyan',
      updatedAt: 'Just now',
    };
    setKeepNotes([newNote, ...keepNotes]);
    setNewNoteTitle('');
    setNewNoteBody('');
    setShowAddNote(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 overflow-y-auto">
      {/* 1. GOOGLE WORKSPACE AUTHENTICATION HEADER */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        {currentUser ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-9 h-9 rounded-full border border-cyan-500/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-white block">
                  {currentUser.displayName || 'Google Account'}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-2 space-y-2">
            <p className="text-xs text-slate-300 text-center">
              Connect Google Workspace to access Drive files, Gmail messages, and Keep notes in your keyboard.
            </p>

            {/* Official Sign in with Google Button */}
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. PRODUCT TABS */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-950 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition ${
            activeTab === 'drive'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Google Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition ${
            activeTab === 'gmail'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('keep')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition ${
            activeTab === 'keep'
              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Google Keep</span>
        </button>
      </div>

      {/* 3. TAB BODIES */}
      <div className="p-4 flex-1">
        {/* TAB 1: GOOGLE DRIVE */}
        {activeTab === 'drive' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-blue-400" />
                Drive Files & Documents
              </span>
              <button
                onClick={loadDrive}
                className="p-1 rounded-md text-slate-400 hover:text-white"
                title="Refresh Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2.5 hover:border-blue-500/40 transition group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {file.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {file.modifiedTime || 'Synced with Drive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onInsertToKeyboard(`[Drive Reference: ${file.name}]`)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-semibold hover:bg-blue-500/30 transition"
                      title="Insert reference into active keyboard input"
                    >
                      Insert
                    </button>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GMAIL */}
        {activeTab === 'gmail' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-rose-400" />
                Gmail Inbox Threads
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowCompose(!showCompose)}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition"
                >
                  {showCompose ? 'Close Compose' : '+ Compose'}
                </button>
                <button
                  onClick={loadGmail}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Refresh Gmail"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGmail ? 'animate-spin text-rose-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Compose Mail Drawer */}
            {showCompose && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-2.5 mb-3 animate-in fade-in">
                <span className="text-xs font-bold text-rose-300 block">Compose with Keyboard AI</span>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="To: recipient@example.com"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject: Project status update"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Message body (or type with AI keyboard below)..."
                  rows={3}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!composeTo || !composeSubject || !composeBody || isSendingMail}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-xs hover:brightness-110 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {isSendingMail ? (
                    'Sending via Gmail API...'
                  ) : mailSentSuccess ? (
                    'Email Sent Successfully! ✓'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Gmail Messages List */}
            <div className="space-y-2">
              {gmailMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-rose-500/40 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[70%]">
                      {msg.from}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.date}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    {msg.subject}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {msg.snippet}
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => onLoadIntoScreenSimulator(msg.subject || 'Gmail Email', msg.snippet, msg.from || 'Sender')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Inspect in Keyboard Vision →
                    </button>
                    <button
                      onClick={() => {
                        setComposeTo(msg.from?.match(/<([^>]+)>/)?.[1] || '');
                        setComposeSubject(`Re: ${msg.subject}`);
                        setShowCompose(true);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-medium ml-auto"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE KEEP */}
        {activeTab === 'keep' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                Google Keep Notes & Checklists
              </span>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition"
              >
                {showAddNote ? 'Cancel' : '+ New Note'}
              </button>
            </div>

            {/* Add note drawer */}
            {showAddNote && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2 mb-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <textarea
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  placeholder="Take a note or checklist item..."
                  rows={3}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleCreateKeepNote}
                  className="w-full py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                >
                  Save to Keep
                </button>
              </div>
            )}

            {/* Keep Notes Grid */}
            <div className="space-y-2.5">
              {keepNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {note.title}
                    </span>
                    <span className="text-[10px] text-slate-500">{note.updatedAt}</span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {note.body}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => onInsertToKeyboard(note.body)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold hover:bg-amber-500/30 transition"
                    >
                      Insert into Keyboard
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
