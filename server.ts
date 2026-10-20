import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Allow large image uploads for screen vision analysis
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Helper for contextual fallbacks based on scenario
function getScenarioAnalysisFallback(screenScenario: string, currentInput: string) {
  const lower = (screenScenario + ' ' + currentInput).toLowerCase();

  if (lower.includes('slack') || lower.includes('vp') || lower.includes('staging') || lower.includes('eta') || lower.includes('work')) {
    return {
      summary: 'Executive requesting a clear, accountable ETA on the current staging build deployment.',
      intent: 'Urgent status update needed to report to executive client stakeholders.',
      urgency: 'High',
      emotionalTone: 'Direct & Time-Sensitive',
      advice: [
        'State your exact ETA in the very first sentence.',
        'Confirm the auth fix is being regression-tested without making open-ended excuses.',
        'Commit to pinging the channel immediately upon deployment.'
      ],
      suggestedReplies: [
        'Patch is tested locally, wrapping up regression checks and pushing to staging in 15 mins.',
        'On it—deploying the auth fix now. You will have staging live by 11:00 AM sharp.',
        'Verified the token fix; deploying build to staging right now.'
      ],
      suggestedActions: [
        'Send 15-minute ETA confirmation',
        'Trigger staging webhook pipeline',
        'Add channel notification'
      ],
      keyTakeaways: ['High urgency from Alex', 'Needs verifiable timeline']
    };
  }

  if (lower.includes('hinge') || lower.includes('tinder') || lower.includes('match') || lower.includes('food') || lower.includes('dating')) {
    return {
      summary: 'Dating match engaging with playful banter asking for an unconventional food take.',
      intent: 'Testing sense of humor, authenticity, and conversational chemistry.',
      urgency: 'Low',
      emotionalTone: 'Playful & Curious',
      advice: [
        'Avoid common tropes like pineapple pizza; choose an endearing, oddly specific scenario.',
        'Keep the tone charming and self-aware.',
        'End with an open door for them to tease you back.'
      ],
      suggestedReplies: [
        'Cold leftover takeout eaten standing in the refrigerator light at 1 AM hits different. Fight me.',
        'Cereal is technically soup and dessert at the exact same time.',
        'I put hot honey on literally everything. No regrets.'
      ],
      suggestedActions: [
        'Send witty retort',
        'Ask about their guilty pleasure food'
      ],
      keyTakeaways: ['Friendly vibe', 'Keep it lighthearted']
    };
  }

  if (lower.includes('invoice') || lower.includes('billing') || lower.includes('charge') || lower.includes('dispute') || lower.includes('cfo')) {
    return {
      summary: 'Client CFO questioning an unexplained $240 invoice charge and considering a dispute.',
      intent: 'Protecting budget and demanding immediate clarification.',
      urgency: 'High',
      emotionalTone: 'Defensive & Firm',
      advice: [
        'Validate their concern immediately—never sound dismissive.',
        'Confirm that you are actively inspecting invoice #8819 with finance today.',
        'Offer to credit or adjust without friction if verified.'
      ],
      suggestedReplies: [
        'Hi Sarah, thanks for bringing this up. I am reviewing invoice #8819 with billing right now and will clarify or credit it today.',
        'Understood Sarah. Looking into that $240 line item immediately so you don’t have to file a dispute.',
        'Appreciate you flagging this. Pulling the itemized ledger now and will follow up within the hour.'
      ],
      suggestedActions: [
        'Send de-escalation acknowledgement',
        'Flag for urgent billing audit'
      ],
      keyTakeaways: ['Dispute risk', 'Fast validation required']
    };
  }

  // General fallback
  return {
    summary: `Active screen perceived in ${screenScenario || 'mobile view'}.`,
    intent: 'User is drafting a contextual response.',
    urgency: 'Medium',
    emotionalTone: 'Active / Focused',
    advice: [
      'Match the length and tone of the counterpart.',
      'Be clear on expectations and proactive with next steps.',
      'Proofread key numbers and names before sending.'
    ],
    suggestedReplies: [
      currentInput ? `Understood: ${currentInput}` : 'Sounds good! Taking care of this right away.',
      'Got it, will review the details and confirm shortly.',
      'Thanks for the update—will keep you posted as soon as it is done.'
    ],
    suggestedActions: [
      'Send quick confirmation',
      'Request additional context'
    ],
    keyTakeaways: ['Screen observed', 'Tactical suggestions ready']
  };
}

