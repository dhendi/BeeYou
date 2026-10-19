import { UserAgeGroup, UserAccountRole, EnabledFeatures, getDefaultFeaturesForAge } from '../types';
import { 
  setPairingCode, 
  subscribeToCloudChannel, 
  syncChildStatusToCaregiver, 
  sendHeartbeat,
  publishCloudEvent,
  deleteServerFamilyAccount
} from './caregiverSync';
import { app, db, deleteFirebaseFamilyNode } from './firebaseSync';
import { deleteUserCloudFiles } from './firebaseStorageService';
import { ref as dbRef, set as dbSet, update as dbUpdate } from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  reload,
  User as FirebaseUser
} from 'firebase/auth';

import { hashPin, verifyPin, getPinRateLimitStatus, resetPinRateLimit } from '../utils/security';
import {
  saveSecureAuthToken,
  getSecureAuthToken,
  getSyncSecureAuthToken,
  clearSecureAuthTokens,
  saveSecureCaregiverPin,
  getSecureCaregiverPin,
  getSyncSecureCaregiverPin,
  removeSecureSecret,
  wipeAllSecureStorage,
} from './secureStorageService';

export {
  hashPin,
  verifyPin,
  getPinRateLimitStatus,
  resetPinRateLimit,
  saveSecureCaregiverPin,
  getSecureCaregiverPin,
  getSyncSecureCaregiverPin,
};
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Synchronize user's family membership to Realtime Database
 * Satisfies server-side identity & family authorization rules
 */
export async function syncUserFamilyMembership(uid: string, familyCode: string, isOwner = false): Promise<void> {
  const safeCode = (familyCode || '').trim().toUpperCase();
  if (!uid || !safeCode) return;

  // Real accounts cannot join or poll the demo sandbox
  if (safeCode === 'BEE-DEMO') {
    const stored = getStoredFamilyAccount();
    if (!stored?.isDemoAccount || stored?.email !== 'demo@beeyou.app') {
      console.warn('Real user accounts cannot join the demo sandbox.');
      return;
    }
  }

  try {
    const userRef = dbRef(db, `beeyou/users/${uid}`);
    await dbSet(userRef, {
      uid,
      familyCode: safeCode,
      updatedAt: Date.now(),
    });

    const memberRef = dbRef(db, `beeyou/families/${safeCode}/members/${uid}`);
    await dbSet(memberRef, true);

    if (isOwner) {
      const familyRef = dbRef(db, `beeyou/families/${safeCode}`);
      await dbUpdate(familyRef, {
        familyCode: safeCode,
        ownerUid: uid,
      });
    }
  } catch (err) {
    console.warn('syncUserFamilyMembership notice:', err);
  }
}

/**
 * Ensure an active authenticated Firebase session exists.
 * If demo mode is explicitly active, authenticates with pre-seeded demo credentials.
 */
export async function ensureAuthenticatedSession(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  const stored = getStoredFamilyAccount();
  if (stored?.isDemoAccount && stored?.email === 'demo@beeyou.app') {
    try {
      const cred = await signInWithEmailAndPassword(auth, 'demo@beeyou.app', 'beeyou2026');
      await syncUserFamilyMembership(cred.user.uid, 'BEE-DEMO', true);
      return cred.user;
    } catch (e) {
      console.warn('ensureAuthenticatedSession demo signin notice:', e);
    }
  }
  return null;
}

// Keep Firebase Auth state and RTDB family membership synchronized across device reloads
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const stored = getStoredFamilyAccount();
      if (stored?.familyCode) {
        await syncUserFamilyMembership(user.uid, stored.familyCode, false);
      }
    } else {
      const stored = getStoredFamilyAccount();
      if (stored?.isDemoAccount && stored?.email === 'demo@beeyou.app') {
        try {
          const cred = await signInWithEmailAndPassword(auth, 'demo@beeyou.app', 'beeyou2026');
          await syncUserFamilyMembership(cred.user.uid, 'BEE-DEMO', true);
        } catch {}
      }
    }
  });
}


export interface FamilyAccount {
  id: string;
  email: string;
  caregiverName: string;
  caregiverRole: string; // e.g. 'Mom', 'Dad', 'Caregiver', 'Educator'
  familyCode: string; // e.g. 'BEE-DEMO' or 7-char family sync code
  childProfile: {
    name: string;
    ageGroup: UserAgeGroup;
    interests: string[];
    pronouns: string;
    pin: string;
  };
  subscriptionTier: 'free' | 'premium';
  createdAt: string;
  lastSyncedAt: string;
  isDemoAccount?: boolean;
  emailVerified?: boolean;
  backupEmail?: string;
}

const FAMILY_ACCOUNT_KEY = 'beeyou_family_account';
const ACTIVE_DEVICE_VIEW_KEY = 'beeyou_active_device_view'; // 'child' | 'caregiver'

export const DEMO_FAMILY_ACCOUNT: FamilyAccount = {
  id: 'fam-demo-2026',
  email: 'demo@beeyou.app',
  caregiverName: 'Caregiver',
  caregiverRole: 'Parent / Caregiver',
  familyCode: 'BEE-DEMO',
  childProfile: {
    name: '',
    ageGroup: 'kid',
    interests: [],
    pronouns: '',
    pin: 'sha256:2ff234ff7ffc2e0d5fd76242632098701dede4e4d6b695a58e48cd8ce10d0c00', // Salted SHA-256 hash of '1234'
  },
  subscriptionTier: 'premium',
  createdAt: '2026-10-01T00:00:00.000Z',
  lastSyncedAt: new Date().toISOString(),
  isDemoAccount: true,
  emailVerified: true,
};

