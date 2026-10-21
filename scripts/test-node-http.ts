import http from 'http';

function testHttp() {
  const t0 = performance.now();
  http.get('http://127.0.0.1:3000/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('http.get took:', Math.round(performance.now() - t0), 'ms, response:', data);
    });
  });
}

testHttp();
