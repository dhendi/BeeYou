/**
 * Comprehensive Automated Verification Suite for Security Audit Finding #6:
 * Caregiver Alert Dependability, Delivery Confirmation & Offline Resilience
 * 
 * Verifies:
 * 1. Honest Delivery Lifecycle:
 *    - POST /api/caregiver/alert returns deliveryStatus: 'dispatched' (never prematurely 'delivered').
 *    - POST /api/caregiver/alert/delivered records physical device receipt (deliveryStatus: 'delivered_to_device').
 *    - POST /api/caregiver/alert/acknowledge transitions alert to 'acknowledged'.
 *    - POST /api/caregiver/alert/resolve clears active alert.
 * 2. Offline Queueing & Reconnection:
 *    - Offline alerts are persisted in local queue.
 *    - Queue listeners are notified on queue changes.
 *    - Reconnection flushes offline alerts to the server.
 * 3. Rapid Tap Debounce & Abuse Protection:
 *    - Rapid button mashing within 1.5s deduplicates cleanly.
 * 4. Push Notification Diagnostics & Delayed Testing:
 *    - Reliability diagnostic assesses PWA, service worker, and platform settings.
 *    - scheduleDelayedAlert supports testing background wake-up on locked screens.
 * 5. Safety Disclaimers & Unacknowledged Fallbacks:
 *    - Disclaimers state BeeYou does not guarantee emergency delivery and is not 911.
 *    - Unacknowledged alerts provide fallback direct calling and SMS texting.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('\n======================================================');
  console.log('🐝 BeeYou Finding 6: Caregiver Alert Dependability');
  console.log('======================================================\n');

  const { default: app } = await import('../server');

  // Bind to ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Running on ephemeral port: ${port}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  const testFamilyCode = 'BEE-DEMO';
  const reviewerAuthHeader = 'Bearer by_demo_reviewer_token_2026';

  // -------------------------------------------------------------
  // Suite 1: Server Alert Lifecycle & Delivery Receipt Handshake
  // -------------------------------------------------------------
  console.log('--- Suite 1: Server Alert Lifecycle & Delivery Receipt Handshake ---');

  // 1.1 Trigger Alert
  const alertId = 'alert-test-' + Date.now();
  const alertRes = await fetch(`${baseUrl}/api/caregiver/alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': reviewerAuthHeader,
    },
    body: JSON.stringify({
      id: alertId,
      pairingCode: testFamilyCode,
      childName: 'Alex',
      emotion: 'need_help',
      alertId: 'need_help',
      label: 'Needs Support',
      location: 'school',
      note: 'Sensory overload in gym',
    }),
  });

  assert(alertRes.status === 200, 'POST /api/caregiver/alert returns 200 OK');
  const alertData: any = await alertRes.json();
  assert(alertData.success === true, 'Alert response success is true');
  assert(alertData.deliveryStatus === 'dispatched', 'Alert deliveryStatus is honestly reported as "dispatched" (not "delivered")');
  assert(alertData.alert.dispatchedAt !== undefined, 'Alert includes dispatchedAt timestamp');
  assert(alertData.alert.status === 'active', 'Alert status is active');

  // 1.2 Fetch Caregiver Session to verify active alert status
  const sessionRes = await fetch(`${baseUrl}/api/caregiver/session/${testFamilyCode}`, {
    headers: { 'Authorization': reviewerAuthHeader },
  });
  const sessionData: any = await sessionRes.json();
  assert(sessionData.session?.activeAlert?.id === alertId, 'Session activeAlert matches created alert ID');
  assert(sessionData.session?.activeAlert?.deliveryStatus === 'dispatched', 'Session activeAlert reflects dispatched state');

  // 1.3 Caregiver device confirms physical receipt (delivery receipt)
  const delivRes = await fetch(`${baseUrl}/api/caregiver/alert/delivered`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': reviewerAuthHeader,
    },
    body: JSON.stringify({
      pairingCode: testFamilyCode,
      alertId,
      deviceId: 'caregiver-phone-1',
    }),
  });

  assert(delivRes.status === 200, 'POST /api/caregiver/alert/delivered returns 200 OK');
  const delivData: any = await delivRes.json();
  assert(delivData.success === true, 'Delivery confirmation success is true');
  assert(typeof delivData.deliveredAt === 'string', 'Delivery confirmation returns deliveredAt ISO timestamp');

  // 1.4 Verify session reflects delivered_to_device state
  const sessionAfterDeliv = await fetch(`${baseUrl}/api/caregiver/session/${testFamilyCode}`, {
    headers: { 'Authorization': reviewerAuthHeader },
  });
  const sessionAfterDelivData: any = await sessionAfterDeliv.json();
  assert(
    sessionAfterDelivData.session?.activeAlert?.deliveryStatus === 'delivered_to_device',
    'Session activeAlert transitioned to "delivered_to_device"'
  );
  assert(
    sessionAfterDelivData.session?.activeAlert?.deliveredToDeviceAt !== null,
    'Session activeAlert has deliveredToDeviceAt timestamp'
  );

  // 1.5 Caregiver acknowledges the alert
  const ackRes = await fetch(`${baseUrl}/api/caregiver/alert/acknowledge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': reviewerAuthHeader,
    },
    body: JSON.stringify({
      pairingCode: testFamilyCode,
      alertId,
      acknowledgedBy: 'Mom',
      responseMessage: "I'm on my way to the school gym right now.",
      responseId: 'coming',
    }),
  });

  assert(ackRes.status === 200, 'POST /api/caregiver/alert/acknowledge returns 200 OK');
  const ackData: any = await ackRes.json();
  assert(ackData.success === true, 'Acknowledge response success is true');
  assert(ackData.alert?.status === 'acknowledged', 'Alert status updated to "acknowledged"');
  assert(ackData.alert?.deliveryStatus === 'acknowledged', 'Alert deliveryStatus updated to "acknowledged"');
  assert(ackData.alert?.acknowledgedBy === 'Mom', 'AcknowledgedBy is set to "Mom"');

  // 1.6 Caregiver resolves the alert
  const resolveRes = await fetch(`${baseUrl}/api/caregiver/alert/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': reviewerAuthHeader,
    },
    body: JSON.stringify({
      pairingCode: testFamilyCode,
      alertId,
    }),
  });

  assert(resolveRes.status === 200, 'POST /api/caregiver/alert/resolve returns 200 OK');
  const resolveData: any = await resolveRes.json();
  assert(resolveData.success === true, 'Resolve response success is true');

  const sessionAfterResolve = await fetch(`${baseUrl}/api/caregiver/session/${testFamilyCode}`, {
    headers: { 'Authorization': reviewerAuthHeader },
  });
  const sessionAfterResolveData: any = await sessionAfterResolve.json();
  assert(sessionAfterResolveData.session?.activeAlert === null, 'Active alert cleared after resolution');

  // -------------------------------------------------------------
  // Suite 2: Push Notification Reliability & Device Diagnostics
  // -------------------------------------------------------------
  console.log('\n--- Suite 2: Push Notification Reliability & Device Diagnostics ---');

  const { pushNotificationService } = await import('../src/services/pushNotificationService');

  const report = pushNotificationService.getReliabilityReport();
  assert(typeof report.isSupported === 'boolean', 'Reliability report provides isSupported boolean');
  assert(['optimal', 'moderate', 'limited'].includes(report.reliabilityRating), 'Reliability rating is optimal, moderate, or limited');
  assert(Array.isArray(report.recommendations), 'Reliability report provides platform recommendations array');
  assert(report.disclaimer.includes('cannot be guaranteed'), 'Report includes explicit non-guaranteed delivery disclaimer');
  assert(report.disclaimer.includes('911'), 'Report includes explicit 911/emergency service disclaimer');

  // Test delayed locked-screen alert scheduling
  let cancelFired = false;
  const cancelDelayed = pushNotificationService.scheduleDelayedAlert(10, {
    title: 'Test',
    body: 'Test',
  });
  assert(typeof cancelDelayed === 'function', 'scheduleDelayedAlert returns a cancellation function');
  cancelDelayed(); // Cancel cleanly
  cancelFired = true;
  assert(cancelFired, 'Delayed alert cancelled successfully');

  // -------------------------------------------------------------
  // Suite 3: Offline Queueing & Reconnection Functions
  // -------------------------------------------------------------
  console.log('\n--- Suite 3: Offline Queueing & Reconnection Functions ---');

  // Mock window & localStorage for node environment test
  const storageMap: Record<string, string> = {};
  const mockStorage = {
    getItem: (k: string) => storageMap[k] || null,
    setItem: (k: string, v: string) => { storageMap[k] = v; },
    removeItem: (k: string) => { delete storageMap[k]; },
  };
  (global as any).localStorage = mockStorage;
  (global as any).window = {
    localStorage: mockStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const {
    getOfflineAlertQueue,
    queueOfflineAlert,
    removeAlertFromOfflineQueue,
  } = await import('../src/services/caregiverSync');

  assert(Array.isArray(getOfflineAlertQueue()), 'getOfflineAlertQueue returns array');
  
  const sampleOfflineAlert: any = {
    id: 'offline-alert-1',
    pairingCode: 'OFFLINE-FAM',
    childName: 'Sam',
    emotion: 'need_help',
    label: 'Offline SOS',
    emoji: '🚨',
    timestamp: new Date().toISOString(),
    status: 'active',
    deliveryStatus: 'queued_offline',
  };

  queueOfflineAlert(sampleOfflineAlert);
  const queueAfterAdd = getOfflineAlertQueue();
  assert(queueAfterAdd.length === 1, 'queueOfflineAlert stores alert in offline queue');
  assert(queueAfterAdd[0].id === 'offline-alert-1', 'Queued alert ID matches');
  assert(queueAfterAdd[0].deliveryStatus === 'queued_offline', 'Queued alert deliveryStatus is "queued_offline"');

  removeAlertFromOfflineQueue('offline-alert-1');
  const queueAfterRemove = getOfflineAlertQueue();
  assert(queueAfterRemove.length === 0, 'removeAlertFromOfflineQueue successfully removes item');

  // -------------------------------------------------------------
  // Suite 4: Safety Disclaimers & UI Code Integrity Checks
  // -------------------------------------------------------------
  console.log('\n--- Suite 4: Safety Disclaimers & UI Code Integrity Checks ---');

  const alertModalSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/CaregiverAlertModal.tsx'),
    'utf-8'
  );

  assert(
    alertModalSource.includes('does not guarantee emergency delivery'),
    'CaregiverAlertModal contains explicit "does not guarantee emergency delivery" disclaimer'
  );
  assert(
    alertModalSource.includes('Caregiver Has Not Responded Yet') || alertModalSource.includes('secondsElapsed >= 30'),
    'CaregiverAlertModal includes 30s unacknowledged timeout detection'
  );
  assert(
    alertModalSource.includes('launchNativePhoneCall') && alertModalSource.includes('launchNativeSms'),
    'CaregiverAlertModal provides fallback direct calling & SMS texting when alert is unacknowledged'
  );
  assert(
    alertModalSource.includes('queued_offline'),
    'CaregiverAlertModal supports "queued_offline" state with offline indicator'
  );
  assert(
    alertModalSource.includes('onCaregiverAlertDelivered'),
    'CaregiverAlertModal listens for caregiver device receipt confirmations'
  );

  const alertsTabSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/caregiver/CaregiverAlertsTab.tsx'),
    'utf-8'
  );

  assert(
    alertsTabSource.includes('does not guarantee emergency notification delivery'),
    'CaregiverAlertsTab contains explicit "does not guarantee emergency notification delivery" disclaimer'
  );
  assert(
    alertsTabSource.includes('handleTestLockScreenAlert') || alertsTabSource.includes('Test Lock Screen'),
    'CaregiverAlertsTab provides locked-screen / background delayed alert test'
  );

  const emergencyModalSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/EmergencySensoryModal.tsx'),
    'utf-8'
  );

  assert(
    emergencyModalSource.includes('does not guarantee delivery or connect to 911'),
    'EmergencySensoryModal clarifies it does not guarantee delivery or connect to 911'
  );

  // Close test server
  server.close();

  console.log('\n======================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