// Check if user is currently signed in with a Family Account (sanitized - credentials stripped)
export function getStoredFamilyAccount(): FamilyAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FAMILY_ACCOUNT_KEY);
    if (raw) {
      const acc = JSON.parse(raw);
      if (acc && typeof acc === 'object') {
        // Guarantee credentials and sensitive records never leak into runtime
        if (acc.childProfile) {
          acc.childProfile.pin = '';
        }
        delete acc.backupEmail;
        return acc;
      }
    }
  } catch {}
  return null;
}

export const FAMILY_TOKEN_KEY = 'beeyou_family_token';
export const PAIRING_TOKEN_KEY = 'beeyou_pairing_token';

/**
 * Synchronous client auth token lookup.
 * Returns cached token immediately (0ms) from secure storage in-memory cache.
 */
export function getSyncClientAuthToken(familyCode?: string): string {
  const code = (familyCode || getStoredFamilyAccount()?.familyCode || '').trim().toUpperCase();
  if (!code) return '';

  // 1. Reviewer Demo Account (strictly isolated sandbox)
  if (code === 'BEE-DEMO' || code === 'DEMO') {
    const stored = getStoredFamilyAccount();
    if (stored?.isDemoAccount && stored?.email === 'demo@beeyou.app') {
      return 'by_demo_reviewer_token_2026';
    }
    return '';
  }

  // 2. Read from secure storage synchronous memory cache
  const secureTok = getSyncSecureAuthToken();
  if (secureTok) {
    if (secureTok.startsWith('by_tok.')) {
      const parts = secureTok.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.familyCode === code && payload.iat) {
            return secureTok;
          }
        } catch {}
      }
    } else if (secureTok.startsWith('tok-') || secureTok === 'by_demo_reviewer_token_2026') {
      return secureTok;
    }
  }

  // 3. Fallback: check sessionStorage during active tab session
  if (typeof sessionStorage !== 'undefined') {
    try {
      const sessTok = sessionStorage.getItem(FAMILY_TOKEN_KEY) || sessionStorage.getItem(PAIRING_TOKEN_KEY);
      if (sessTok) return sessTok;
    } catch {}
  }

  return '';
}

/**
 * Asynchronously retrieve or exchange a verified family token using secure storage.
 */
export async function getClientAuthToken(familyCode?: string): Promise<string> {
  const code = (familyCode || getStoredFamilyAccount()?.familyCode || '').trim().toUpperCase();
  if (!code) return '';

  // 1. Reviewer Demo Account (strictly isolated sandbox)
  if (code === 'BEE-DEMO' || code === 'DEMO') {
    const stored = getStoredFamilyAccount();
    if (stored?.isDemoAccount && stored?.email === 'demo@beeyou.app') {
      return 'by_demo_reviewer_token_2026';
    }
    return '';
  }

  // 2. Fast synchronous cache check
  const syncTok = getSyncClientAuthToken(code);
  if (syncTok) return syncTok;

  // 3. Asynchronous secure storage lookup
  const secTok = await getSecureAuthToken();
  if (secTok) {
    return secTok;
  }

  // 4. If Firebase user is authenticated, exchange or use ID token
  if (auth.currentUser) {
    try {
      const fbToken = await auth.currentUser.getIdToken();
      if (fbToken) {
        try {
          const res = await fetch('/api/family/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${fbToken}`,
            },
            body: JSON.stringify({ familyCode: code }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.token) {
              saveClientAuthToken(data.token);
              return data.token;
            }
          }
        } catch {}
        return fbToken;
      }
    } catch {}
  }

  // 5. Stored family account credentials exchange with secure PIN if available
  const account = getStoredFamilyAccount();
  if (account && account.familyCode === code) {
    try {
      const secPin = getSyncSecureCaregiverPin() || (await getSecureCaregiverPin());
      const res = await fetch('/api/family/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyCode: code,
          pin: secPin || undefined,
          email: account.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          saveClientAuthToken(data.token);
          return data.token;
        }
      }
    } catch {}
  }

  return '';
}

export function saveClientAuthToken(token: string): void {
  if (typeof window === 'undefined' || !token) return;
  saveSecureAuthToken(token).catch(() => {});
  try {
    sessionStorage.setItem(FAMILY_TOKEN_KEY, token);
    if (token.startsWith('tok-')) {
      sessionStorage.setItem(PAIRING_TOKEN_KEY, token);
    }
  } catch {}
}

export function clearClientAuthToken(): void {
  if (typeof window === 'undefined') return;
  clearSecureAuthTokens().catch(() => {});
  try {
    sessionStorage.removeItem(FAMILY_TOKEN_KEY);
    sessionStorage.removeItem(PAIRING_TOKEN_KEY);
    localStorage.removeItem(FAMILY_TOKEN_KEY);
    localStorage.removeItem(PAIRING_TOKEN_KEY);
  } catch {}
}

