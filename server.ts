import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Lifelike Human Text-To-Speech endpoint via Gemini 3.8 Flash Lite TTS
app.post('/api/ai/tts', async (req, res) => {
  const { text, voiceName, style } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: style || 'Clear, natural, warm, and friendly speech for an expressive child companion',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioData: base64Audio, format: 'audio/wav' });
    }
    return res.status(500).json({ error: 'No audio generated' });
  } catch (err: any) {
    const isQuota = err?.status === 'RESOURCE_EXHAUSTED' || 
                    String(err?.message || '').includes('429') || 
                    String(err?.message || '').includes('quota') ||
                    String(err?.message || '').includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      console.warn('Server TTS quota reached. Client smoothly falling back to Web Speech API.');
      return res.status(429).json({ error: 'quota_exceeded', message: 'Quota reached. Falling back to on-device voice.' });
    }
    console.warn('Server TTS unavailable:', err?.message || 'Error occurred');
    return res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
});

// Server-side Gemini AI content generation endpoint for parents
// (Generating tailored routines, social stories, life adventures, sensory notes)
app.post('/api/ai/generate', async (req, res) => {
  const { type, prompt, childContext } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured. Please configure it in Settings > Secrets.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are a supportive, experienced pediatric specialist and caregiver assistant creating visual support materials for children.
IMPORTANT PRINCIPLES:
- Never diagnose, cure, treat, or assign severity labels.
- The tone must be respectful, calm, encouraging, realistic, and predictable.
- AAC and communication phrases should support autonomy, choice-making, and comfort (not forced compliance or forced verbal speech).
- Output must strictly be valid JSON matching the requested structure without markdown wrapping if possible.

Target output type: ${type || 'general'}.
Child context: ${JSON.stringify(childContext || {})}`;

    let responseSchemaDescription = '';
    if (type === 'adventure') {
      responseSchemaDescription = `JSON schema:
{
  "title": "string",
  "category": "string",
  "icon": "string (emoji)",
  "summary": "string",
  "steps": [
    { "order": 1, "title": "string", "description": "string", "icon": "emoji" }
  ],
  "sensoryPreview": {
    "sound": "string",
    "light": "string",
    "people": "string",
    "touch": "string",
    "waiting": "string",
    "smells": "string",
    "movement": "string"
  },
  "thingsICanSay": ["string"],
  "thingsICanAskFor": ["string"],
  "whatHappensAfter": "string"
}`;
    } else if (type === 'routine') {
      responseSchemaDescription = `JSON schema:
{
  "title": "string",
  "category": "morning | school | after-school | bedtime | appointment | custom",
  "icon": "string (emoji)",
  "steps": [
    { "title": "string", "durationMin": 5, "instruction": "string", "icon": "emoji" }
  ],
  "firstThen": {
    "first": "string",
    "then": "string"
  }
}`;
    } else if (type === 'social-story') {
      responseSchemaDescription = `JSON schema:
{
  "title": "string",
  "icon": "string (emoji)",
  "pages": [
    { "pageNumber": 1, "text": "string (1-2 clear, reassuring sentences)", "illustrationPrompt": "string", "icon": "emoji" }
  ],
  "keyTakeaways": ["string"],
  "suggestedPhrases": ["string"]
}`;
    } else {
      responseSchemaDescription = `JSON schema:
{
  "title": "string",
  "content": "string",
  "steps": [{ "title": "string", "description": "string" }],
  "communicationPrompts": ["string"]
}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${prompt}\n\nPlease generate a draft in this format:\n${responseSchemaDescription}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback clean
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({ result: parsed });
  } catch (err: any) {
    console.error('Gemini generate error:', err);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// -------------------------------------------------------------
// Live Caregiver Companion & Sync Endpoints
// Enables caregivers to see child's current activity, feelings,
// AAC speech, habits, and send reassuring messages from anywhere.
// -------------------------------------------------------------
interface CaregiverMessageItem {
  id: string;
  senderName: string;
  text: string;
  emoji?: string;
  timestamp: string;
  read: boolean;
}

interface CaregiverSessionData {
  pairingCode: string;
  childName: string;
  lastActiveTime: string;
  currentActivity: string;
  currentMood: string | null;
  currentMoodReason?: string;
  currentMoodNeed?: string;
  lastAacSentence?: string;
  lastSpokenTime?: string;
  habitsCompletedToday: number;
  totalHabits: number;
  routineProgress: any;
  stars: number;
  isOffline: boolean;
  quickAlert?: string | null;
  activeAlert?: any | null;
  messages: CaregiverMessageItem[];
}

const caregiverSessions = new Map<string, CaregiverSessionData>();

// Get caregiver session for a pairing code
app.get('/api/caregiver/session/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  if (!code) {
    return res.status(400).json({ error: 'Pairing code is required' });
  }

  const session = caregiverSessions.get(code) || {
    pairingCode: code,
    childName: 'Alex',
    lastActiveTime: new Date().toISOString(),
    currentActivity: 'Exploring Lumina Home',
    currentMood: 'calm',
    habitsCompletedToday: 2,
    totalHabits: 4,
    routineProgress: null,
    stars: 15,
    isOffline: false,
    messages: [],
  };

  return res.json({ session });
});

