import fs from 'fs';
import path from 'path';

async function testGoogleTts() {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent('Hello friend')}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
  });
  console.log('Status:', res.status, 'Content-Type:', res.headers.get('content-type'));
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('Buffer size:', buf.length);
}

testGoogleTts().catch(console.error);