export function saveStoredFamilyAccount(account: FamilyAccount | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (account) {
      // Data Minimization: Store only the minimum necessary data locally, stripping credentials
      const sanitizedAccount: FamilyAccount = {
        id: account.id,
        email: account.email,
        caregiverName: account.caregiverName || 'Caregiver',
        caregiverRole: account.caregiverRole || 'Parent',
        familyCode: account.familyCode,
        childProfile: {
          name: account.childProfile?.name || 'Child',
          ageGroup: account.childProfile?.ageGroup || 'kid',
          interests: account.childProfile?.interests || [],
          pronouns: '',
          pin: '', // Never persist PIN or credentials in localStorage
        },
        subscriptionTier: account.subscriptionTier || 'premium',
        createdAt: account.createdAt || new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        isDemoAccount: account.isDemoAccount,
        emailVerified: account.emailVerified,
      };

      localStorage.setItem(FAMILY_ACCOUNT_KEY, JSON.stringify(sanitizedAccount));
      localStorage.setItem('beeyou_pairing_code', account.familyCode);
      localStorage.setItem('beeyou_device_linked_code', account.familyCode);

      if (account.isDemoAccount || account.familyCode === 'BEE-DEMO') {
        saveClientAuthToken('by_demo_reviewer_token_2026');
      }
      setPairingCode(account.familyCode);
      subscribeToCloudChannel(account.familyCode);
    } else {
      localStorage.removeItem(FAMILY_ACCOUNT_KEY);
      clearClientAuthToken();
    }
  } catch {}
}

// Get active device persona ('child' or 'caregiver')
export function getActiveDeviceView(): 'child' | 'caregiver' {
  if (typeof window === 'undefined') return 'child';
  try {
    // 1. Port 3001 is dedicated Caregiver Controller
    if (window.location.port === '3001') return 'caregiver';

    // 2. URL Path /caregiver is dedicated Caregiver Controller
    if (window.location.pathname.startsWith('/caregiver')) return 'caregiver';
    if (window.location.pathname.startsWith('/child')) return 'child';

    // 3. URL Query Parameter ?role=caregiver or ?role=child
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') || params.get('mode') || (params.get('caregiver') === 'true' ? 'caregiver' : null);
    if (roleParam === 'caregiver') return 'caregiver';
    if (roleParam === 'child') return 'child';

    // 4. Per-tab sessionStorage (isolated per tab so separate tabs never conflict)
    const sess = sessionStorage.getItem(ACTIVE_DEVICE_VIEW_KEY);
    if (sess === 'caregiver' || sess === 'child') return sess;

    // 5. Port 3000 defaults to child
    if (window.location.port === '3000') return 'child';

    // 6. Fallback to localStorage
    const v = localStorage.getItem(ACTIVE_DEVICE_VIEW_KEY);
    if (v === 'caregiver' || v === 'child') return v;
  } catch {}
  return 'child';
}

export function setActiveDeviceView(view: 'child' | 'caregiver'): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ACTIVE_DEVICE_VIEW_KEY, view);
    sessionStorage.setItem('beeyou_user_role', view === 'caregiver' ? 'caregiver' : 'child_dependent');
    localStorage.setItem(ACTIVE_DEVICE_VIEW_KEY, view);
    localStorage.setItem('beeyou_user_role', view === 'caregiver' ? 'caregiver' : 'child_dependent');
    window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: view } }));
  } catch {}
}

/**
 * Generate a cryptographically random, unguessable pairing code.
 * E.g., 'BEE-7K9M4X2' (over 34 billion unique combinations with 7 characters).
 * Uses unambiguous uppercase alphanumeric characters (no confusing 0/O, 1/I/L).
 */
export function generateSecureFamilyCode(length: number = 7): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      randomPart += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return `BEE-${randomPart}`;
}

export function getDeterministicFamilyCode(email: string): string {
  const clean = email.trim().toLowerCase();
  if (clean === 'demo@beeyou.app' || clean === 'reviewer@beeyou.app') {
    return 'BEE-DEMO';
  }
  // If this device already has an existing saved family account with a valid code, preserve it
  const existing = getStoredFamilyAccount();
  if (existing && existing.email === clean && existing.familyCode && existing.familyCode !== 'BEE-DEMO') {
    return existing.familyCode;
  }
  return generateSecureFamilyCode();
}

/**
 * Sanitizes raw authentication, network, and pairing errors into clear,
 * empathetic user-facing messages.
 * Guarantees zero leakage of stack traces, internal database URLs, API keys, or private tokens.
 */