// Child updates their active state (activity, mood, AAC, habits, routine)
app.post('/api/caregiver/sync', (req, res) => {
  const {
    pairingCode,
    childName,
    currentActivity,
    currentMood,
    currentMoodReason,
    currentMoodNeed,
    lastAacSentence,
    habitsCompletedToday,
    totalHabits,
    routineProgress,
    stars,
    isOffline,
    quickAlert,
  } = req.body;

  const code = (pairingCode || 'LUMI-101').trim().toUpperCase();
  const existing = caregiverSessions.get(code);

  const updated: CaregiverSessionData = {
    pairingCode: code,
    childName: childName || existing?.childName || 'Child',
    lastActiveTime: new Date().toISOString(),
    currentActivity: currentActivity || existing?.currentActivity || 'Active in Lumina',
    currentMood: currentMood !== undefined ? currentMood : (existing?.currentMood ?? null),
    currentMoodReason: currentMoodReason !== undefined ? currentMoodReason : existing?.currentMoodReason,
    currentMoodNeed: currentMoodNeed !== undefined ? currentMoodNeed : existing?.currentMoodNeed,
    lastAacSentence: lastAacSentence !== undefined ? lastAacSentence : existing?.lastAacSentence,
    lastSpokenTime: lastAacSentence ? new Date().toISOString() : existing?.lastSpokenTime,
    habitsCompletedToday: habitsCompletedToday ?? existing?.habitsCompletedToday ?? 0,
    totalHabits: totalHabits ?? existing?.totalHabits ?? 0,
    routineProgress: routineProgress !== undefined ? routineProgress : existing?.routineProgress,
    stars: stars ?? existing?.stars ?? 0,
    isOffline: !!isOffline,
    quickAlert: quickAlert !== undefined ? quickAlert : existing?.quickAlert,
    messages: existing?.messages || [],
  };

  caregiverSessions.set(code, updated);
  return res.json({ success: true, session: updated });
});

// Caregiver sends a warm reassurance / encouragement note to child
app.post('/api/caregiver/message', (req, res) => {
  const { pairingCode, senderName, text, emoji } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();

  if (!code || !text) {
    return res.status(400).json({ error: 'Pairing code and message text are required' });
  }

  let session = caregiverSessions.get(code);
  if (!session) {
    session = {
      pairingCode: code,
      childName: 'Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in Lumina',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
    };
    caregiverSessions.set(code, session);
  }

  const newMessage: CaregiverMessageItem = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    senderName: senderName || 'Caregiver',
    text: text.trim(),
    emoji: emoji || '❤️',
    timestamp: new Date().toISOString(),
    read: false,
  };

  session.messages.push(newMessage);
  // Keep last 30 messages max
  if (session.messages.length > 30) {
    session.messages = session.messages.slice(-30);
  }

  return res.json({ success: true, message: newMessage });
});

// Child checks for unread messages from caregiver
app.get('/api/caregiver/messages/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const session = caregiverSessions.get(code);
  if (!session) {
    return res.json({ messages: [], unreadCount: 0 });
  }

  const unreadCount = session.messages.filter((m) => !m.read).length;
  // Mark as read
  session.messages.forEach((m) => {
    m.read = true;
  });

  return res.json({ messages: session.messages, unreadCount });
});

// Child triggers an urgent emotion alert (e.g. sad, needs help, overwhelmed at school or therapy)
app.post('/api/caregiver/alert', (req, res) => {
  const { pairingCode, childName, emotion, label, emoji, location, note } = req.body;
  const code = (pairingCode || 'LUMI-101').trim().toUpperCase();

  let session = caregiverSessions.get(code);
  if (!session) {
    session = {
      pairingCode: code,
      childName: childName || 'Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Alert Triggered',
      currentMood: emotion || 'overwhelmed',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
    };
    caregiverSessions.set(code, session);
  }

  const alert = {
    id: 'alert-' + Date.now(),
    childName: childName || session.childName || 'Child',
    pairingCode: code,
    emotion: emotion || 'need_help',
    label: label || 'Needs Support',
    emoji: emoji || '🚨',
    location: location || 'school',
    note: note || '',
    timestamp: new Date().toISOString(),
    status: 'active',
  };

  session.activeAlert = alert;
  session.currentMood = emotion;
  session.quickAlert = `URGENT ALERT: ${label} (${location ? 'At ' + location : 'Needs help'})`;
  session.lastActiveTime = new Date().toISOString();

  return res.json({ success: true, alert });
});

// Caregiver acknowledges the alert and sends instant reassurance response
app.post('/api/caregiver/alert/acknowledge', (req, res) => {
  const { pairingCode, acknowledgedBy, responseMessage } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();
  const session = caregiverSessions.get(code);

  if (!session || !session.activeAlert) {
    return res.status(404).json({ error: 'No active alert found for this code' });
  }

  session.activeAlert.status = 'acknowledged';
  session.activeAlert.acknowledgedBy = acknowledgedBy || 'Caregiver';
  session.activeAlert.acknowledgedAt = new Date().toISOString();
  session.activeAlert.responseMessage = responseMessage;

  // Also push response message to child's message stream
  if (responseMessage) {
    const newMessage = {
      id: 'msg-ack-' + Date.now(),
      senderName: acknowledgedBy || 'Caregiver',
      text: responseMessage,
      emoji: '🚗',
      timestamp: new Date().toISOString(),
      read: false,
    };
    session.messages.push(newMessage);
  }

  return res.json({ success: true, alert: session.activeAlert });
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