// Screen Vision & In-The-Moment Advice Endpoint
app.post('/api/screen-analyze', async (req, res) => {
  const { imageBase64, currentInput = '', screenScenario = 'General App', customPrompt = '' } = req.body;

  try {
    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        analysis: getScenarioAnalysisFallback(screenScenario, currentInput),
      });
    }

    const systemPrompt = `You are Omni Keyboard AI, a super-intelligent in-the-moment mobile keyboard assistant.
You sit directly above the user's mobile keyboard, visually perceiving what is happening on their screen and coaching them live.
Analyze the user's screen (or provided context) and current input draft.
Provide real-time tactical advice:
1. What is happening on screen (summary and context).
2. What the emotional tone and hidden intent are.
3. 2-3 specific, sharp pieces of in-the-moment advice.
4. 3 natural, high-converting or tactful reply options ready to be tapped and typed.
5. 2-3 immediate keyboard quick actions.

You must respond ONLY with a valid JSON object matching this schema:
{
  "summary": "1 sentence describing what is visible on screen",
  "intent": "The other party's goal or the screen purpose",
  "urgency": "Low" | "Medium" | "High",
  "emotionalTone": "e.g., Anxious, Firm, Friendly, Skeptical, Casual",
  "advice": ["Tip 1", "Tip 2", "Tip 3"],
  "suggestedReplies": ["Direct 1-tap reply 1", "Direct 1-tap reply 2", "Direct 1-tap reply 3"],
  "suggestedActions": ["Action 1", "Action 2"],
  "keyTakeaways": ["Key point 1", "Key point 2"]
}`;

    const parts: any[] = [];

    // If an image was provided
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    let userInstruction = `Screen Scenario: ${screenScenario}\nUser's Current Keyboard Input: "${currentInput}"\n`;
    if (customPrompt) {
      userInstruction += `User specific request: ${customPrompt}\n`;
    }
    userInstruction += `Please visually analyze the screen content, dialogue context, and current text to give instant suggestions.`;

    parts.push({ text: userInstruction });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        role: 'user',
        parts,
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(textOutput);
    } catch {
      const match = textOutput.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return res.json({
      success: true,
      analysis: parsed,
    });
  } catch (error: any) {
    console.warn('Gemini generateContent notice (using graceful fallback):', error?.message || error);
    // Graceful fallback to guarantee zero disruption
    return res.json({
      success: true,
      isFallback: true,
      analysis: getScenarioAnalysisFallback(screenScenario, currentInput),
    });
  }
});

// Keyboard Tone Transformer & Polish Endpoint
app.post('/api/keyboard-rewrite', async (req, res) => {
  const { text, style = 'professional', screenContext = '' } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, error: 'Text is required' });
  }

  const clean = text.trim();
  const fallbacks: Record<string, string> = {
    professional: `Thank you for your update. ${clean}. Please let me know if you need any additional clarification.`,
    punchy: `${clean} — taking care of it now.`,
    diplomatic: `I appreciate your perspective on this. ${clean}. Looking forward to aligning on next steps.`,
    flirty: `${clean} 😉✨`,
    fix_grammar: clean.charAt(0).toUpperCase() + clean.slice(1) + (clean.endsWith('.') ? '' : '.'),
    concise: clean.split(' ').slice(0, 10).join(' ') + (clean.split(' ').length > 10 ? '...' : '.'),
  };

  try {
    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        rewritten: fallbacks[style] || text,
        alternatives: [fallbacks[style] || text],
        rationale: `Transformed to ${style} tone.`,
      });
    }

    const systemPrompt = `You are Omni Keyboard AI's writing engine.
Rewrite the provided user text into the requested style/tone.
Available styles:
- professional: Polished, respectful, executive, clear.
- punchy: High-impact, concise, dynamic, zero fluff.
- diplomatic: De-escalating, collaborative, empathetic, firm.
- flirty: Playful, charming, witty, conversational.
- fix_grammar: Fix all typos, punctuation, grammar, and flow while keeping original voice.
- concise: Cut words by 50% without losing meaning.

Return ONLY a JSON object:
{
  "rewritten": "Primary rewritten text ready to paste",
  "alternatives": ["Alternative option 1", "Alternative option 2"],
  "rationale": "One brief sentence explaining why this works well in this context"
}`;

    const prompt = `Current Text: "${clean}"
Target Style: ${style}
Current Screen Context: ${screenContext || 'Mobile conversation'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      rewritten: parsed.rewritten || fallbacks[style] || text,
      alternatives: parsed.alternatives || [fallbacks[style] || text],
      rationale: parsed.rationale || `Rewritten for ${style}`,
    });
  } catch (error: any) {
    console.warn('Gemini rewrite notice (using graceful fallback):', error?.message || error);
    return res.json({
      success: true,
      isFallback: true,
      rewritten: fallbacks[style] || text,
      alternatives: [fallbacks[style] || text],
      rationale: `Transformed to ${style} tone.`,
    });
  }
});

// Companion chat endpoint for Omni Studios
app.post('/api/companion-chat', async (req, res) => {
  const { prompt, history = [], screenContext = '' } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  const fallbackReplies = [
    `I am actively watching your screen ("${screenContext || 'Mobile App'}"). Keeping your replies concise will yield the best outcome here.`,
    `Based on the screen context, focus on stating a clear ETA and acknowledging their question directly.`,
    `Omni Keyboard is active. You can tap any of the suggestion chips above your keyboard to insert them immediately.`,
  ];

  try {
    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        reply: fallbackReplies[0],
      });
    }

    const systemInstruction = `You are Omni, the personal intelligence operating system for this mobile device and keyboard.
You are sharp, helpful, concise (ideal for mobile screen reading), and possess live contextual vision.
Keep answers under 2-3 punchy paragraphs or bullet points suitable for a phone screen.`;

    const chatContents: any[] = [];
    if (screenContext) {
      chatContents.push({
        role: 'user',
        parts: [{ text: `[Screen Context: ${screenContext}]` }],
      });
      chatContents.push({
        role: 'model',
        parts: [{ text: `Understood. I am tracking your active screen.` }],
      });
    }

    for (const msg of history) {
      chatContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    chatContents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      success: true,
      reply: response.text || fallbackReplies[1],
    });
  } catch (error: any) {
    console.warn('Gemini companion chat notice (using graceful fallback):', error?.message || error);
    return res.json({
      success: true,
      isFallback: true,
      reply: fallbackReplies[0],
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Omni Keyboard AI server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