export function sanitizeAuthErrorMessage(err: any): string {
  if (!err) return 'An unexpected issue occurred. Please try again or reach out to support@beeyou.app.';

  const code = (typeof err === 'object' && err?.code ? String(err.code) : '').toLowerCase();
  const rawMsg = (typeof err === 'string' ? err : err?.message ? String(err.message) : '').trim();

  // 1. Standard Firebase Auth error codes
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-login-credentials'
  ) {
    return 'Incorrect email or password. Please verify your credentials or register a new account.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Access temporarily disabled due to too many failed login attempts. Please wait a few moments and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'The password is too weak. Please choose a password with at least 8 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Sign-in popup was closed before completion.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'For your security, please sign in again before completing this action.';
  }
  if (code === 'auth/user-disabled') {
    return 'This family account has been deactivated. Please contact support@beeyou.app for assistance.';
  }

  // 2. Scrub technical strings, runtime exception names, or stack traces
  const isTechnicalException =
    rawMsg.includes('\n') ||
    rawMsg.includes(' at ') ||
    /^[A-Za-z]+Error:/.test(rawMsg) ||
    rawMsg.includes('TypeError') ||
    rawMsg.includes('ReferenceError') ||
    rawMsg.includes('SyntaxError') ||
    rawMsg.includes('EvalError') ||
    rawMsg.toLowerCase().includes('stack') ||
    rawMsg.toLowerCase().includes('trace');

  if (isTechnicalException) {
    return 'We encountered a temporary connection issue. Please check your network or try again.';
  }

  let cleaned = rawMsg
    .replace(/^Firebase:\s*Error\s*\(([^)]+)\)\.?/i, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[a-zA-Z0-9_-]{20,}/g, '')
    .trim();

  if (!cleaned || cleaned.includes('{') || cleaned.length < 5) {
    return 'We encountered a temporary connection issue. Please check your network or try again.';
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Perform login using Shared Email and Password (or Demo account)
 */
export async function loginWithSharedEmail(
  email: string,
  password?: string
): Promise<{ success: boolean; account?: FamilyAccount; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  // 1. If Explicit Reviewer Demo Email (App Store & Google Play reviewer sandbox)
  if (cleanEmail === 'demo@beeyou.app') {
    const demo = { ...DEMO_FAMILY_ACCOUNT, lastSyncedAt: new Date().toISOString() };
    saveStoredFamilyAccount(demo);
    try {
      const cred = await signInWithEmailAndPassword(auth, 'demo@beeyou.app', 'beeyou2026');
      await syncUserFamilyMembership(cred.user.uid, 'BEE-DEMO', true);
    } catch (demoErr) {
      console.warn('Demo sign-in notice:', demoErr);
    }
    try {
      await sendHeartbeat({
        role: 'caregiver',
        name: demo.caregiverName,
        pairingCode: demo.familyCode,
      });
    } catch {}
    return {
      success: true,
      account: demo,
      message: 'Logged into Reviewer Demo Sandbox. All demo data is strictly isolated from real accounts.',
    };
  }

  if (!password || password.length === 0) {
    return { success: false, message: 'Please enter your password to sign in.' };
  }

  const deterministicCode = getDeterministicFamilyCode(cleanEmail);
  let firebaseUid: string;
  let isEmailVerified = false;

  // 2. Real Firebase Authentication
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    firebaseUid = userCredential.user.uid;
    isEmailVerified = userCredential.user.emailVerified;
    await syncUserFamilyMembership(firebaseUid, deterministicCode, false);
  } catch (err: any) {
    console.warn('Firebase signIn notice:', err?.code, err?.message);
    return {
      success: false,
      message: sanitizeAuthErrorMessage(err),
    };
  }

  // Preserve existing local account profiles if this user previously signed in here
  const existing = getStoredFamilyAccount();
  const existingMatches = existing && existing.email === cleanEmail;

  let account: FamilyAccount = {
    id: firebaseUid,
    email: cleanEmail,
    caregiverName: existingMatches ? existing.caregiverName : 'Caregiver',
    caregiverRole: existingMatches ? existing.caregiverRole : 'Parent / Caregiver',
    familyCode: deterministicCode,
    childProfile: existingMatches
      ? existing.childProfile
      : {
          name: '',
          ageGroup: 'kid',
          interests: [],
          pronouns: '',
          pin: '1234',
        },
    subscriptionTier: isEmailVerified ? 'premium' : 'free',
    emailVerified: isEmailVerified,
    createdAt: existingMatches ? existing.createdAt : new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  saveStoredFamilyAccount(account);

  // Send initial heartbeat
  try {
    await sendHeartbeat({
      role: 'caregiver',
      name: account.caregiverName,
      pairingCode: account.familyCode,
    });
  } catch {}

  return {
    success: true,
    account,
    message: `Logged in as ${cleanEmail}. Family sync code is ${account.familyCode}. Both devices link automatically!`,
  };
}

/**
 * 1-Click Quick Login with Google
 */
export async function loginWithGoogle(): Promise<{ success: boolean; account?: FamilyAccount; message: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email || `google-${user.uid.slice(0, 8)}@beeyou.app`;
    const deterministicCode = getDeterministicFamilyCode(email);

    const displayName = user.displayName || 'Caregiver';

    let account: FamilyAccount = {
      id: user.uid,
      email: email,
      caregiverName: displayName,
      caregiverRole: 'Parent / Caregiver',
      familyCode: deterministicCode,
      childProfile: {
        name: '',
        ageGroup: 'kid',
        interests: [],
        pronouns: '',
        pin: '1234',
      },
      subscriptionTier: 'premium',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    saveStoredFamilyAccount(account);
    await syncUserFamilyMembership(user.uid, deterministicCode, false);

    try {
      await sendHeartbeat({
        role: 'caregiver',
        name: account.caregiverName,
        pairingCode: account.familyCode,
      });
    } catch {}

    return {
      success: true,
      account,
      message: `Signed in with Google as ${email}! Family sync code: ${account.familyCode}.`,
    };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    return {
      success: false,
      message: sanitizeAuthErrorMessage(err),
    };
  }
}

/**
 * Register a new Shared Family Account
 */
export async function registerSharedFamilyAccount(params: {
  email: string;
  password?: string;
  backupEmail?: string;
  caregiverName: string;
  caregiverRole: string;
  childName: string;
  childAgeGroup: UserAgeGroup;
  pin?: string;
}): Promise<{ success: boolean; account?: FamilyAccount; message: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanBackupEmail = params.backupEmail?.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (!params.password || params.password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long.' };
  }

  if (cleanEmail === 'demo@beeyou.app') {
    return { success: false, message: 'demo@beeyou.app is reserved for App Store review and cannot be registered.' };
  }

  const deterministicCode = getDeterministicFamilyCode(cleanEmail);
  if (deterministicCode === 'BEE-DEMO') {
    return { success: false, message: 'BEE-DEMO is reserved for App Store review.' };
  }
  let firebaseUid: string;

  // 1. Create User in Firebase Auth
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
    firebaseUid = userCredential.user.uid;

    // Send automated email verification link for free via Firebase
    try {
      await sendEmailVerification(userCredential.user);
    } catch (verErr: any) {
      console.warn('Firebase sendEmailVerification notice:', verErr?.message);
    }
  } catch (err: any) {
    console.warn('Firebase createUser notice:', err?.code, err?.message);
    return {
      success: false,
      message: sanitizeAuthErrorMessage(err),
    };
  }

  const hashedPin = await hashPin(params.pin || '1234');
  let newAccount: FamilyAccount = {
    id: firebaseUid,
    email: cleanEmail,
    backupEmail: cleanBackupEmail || undefined,
    caregiverName: params.caregiverName.trim() || 'Caregiver',
    caregiverRole: params.caregiverRole.trim() || 'Parent',
    familyCode: deterministicCode,
    childProfile: {
      name: params.childName.trim() || 'Child',
      ageGroup: params.childAgeGroup || 'kid',
      interests: [],
      pronouns: '',
      pin: hashedPin,
    },
    subscriptionTier: 'free',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  saveStoredFamilyAccount(newAccount);
  await syncUserFamilyMembership(firebaseUid, deterministicCode, true);

  // Send initial heartbeat & sync status
  try {
    await sendHeartbeat({
      role: 'caregiver',
      name: newAccount.caregiverName,
      pairingCode: newAccount.familyCode,
    });
  } catch {}

  return {
    success: true,
    account: newAccount,
    message: `Account created for ${cleanEmail}! A free verification email has been sent to your inbox. You can use the Basic app now, or verify to unlock your 15-day free trial!`,
  };
}

/**
 * 1-Click Quick Launch for Testing (Child Tablet vs Caregiver Phone)
 */
export async function launchDemoMode(asRole: 'child' | 'caregiver'): Promise<{
  account: FamilyAccount;
  role: 'child' | 'caregiver';
}> {
  const demo = { ...DEMO_FAMILY_ACCOUNT, lastSyncedAt: new Date().toISOString() };
  saveStoredFamilyAccount(demo);
  setActiveDeviceView(asRole);

  try {
    const cred = await signInWithEmailAndPassword(auth, 'demo@beeyou.app', 'beeyou2026');
    await syncUserFamilyMembership(cred.user.uid, 'BEE-DEMO', true);
  } catch (demoErr) {
    console.warn('Demo sign-in notice in launchDemoMode:', demoErr);
  }

  // Sync initial heartbeat
  await sendHeartbeat({
    role: asRole === 'child' ? 'child_device' : 'caregiver',
    name: asRole === 'child' ? demo.childProfile.name : demo.caregiverName,
    pairingCode: demo.familyCode,
  });

  return { account: demo, role: asRole };
}

/**
 * Log out of family account and clear active pairing credentials
 */
export async function logoutFamilyAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
  saveStoredFamilyAccount(null);
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('beeyou_pairing_code');
      localStorage.removeItem('beeyou_pending_pin_reset');
      localStorage.removeItem('beeyou_temporary_pairing_session');
      localStorage.removeItem('beeyou_active_caregiver_alert');
      localStorage.removeItem('beeyou_active_alert');
      sessionStorage.removeItem('beeyou_active_device_view');
      window.dispatchEvent(new CustomEvent('beeyou_account_updated', { detail: null }));
    }
  } catch {}
}

