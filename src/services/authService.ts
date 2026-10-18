import { UserAgeGroup, UserAccountRole, EnabledFeatures, getDefaultFeaturesForAge } from '../types';
import { setPairingCode, subscribeToCloudChannel, syncChildStatusToCaregiver, sendHeartbeat } from './caregiverSync';
import { app, deleteFirebaseFamilyNode } from './firebaseSync';
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

import { hashPin, verifyPin } from '../utils/security';

export { hashPin, verifyPin };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


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
    pin: '1234',
  },
  subscriptionTier: 'premium',
  createdAt: '2026-10-01T00:00:00.000Z',
  lastSyncedAt: new Date().toISOString(),
  isDemoAccount: true,
  emailVerified: true,
};

// Check if user is currently signed in with a Family Account
export function getStoredFamilyAccount(): FamilyAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FAMILY_ACCOUNT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveStoredFamilyAccount(account: FamilyAccount | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (account) {
      localStorage.setItem(FAMILY_ACCOUNT_KEY, JSON.stringify(account));
      localStorage.setItem('beeyou_pairing_code', account.familyCode);
      localStorage.setItem('beeyou_device_linked_code', account.familyCode);
      setPairingCode(account.familyCode);
      subscribeToCloudChannel(account.familyCode);
    } else {
      localStorage.removeItem(FAMILY_ACCOUNT_KEY);
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
  if (clean === 'demo@beeyou.app' || clean === 'demo' || clean === 'test@beeyou.app') {
    return 'BEE-DEMO';
  }
  // If this device already has an existing saved family account with a code, preserve it
  const existing = getStoredFamilyAccount();
  if (existing && existing.email === clean && existing.familyCode) {
    return existing.familyCode;
  }
  return generateSecureFamilyCode();
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

  // 1. If Demo Email
  if (cleanEmail === 'demo@beeyou.app' || cleanEmail === 'demo' || cleanEmail === 'test@beeyou.app') {
    const demo = { ...DEMO_FAMILY_ACCOUNT, lastSyncedAt: new Date().toISOString() };
    saveStoredFamilyAccount(demo);
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
      message: 'Logged into Demo Family Account! Both devices are now linked to "BEE-DEMO".',
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
  } catch (err: any) {
    console.warn('Firebase signIn notice:', err?.code, err?.message);
    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      return {
        success: false,
        message: 'Incorrect email or password. Please verify your credentials or register a new account.',
      };
    }
    if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'Access temporarily disabled due to too many failed login attempts. Please wait a few moments and try again.',
      };
    }
    if (err.code === 'auth/network-request-failed') {
      return {
        success: false,
        message: 'Network connection error. Please check your internet connection and try again.',
      };
    }
    return {
      success: false,
      message: err.message || 'Login failed. Please verify your credentials.',
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
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'Google sign-in popup was closed.' };
    }
    if (err.code === 'auth/cancelled-popup-request') {
      return { success: false, message: 'Google sign-in cancelled.' };
    }
    return {
      success: false,
      message: err?.message || 'Google sign-in failed. Please verify popup settings or try email.',
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

  const deterministicCode = getDeterministicFamilyCode(cleanEmail);
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
    if (err.code === 'auth/email-already-in-use') {
      return {
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      };
    }
    if (err.code === 'auth/weak-password') {
      return {
        success: false,
        message: 'The password is too weak. Please choose a password with at least 8 characters.',
      };
    }
    if (err.code === 'auth/network-request-failed') {
      return {
        success: false,
        message: 'Network connection error. Please check your internet connection and try again.',
      };
    }
    return {
      success: false,
      message: err.message || 'Account registration failed. Please try again.',
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
 * and personal health data from this physical device.
 * Used for school tablet returns, device handoffs, or fresh starts.
 */
export async function wipeDeviceStorage(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut during wipe error:', err);
  }

  try {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('beeyou') || key.startsWith('firebase:'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Clear specific known items
      localStorage.removeItem('beeyou_family_account');
      localStorage.removeItem('beeyou_pairing_code');
      localStorage.removeItem('beeyou_pending_pin_reset');
      localStorage.removeItem('beeyou_active_device_view');
      localStorage.removeItem('beeyou_user_role');
      localStorage.removeItem('beeyou_settings');
      localStorage.removeItem('beeyou_daily_recollections');
      localStorage.removeItem('beeyou_medications');
      localStorage.removeItem('beeyou_mood_journal_entries');
      localStorage.removeItem('beeyou_cycle_settings');
      localStorage.removeItem('beeyou_cycle_logs');
      localStorage.removeItem('beeyou_spoon_entries');
      localStorage.removeItem('beeyou_temporary_pairing_session');
      localStorage.removeItem('beeyou_active_caregiver_alert');
      localStorage.removeItem('beeyou_active_alert');
      localStorage.removeItem('beeyou_about_me_id');
      localStorage.removeItem('beeyou_child_profile');
      localStorage.removeItem('beeyou_routines');
      localStorage.removeItem('beeyou_help_alert_presets');
      localStorage.removeItem('beeyou_caregiver_responses');
      localStorage.removeItem('beeyou_calm_strategies');
      localStorage.removeItem('beeyou_breathing_config');
      localStorage.removeItem('beeyou_onboarding_completed');
      localStorage.removeItem('beeyou_user_age_group');
      localStorage.removeItem('beeyou_user_persona');
      localStorage.removeItem('beeyou_app_state_v1');

      sessionStorage.clear();
    }
  } catch (e) {
    console.warn('Storage wipe warning:', e);
  }
}

/**
 * Apple Guideline 5.1.1(v) Compliant In-App Account Deletion
 * Permanently deletes the family account from Firebase Authentication,
 * purges cloud realtime data for this family, and wipes all local device data.
 */
export async function deleteFamilyAccount(password: string): Promise<{ success: boolean; message: string }> {
  const account = getStoredFamilyAccount();
  const user = auth.currentUser;

  // Handle Demo Account: reset local device demo state
  if (account?.isDemoAccount || user?.email === 'demo@beeyou.app') {
    await wipeDeviceStorage();
    return {
      success: true,
      message: 'Demo space has been completely reset on this device.',
    };
  }

  if (!user || !user.email) {
    // If no Firebase user session, perform clean local wipe
    await wipeDeviceStorage();
    return {
      success: true,
      message: 'Local family space has been completely deleted.',
    };
  }

  if (!password || password.trim().length === 0) {
    return {
      success: false,
      message: 'Please enter your account password to confirm permanent account deletion.',
    };
  }

  try {
    // 1. Re-authenticate with password before deletion
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // 2. Purge Cloud Realtime Database family node
    if (account?.familyCode) {
      await deleteFirebaseFamilyNode(account.familyCode);
    }

    // 3. Delete user from Firebase Auth
    await deleteUser(user);

    // 4. Wipe local device storage & session
    await wipeDeviceStorage();

    return {
      success: true,
      message: 'Your family account and all associated cloud data have been permanently deleted.',
    };
  } catch (err: any) {
    console.error('Account deletion error:', err);
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return {
        success: false,
        message: 'Incorrect password. Account deletion cancelled for your protection.',
      };
    }
    if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'Too many attempts. Please wait a few moments before trying again.',
      };
    }
    return {
      success: false,
      message: err.message || 'Failed to delete account. Please try again.',
    };
  }
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
 * Update the 4-digit caregiver PIN across stored family account and app settings.
 * Securely hashes the PIN with salt before persisting to local storage.
 */
export async function updateCaregiverPin(newPin: string): Promise<boolean> {
  if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return false;
  }
  const hashedPin = await hashPin(newPin);
  const account = getStoredFamilyAccount();
  if (account) {
    account.childProfile.pin = hashedPin;
    saveStoredFamilyAccount(account);
  }
  try {
    const settingsRaw = localStorage.getItem('beeyou_settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    settings.pin = hashedPin;
    localStorage.setItem('beeyou_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('beeyou_settings_updated', { detail: settings }));
  } catch {}
  return true;
}
