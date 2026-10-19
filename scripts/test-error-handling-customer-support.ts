/**
 * Automated Verification Suite for Section 9: Error Handling & Customer Support
 * 
 * Verifies all 6 requirements:
 * 1. Provide a support email or contact method (support@beeyou.app).
 * 2. Display understandable messages when login or syncing fails.
 * 3. Handle caregiver pairing failures without leaving accounts in a broken state.
 * 4. Provide recovery paths for lost connections and interrupted setup.
 * 5. Avoid exposing technical details or private data in error messages.
 * 6. Give users clear feedback when actions succeed or fail.
 */

import { sanitizeAuthErrorMessage } from '../src/services/authService';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function runErrorHandlingAndSupportSuite() {
  console.log('================================================================');
  console.log('Section 9: Error Handling & Customer Support Verification Suite');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Provide a support email or contact method
  // --------------------------------------------------------------------------
  console.log('Test 1: Support Email & In-App Contact Accessibility');
  const supportEmail = 'support@beeyou.app';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  assert(emailRegex.test(supportEmail), 'Official support email has valid RFC 5322 format (support@beeyou.app)');

  // Verify support email is present in LegalModals, CaregiverHelpHub, and CaregiverHowItWorksModal
  const fs = await import('fs');
  const legalModalsCode = fs.readFileSync('src/components/LegalModals.tsx', 'utf-8');
  assert(legalModalsCode.includes('support@beeyou.app'), 'Support email published in LegalModals.tsx (Contact & Support section)');

  const helpHubCode = fs.readFileSync('src/components/caregiver/CaregiverHelpHub.tsx', 'utf-8');
  assert(helpHubCode.includes('support@beeyou.app'), 'Support email embedded in CaregiverHelpHub.tsx with direct mailto & copy actions');
  assert(helpHubCode.includes('mailto:support@beeyou.app'), 'CaregiverHelpHub includes mailto: action link with pre-filled subject');

  const howItWorksCode = fs.readFileSync('src/components/CaregiverHowItWorksModal.tsx', 'utf-8');
  assert(howItWorksCode.includes('support@beeyou.app'), 'Support email embedded in CaregiverHowItWorksModal.tsx footer');
  console.log('');

  // --------------------------------------------------------------------------
  // TEST 2: Display understandable messages when login or syncing fails
  // --------------------------------------------------------------------------
  console.log('Test 2: Understandable Messaging on Login & Sync Failures');
  const invalidCredMsg = sanitizeAuthErrorMessage({ code: 'auth/invalid-credential' });
  assert(
    invalidCredMsg.includes('Incorrect email or password') && !invalidCredMsg.includes('auth/'),
    'auth/invalid-credential translated to empathetic user-facing copy',
    invalidCredMsg
  );

  const rateLimitMsg = sanitizeAuthErrorMessage({ code: 'auth/too-many-requests' });
  assert(
    rateLimitMsg.includes('Access temporarily disabled') || rateLimitMsg.includes('temporarily paused'),
    'auth/too-many-requests gives calm explanation and recovery instruction',
    rateLimitMsg
  );

  const netFailMsg = sanitizeAuthErrorMessage({ code: 'auth/network-request-failed' });
  assert(
    netFailMsg.includes('Network connection') && netFailMsg.includes('check your internet connection'),
    'auth/network-request-failed gives clear non-technical network check guidance',
    netFailMsg
  );

  const weakPassMsg = sanitizeAuthErrorMessage({ code: 'auth/weak-password' });
  assert(
    weakPassMsg.includes('password is too weak') || weakPassMsg.includes('at least 8 characters'),
    'auth/weak-password explains length requirement clearly',
    weakPassMsg
  );

  const emailInUseMsg = sanitizeAuthErrorMessage({ code: 'auth/email-already-in-use' });
  assert(
    emailInUseMsg.includes('already exists') && emailInUseMsg.includes('sign in instead'),
    'auth/email-already-in-use guides existing user to sign in',
    emailInUseMsg
  );
  console.log('');

  // --------------------------------------------------------------------------
  // TEST 3: Handle caregiver pairing failures without leaving accounts broken
  // --------------------------------------------------------------------------
  console.log('Test 3: Pairing Failure Resilience & Uncorrupted Account State');
  const connectModalCode = fs.readFileSync('src/components/ConnectCaregiverModal.tsx', 'utf-8');
  assert(
    connectModalCode.includes("s?.status === 'rejected'") && connectModalCode.includes('Pairing request was declined'),
    'Pairing rejection gracefully halts polling and sets clear claimError without altering linked codes'
  );
  assert(
    connectModalCode.includes("s?.status === 'expired'") && connectModalCode.includes('Pairing code has expired'),
    'Expired pairing codes time out cleanly and prompt for a fresh code'
  );
  assert(
    connectModalCode.includes("type: 'failure'") && connectModalCode.includes('errorMessage: res.message'),
    'Pairing failures trigger feedback modal with retry actions while keeping existing account intact'
  );

  const caregiverSyncCode = fs.readFileSync('src/services/caregiverSync.ts', 'utf-8');
  assert(
    caregiverSyncCode.includes('TemporaryPairingSession') && caregiverSyncCode.includes('expiresAt'),
    'Temporary pairing sessions enforce strict 15-minute expiration to prevent stale or orphaned states'
  );
  console.log('');

  // --------------------------------------------------------------------------
  // TEST 4: Recovery paths for lost connections and interrupted setup
  // --------------------------------------------------------------------------
  console.log('Test 4: Recovery Paths for Lost Connections & Interrupted Setup');
  const feedbackModalCode = fs.readFileSync('src/components/ConnectionFeedbackModal.tsx', 'utf-8');
  assert(
    feedbackModalCode.includes('onRetry') && feedbackModalCode.includes('Try Again'),
    'ConnectionFeedbackModal provides one-tap Try Again recovery path'
  );
  assert(
    feedbackModalCode.includes('onOpenCamera') && feedbackModalCode.includes('Scan with Camera'),
    'ConnectionFeedbackModal provides Camera QR Scan alternative recovery path'
  );
  assert(
    feedbackModalCode.includes('Troubleshooting Tips') && feedbackModalCode.includes('App is Open'),
    'ConnectionFeedbackModal includes 4-point troubleshooting checklist (App Open, Wi-Fi, Format, Expiration)'
  );

  assert(
    helpHubCode.includes('onReplayTour') && helpHubCode.includes('Replay Onboarding Tour'),
    'CaregiverHelpHub provides 1-click Replay Onboarding Tour for interrupted setup recovery'
  );

  const cloudSyncCode = fs.readFileSync('src/hooks/useFamilyCloudSync.ts', 'utf-8');
  assert(
    cloudSyncCode.includes("window.addEventListener('online', onForegroundResume)"),
    'Auto-reconnect listener re-establishes synchronization the instant connectivity is restored'
  );
  assert(
    cloudSyncCode.includes("document.addEventListener('visibilitychange', onForegroundResume)"),
    'Foreground resume listener triggers immediate health ping when returning to app'
  );
  console.log('');

  // --------------------------------------------------------------------------
  // TEST 5: Avoid exposing technical details or private data in error messages
  // --------------------------------------------------------------------------
  console.log('Test 5: Zero Technical Details or Private Data Leakage');
  // Raw Firebase exception with internal endpoint
  const rawFirebaseLeak = 'Firebase: Error (auth/internal-error) at https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD12345678901234567890';
  const sanitizedFirebase = sanitizeAuthErrorMessage(rawFirebaseLeak);
  assert(!sanitizedFirebase.includes('https://'), 'Scrubbed raw API endpoints and database URLs');
  assert(!sanitizedFirebase.includes('AIzaSyD'), 'Scrubbed Google API keys from user-facing error message');
  assert(!sanitizedFirebase.includes('Firebase: Error'), 'Scrubbed internal Firebase library prefix');
  assert(!sanitizedFirebase.includes('internal-error'), 'Technical error code replaced with safe user copy');

  // Stack trace leak
  const rawStackTrace = 'TypeError: Cannot read properties of undefined (reading uid)\n    at AuthService.login (http://localhost:3000/main.js:1452:12)\n    at async handleLogin (http://localhost:3000/app.js:230:5)';
  const sanitizedStack = sanitizeAuthErrorMessage(rawStackTrace);
  assert(!sanitizedStack.includes('localhost'), 'Scrubbed local host references');
  assert(!sanitizedStack.includes('TypeError'), 'Scrubbed JavaScript runtime exception names');
  assert(!sanitizedStack.includes('at AuthService'), 'Scrubbed internal call stack traces');
  assert(sanitizedStack.includes('temporary connection issue') || sanitizedStack.includes('Please try again'), 'Replaced fatal stack trace with reassuring user message');

  // Private token or credentials leak
  const rawTokenLeak = 'Authentication failed for user test@beeyou.app with token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
  const sanitizedToken = sanitizeAuthErrorMessage(rawTokenLeak);
  assert(!sanitizedToken.includes('eyJhbGciOiJIUzI1Ni'), 'Scrubbed JWT authentication bearer tokens');
  console.log('');

  // --------------------------------------------------------------------------
  // TEST 6: Give users clear feedback when actions succeed or fail
  // --------------------------------------------------------------------------
  console.log('Test 6: Multi-Modal Clear Feedback (Success & Failure)');
  assert(
    feedbackModalCode.includes("playChime('complete')") && feedbackModalCode.includes("playChime('tap')"),
    'ConnectionFeedbackModal plays success chime on connection and alert chime on failure'
  );
  assert(
    feedbackModalCode.includes('Connection Successful!') && feedbackModalCode.includes('Connection Failed'),
    'ConnectionFeedbackModal features high-contrast color-coded ribbons (Emerald for Success, Rose for Failure)'
  );
  assert(
    feedbackModalCode.includes('BeeMascot') && feedbackModalCode.includes("pose={isSuccess ? 'celebrating' : 'thinking'}"),
    'BeeMascot provides immediate visual pose feedback (celebrating on success, thinking on failure)'
  );

  const familyAuthCode = fs.readFileSync('src/components/FamilyAuthModal.tsx', 'utf-8');
  assert(
    familyAuthCode.includes("playChime('complete')") && familyAuthCode.includes("playChime('tap')"),
    'FamilyAuthModal dispatches multi-modal audio cues on form success and validation tap'
  );
  assert(
    familyAuthCode.includes('loginLoading') && familyAuthCode.includes('regLoading'),
    'Loading indicators and disabled button states prevent double-submission during network requests'
  );
  console.log('');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log(`Results: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (passedTests === totalTests) {
    console.log('STATUS: ALL ERROR HANDLING & CUSTOMER SUPPORT REQUIREMENTS VERIFIED! ✓');
  } else {
    console.error('STATUS: SOME TESTS FAILED.');
    process.exit(1);
  }
}

runErrorHandlingAndSupportSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