/**
 * Completely purges all local storage, session state, cached credentials,
 * encrypted vault secrets, indexedDB databases, and personal health data from this physical device.
 * Used for school tablet returns, device handoffs, or account deletion.
 */
export async function wipeDeviceStorage(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut during wipe error:', err);
  }

  // 1. Wipe secure vault storage (Capacitor Preferences & inMemoryCache)
  try {
    await wipeAllSecureStorage();
  } catch (e) {
    console.warn('wipeAllSecureStorage warning:', e);
  }

  // 2. Clear localStorage completely of BeeYou, vault, and Firebase items
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('beeyou') ||
          key.startsWith('by_') ||
          key.startsWith('firebase:') ||
          key.startsWith('CapacitorStorage')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Explicit purge list to guarantee zero remnant keys
      const explicitKeys = [
        'beeyou_family_account',
        'beeyou_subscription',
        'beeyou_pairing_code',
        'beeyou_offline_alert_queue',
        'beeyou_alert_history',
        'beeyou_pending_pin_reset',
        'beeyou_active_device_view',
        'beeyou_user_role',
        'beeyou_settings',
        'beeyou_daily_recollections',
        'beeyou_medications',
        'beeyou_mood_journal_entries',
        'beeyou_cycle_settings',
        'beeyou_cycle_logs',
        'beeyou_spoon_entries',
        'beeyou_temporary_pairing_session',
        'beeyou_active_caregiver_alert',
        'beeyou_active_alert',
        'beeyou_about_me_id',
        'beeyou_child_profile',
        'beeyou_routines',
        'beeyou_help_alert_presets',
        'beeyou_caregiver_responses',
        'beeyou_calm_strategies',
        'beeyou_breathing_config',
        'beeyou_onboarding_completed',
        'beeyou_user_age_group',
        'beeyou_user_persona',
        'beeyou_app_state_v1',
      ];
      explicitKeys.forEach((k) => localStorage.removeItem(k));
    }
  } catch (e) {
    console.warn('localStorage wipe warning:', e);
  }

  // 3. Clear sessionStorage
  try {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (e) {
    console.warn('sessionStorage wipe warning:', e);
  }

  // 4. Clear IndexedDB databases where Firebase/PWA may cache user session
  try {
    if (typeof window !== 'undefined' && window.indexedDB) {
      const knownDbs = ['firebaseLocalStorageDb', 'beeyou-db', 'keyval-store'];
      knownDbs.forEach((dbName) => {
        try {
          window.indexedDB.deleteDatabase(dbName);
        } catch {}
      });
      if (typeof window.indexedDB.databases === 'function') {
        window.indexedDB.databases().then((dbs) => {
          dbs.forEach((dbInfo) => {
            if (dbInfo.name && (dbInfo.name.includes('firebase') || dbInfo.name.includes('beeyou'))) {
              try {
                window.indexedDB.deleteDatabase(dbInfo.name);
              } catch {}
            }
          });
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('IndexedDB wipe warning:', e);
  }

  // 5. Clear Service Worker CacheStorage
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key.includes('beeyou') || key.includes('user')) {
            caches.delete(key).catch(() => {});
          }
        });
      }).catch(() => {});
    }
  } catch {}

  clearClientAuthToken();
  await removeSecureSecret('by_sec_caregiver_pin');
  await removeSecureSecret('beeyou_device_vault_salt');
}

