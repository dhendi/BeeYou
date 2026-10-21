import fs from 'fs';
import path from 'path';

async function testGemini() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
  const key = match ? match[1].trim() : null;
  console.log('Key present:', Boolean(key));

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const payload = {
    model: 'gemini-3.8-flash-tts',
    input: [{ type: 'user_input', content: [{ type: 'text', text: 'Hello' }] }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: 'Puck' }] },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-goog-api-key': key || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6000),
  });

  console.log('Gemini status:', res.status);
  const text = await res.text();
  console.log('Response preview:', text.slice(0, 200));
}

testGemini().catch(console.error);
