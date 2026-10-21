import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
  console.log('Set ipv4first successfully');
} catch (e) {
  console.log('Error setting ipv4first:', e);
}

const t0 = performance.now();
fetch('https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=Hello')
  .then(res => {
    console.log('Fetch time:', Math.round(performance.now() - t0), 'ms, status:', res.status);
  })
  .catch(console.error);