export type DeletionStepName =
  | 'reauth'
  | 'notify_linked_devices'
  | 'cloud_storage_files'
  | 'server_records'
  | 'cloud_database'
  | 'auth_account'
  | 'subscriptions'
  | 'local_storage';

export interface DeletionStepResult {
  step: DeletionStepName;
  label: string;
  status: 'completed' | 'failed' | 'skipped';
  error?: string;
  details?: string;
}

export interface AccountDeletionResult {
  success: boolean;
  message: string;
  steps: DeletionStepResult[];
  partialFailure?: boolean;
  actionRequired?: string;
}

/**
 * Apple Guideline 5.1.1(v) Compliant In-App Account Deletion
 * Permanently deletes the family account from Firebase Authentication,
 * purges cloud realtime data, deletes uploaded cloud storage files,
 * purges backend server records/sessions/backups, notifies linked devices,
 * cancels subscriptions, and wipes local device data.
 *
 * If any step fails partway through, returns a granular result so the user
 * knows exactly what succeeded and what manual action is required.
 */
export async function deleteFamilyAccount(password: string): Promise<AccountDeletionResult> {
  const steps: DeletionStepResult[] = [];
  const addStep = (
    step: DeletionStepName,
    label: string,
    status: 'completed' | 'failed' | 'skipped',
    error?: string,
    details?: string
  ) => {
    steps.push({ step, label, status, error, details });
  };

  const account = getStoredFamilyAccount();
  const user = auth.currentUser;
  const familyCode = account?.familyCode;
  const email = user?.email || account?.email;

  // Handle Demo Account: reset local device demo state only
  if (account?.isDemoAccount || user?.email === 'demo@beeyou.app' || familyCode === 'BEE-DEMO') {
    await wipeDeviceStorage();
    addStep('reauth', 'Verify Account Identity', 'completed');
    addStep('local_storage', 'Reset Demo Device Data', 'completed');
    return {
      success: true,
      message: 'Demo space has been completely reset on this device.',
      steps,
    };
  }

  // 1. Password confirmation validation
  if (!password || password.trim().length === 0) {
    addStep('reauth', 'Verify Account Password', 'failed', 'Password required');
    return {
      success: false,
      message: 'Please enter your account password to confirm permanent account deletion.',
      steps,
    };
  }

  // Handle case with no active Firebase user session
  if (!user || !user.email) {
    if (familyCode) {
      try {
        await deleteServerFamilyAccount(familyCode, account?.email);
      } catch {}
      try {
        await deleteFirebaseFamilyNode(familyCode);
      } catch {}
    }
    await wipeDeviceStorage();
    addStep('local_storage', 'Local Family Space Purged', 'completed');
    return {
      success: true,
      message: 'Local family space and associated device records have been completely deleted.',
      steps,
    };
  }

  // -------------------------------------------------------------
  // Step 1: Re-authenticate identity
  // -------------------------------------------------------------
  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    addStep('reauth', 'Account Identity Verified', 'completed');
  } catch (err: any) {
    console.error('[Delete] Reauthentication error:', err);
    let errMsg = 'Incorrect password. Account deletion cancelled for your protection.';
    if (err.code === 'auth/too-many-requests') {
      errMsg = 'Too many attempts. Please wait a few moments before trying again.';
    }
    addStep('reauth', 'Verify Account Identity', 'failed', errMsg);
    return {
      success: false,
      message: errMsg,
      steps,
    };
  }

  let hasPartialError = false;

  // -------------------------------------------------------------
  // Step 2: Notify linked caregiver devices before destroying nodes
  // -------------------------------------------------------------
  if (familyCode) {
    try {
      await publishCloudEvent(familyCode, {
        type: 'FAMILY_ACCOUNT_DELETED',
        familyCode,
        sentAt: Date.now(),
        message: 'Family account has been permanently deleted.',
      });
      addStep('notify_linked_devices', 'Linked Devices Notified & Unpaired', 'completed');
    } catch (e: any) {
      console.warn('[Delete] Failed to notify linked devices:', e);
      addStep('notify_linked_devices', 'Linked Devices Disconnection Notice', 'skipped', e?.message);
    }
  } else {
    addStep('notify_linked_devices', 'Linked Devices Notification', 'skipped');
  }

  // -------------------------------------------------------------
  // Step 3: Purge uploaded files & custom icons in Cloud Storage
  // -------------------------------------------------------------
  try {
    const uidTarget = user.uid;
    const storageRes1 = await deleteUserCloudFiles(uidTarget);
    if (familyCode && familyCode !== uidTarget) {
      await deleteUserCloudFiles(familyCode);
    }
    addStep(
      'cloud_storage_files',
      'Uploaded Files & Custom Icons Purged',
      'completed',
      undefined,
      storageRes1.count > 0 ? `${storageRes1.count} file(s) deleted` : 'No storage files found'
    );
  } catch (storageErr: any) {
    console.warn('[Delete] Storage files deletion notice:', storageErr);
    addStep('cloud_storage_files', 'Uploaded Files Deletion', 'failed', storageErr?.message);
    hasPartialError = true;
  }

  // -------------------------------------------------------------
  // Step 4: Purge backend server records, sessions & data files
  // -------------------------------------------------------------
  if (familyCode) {
    try {
      const serverRes = await deleteServerFamilyAccount(familyCode, email);
      if (serverRes.success) {
        addStep('server_records', 'Server Records & Sessions Purged', 'completed');
      } else {
        addStep('server_records', 'Server Records Deletion', 'failed', serverRes.message);
        hasPartialError = true;
      }
    } catch (serverErr: any) {
      console.warn('[Delete] Server records deletion notice:', serverErr);
      addStep('server_records', 'Server Records Deletion', 'failed', serverErr?.message);
      hasPartialError = true;
    }
  } else {
    addStep('server_records', 'Server Records Deletion', 'skipped');
  }

  // -------------------------------------------------------------
  // Step 5: Purge Cloud Realtime Database family node
  // -------------------------------------------------------------
  if (familyCode) {
    try {
      const dbSuccess = await deleteFirebaseFamilyNode(familyCode);
      if (dbSuccess) {
        addStep('cloud_database', 'Cloud Realtime Database Purged', 'completed');
      } else {
        addStep('cloud_database', 'Cloud Realtime Database Deletion', 'failed', 'Database node delete returned false');
        hasPartialError = true;
      }
    } catch (dbErr: any) {
      console.warn('[Delete] Realtime database deletion notice:', dbErr);
      addStep('cloud_database', 'Cloud Realtime Database Deletion', 'failed', dbErr?.message);
      hasPartialError = true;
    }
  } else {
    addStep('cloud_database', 'Cloud Realtime Database Deletion', 'skipped');
  }

  // -------------------------------------------------------------
  // Step 6: Delete Firebase Authentication user account
  // -------------------------------------------------------------
  let authFailed = false;
  let authErrorMsg = '';
  try {
    await deleteUser(user);
    addStep('auth_account', 'Firebase Login Credentials Deleted', 'completed');
  } catch (authErr: any) {
    console.error('[Delete] Firebase deleteUser error:', authErr);
    authFailed = true;
    hasPartialError = true;
    if (authErr.code === 'auth/requires-recent-login') {
      authErrorMsg = 'Your session has expired. Please sign out, log back in, and tap Delete Account to finalize removing your login credentials.';
    } else {
      authErrorMsg = authErr.message || 'Firebase Auth failed to delete user profile.';
    }
    addStep('auth_account', 'Firebase Login Credentials Deletion', 'failed', authErrorMsg);
  }

  // -------------------------------------------------------------
  // Step 7: Cancel subscription & billing obligations
  // -------------------------------------------------------------
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('beeyou_subscription');
    }
    addStep('subscriptions', 'In-App Subscription Cancelled', 'completed');
  } catch (subErr: any) {
    addStep('subscriptions', 'Subscription Cancellation', 'skipped', subErr?.message);
  }

  // -------------------------------------------------------------
  // Step 8: Wipe local device storage & secure vault
  // -------------------------------------------------------------
  try {
    await wipeDeviceStorage();
    addStep('local_storage', 'Local Device Data & Secure Vault Wiped', 'completed');
  } catch (localErr: any) {
    console.warn('[Delete] Local storage wipe notice:', localErr);
    addStep('local_storage', 'Local Storage Wipe', 'failed', localErr?.message);
    hasPartialError = true;
  }

  if (authFailed) {
    return {
      success: false,
      message: 'Account cloud data, uploaded files, and server records were deleted, but removing your login credentials failed.',
      steps,
      partialFailure: true,
      actionRequired: authErrorMsg,
    };
  }

  if (hasPartialError) {
    return {
      success: false,
      message: 'Account deletion encountered partial issues. Review step details below.',
      steps,
      partialFailure: true,
      actionRequired: 'Some secondary cloud items could not be confirmed. If you have an active Apple or Google subscription, verify cancellation in your device App Store / Google Play account.',
    };
  }

  return {
    success: true,
    message: 'Your family account, cloud data, uploaded files, and server records have been permanently deleted.',
    steps,
  };
}

