process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';

async function start() {
  const serverModule = await import('../../server');
  const app = serverModule.default;
  const server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address() as any;
    console.log(`READY:${address.port}`);
  });
}

start().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
