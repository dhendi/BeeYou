import fs from 'fs';

async function test() {
  const cleanText = "Sparkling lemonade with mint leaves on a warm afternoon 1792601510239";
  const normLang = "en";
  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normLang)}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
  console.log('Fetching:', targetUrl);
  const t0 = performance.now();
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
    signal: AbortSignal.timeout(3500),
  });
  console.log('Status:', res.status, 'Time:', Math.round(performance.now() - t0), 'ms');
}

test().catch(console.error);