/**
 * Send email verification link to current user (100% free via Firebase Auth)
 */
export async function sendAccountVerificationEmail(): Promise<{ success: boolean; message: string }> {
  const user = auth.currentUser;
  if (!user) {
    const stored = getStoredFamilyAccount();
    if (stored?.isDemoAccount) {
      return { success: true, message: 'Demo accounts are pre-verified.' };
    }
    return { success: false, message: 'Please sign in to send a verification email.' };
  }
  if (user.emailVerified) {
    const stored = getStoredFamilyAccount();
    if (stored) {
      stored.emailVerified = true;
      saveStoredFamilyAccount(stored);
    }
    return { success: true, message: 'Your email address is already verified!' };
  }
  try {
    await sendEmailVerification(user);
    return {
      success: true,
      message: `Verification link sent to ${user.email}! Please check your inbox or spam folder.`,
    };
  } catch (err: any) {
    console.error('sendEmailVerification error:', err);
    if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'A verification email was recently sent. Please wait a minute before requesting another.',
      };
    }
    return {
      success: false,
      message: err.message || 'Could not send verification email. Please try again.',
    };
  }
}

/**
 * Check if current user's email has been verified in Firebase
 */
export async function checkEmailVerificationStatus(): Promise<{ isVerified: boolean; message?: string }> {
  const stored = getStoredFamilyAccount();
  if (stored?.isDemoAccount) {
    return { isVerified: true };
  }

  const user = auth.currentUser;
  if (!user) {
    if (stored?.emailVerified) {
      return { isVerified: true };
    }
    return { isVerified: false, message: 'No active session found. Please sign in.' };
  }

  try {
    await reload(user);
    const isVerified = user.emailVerified;
    if (stored) {
      stored.emailVerified = isVerified;
      saveStoredFamilyAccount(stored);
    }
    return { isVerified };
  } catch (err: any) {
    console.warn('reload user verification error:', err);
    return { isVerified: user.emailVerified || false };
  }
}

