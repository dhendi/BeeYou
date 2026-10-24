process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import { UsageBudgetTracker } from '../../src/services/ttsAndTranslationService';

async function main() {
  const targetDate = process.argv[2];
  const cap = Number(process.argv[3]) || 5;

  const tracker = new UsageBudgetTracker({
    dailyTtsCap: cap,
  });
  tracker.setCapsForTesting({ dailyTtsCap: cap });

  // Signal ready to parent process
  console.log('WORKER_READY');

  process.stdin.once('data', async () => {
    try {
      const result = await tracker.reserveTtsBudget(targetDate);
      console.log(`WORKER_RESULT:${JSON.stringify(result)}`);
      tracker.destroy();
      process.exit(0);
    } catch (err: any) {
      console.error('Worker reservation error:', err?.message || err);
      tracker.destroy();
      process.exit(1);
    }
  });
}

main().catch((err) => {
  console.error('Budget worker initialization error:', err);
  process.exit(1);
});