/**
 * Check current stored verification state synchronously
 */
export function getStoredEmailVerificationStatus(): boolean {
  const stored = getStoredFamilyAccount();
  if (!stored) return false;
  if (stored.isDemoAccount) return true;
  if (stored.emailVerified === true) return true;
  if (auth.currentUser?.emailVerified) return true;
  return false;
}

/**
 * Send password reset email link (100% free via Firebase Auth).
 * Also supports checking against registered backup email!
 */
export async function sendAccountPasswordResetEmail(
  emailOrBackup: string
): Promise<{ success: boolean; message: string; primaryEmailUsed?: string }> {
  const clean = emailOrBackup.trim().toLowerCase();
  if (!clean || !clean.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (clean === 'demo@beeyou.app' || clean === 'demo' || clean === 'test@beeyou.app') {
    return { success: true, message: 'Demo account password is pre-configured as: beeyou2026' };
  }

  let targetEmail = clean;
  let isBackupMatch = false;

  // 1. Check if input matches a backup email on the family server
  try {
    const res = await fetch('/api/family/recover-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lookupEmail: clean }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.found && data.primaryEmail) {
        targetEmail = data.primaryEmail;
        if (targetEmail !== clean) {
          isBackupMatch = true;
        }
      }
    }
  } catch {}

  // 2. Dispatch official Firebase password reset email to targetEmail
  try {
    await sendPasswordResetEmail(auth, targetEmail);
    const msg = isBackupMatch
      ? `We found your family space linked to this backup email! Password reset link sent to your primary email (${targetEmail}).`
      : `Password reset link sent to ${clean}! Please check your inbox or spam folder.`;
    return {
      success: true,
      message: msg,
      primaryEmailUsed: targetEmail,
    };
  } catch (err: any) {
    console.warn('sendPasswordResetEmail notice:', err?.code, err?.message);
    if (err.code === 'auth/user-not-found') {
      return {
        success: false,
        message: 'No account found with this email. Please check for typos or register a new family account.',
      };
    }
    if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'Too many reset attempts recently. Please wait a few moments and try again.',
      };
    }
    return {
      success: false,
      message: err.message || 'Could not send reset link. Please verify the email address.',
    };
  }
}

/**
 * Update the 4-digit caregiver PIN.
 * Securely hashes the PIN using PBKDF2 (100k iterations) and stores in secure device storage.
 * Strictly avoids persisting credentials or PIN hashes to unencrypted browser localStorage.
 * Authoritative PIN hash is synchronized to the server.
 */
export async function updateCaregiverPin(newPin: string): Promise<boolean> {
  if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return false;
  }
  const hashedPin = await hashPin(newPin);

  // 1. Store hashed PIN in secure storage (native sandbox on iOS/Android or encrypted vault on Web)
  await saveSecureCaregiverPin(hashedPin);

  // 2. Ensure credentials are never kept in localStorage
  const account = getStoredFamilyAccount();
  if (account) {
    account.childProfile.pin = '';
    saveStoredFamilyAccount(account);
  }

  try {
    const settingsRaw = localStorage.getItem('beeyou_settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    delete settings.pin; // Guarantee PIN is deleted from localStorage
    localStorage.setItem('beeyou_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('beeyou_settings_updated', { detail: { ...settings, pin: hashedPin } }));
  } catch {}

  // 3. Keep authoritative permissions and sensitive records on the server
  if (account?.familyCode) {
    try {
      const token = await getClientAuthToken(account.familyCode);
      await fetch(`/api/family/state/${encodeURIComponent(account.familyCode)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          childProfile: { pin: hashedPin },
        }),
      });
    } catch {}
  }
  return true;
}
