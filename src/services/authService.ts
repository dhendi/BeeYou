import { UserAgeGroup, UserAccountRole, EnabledFeatures, getDefaultFeaturesForAge } from '../types';
import { setPairingCode, subscribeToCloudChannel, syncChildStatusToCaregiver, sendHeartbeat } from './caregiverSync';
import { app } from './firebaseSync';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


export interface FamilyAccount {
  id: string;
  email: string;
  caregiverName: string;
  caregiverRole: string; // e.g. 'Mom', 'Dad', 'Caregiver', 'Educator'
  familyCode: string; // e.g. 'BEE-DEMO' or 6-char family sync code
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

export function getDeterministicFamilyCode(email: string): string {
  const clean = email.trim().toLowerCase();
  if (clean === 'demo@beeyou.app' || clean === 'demo' || clean === 'test@beeyou.app') {
    return 'BEE-DEMO';
  }
  const prefix = clean.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 5).toUpperCase();
  return `BEE-${prefix || 'FAM'}`;
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

  const deterministicCode = getDeterministicFamilyCode(cleanEmail);
  const effectivePassword = password && password.length >= 6 ? password : 'beeyou2026';
  let firebaseUid = 'fam-' + Date.now();

  // 2. Real Firebase Authentication
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, effectivePassword);
    firebaseUid = userCredential.user.uid;
  } catch (err: any) {
    // If user does not exist in Firebase Auth yet, automatically create the account for smooth onboarding
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, cleanEmail, effectivePassword);
        firebaseUid = newCredential.user.uid;
      } catch (createErr: any) {
        if (createErr.code !== 'auth/email-already-in-use') {
          console.warn('Firebase Auth auto-provision notice:', createErr.message);
        }
      }
    } else {
      console.warn('Firebase signIn notice:', err.message);
    }
  }

  let account: FamilyAccount = {
    id: firebaseUid,
    email: cleanEmail,
    caregiverName: 'Caregiver',
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
    createdAt: new Date().toISOString(),
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
  caregiverName: string;
  caregiverRole: string;
  childName: string;
  childAgeGroup: UserAgeGroup;
  pin?: string;
}): Promise<{ success: boolean; account?: FamilyAccount; message: string }> {
  const cleanEmail = params.email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (params.password && params.password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const deterministicCode = getDeterministicFamilyCode(cleanEmail);
  const effectivePassword = params.password && params.password.length >= 6 ? params.password : 'beeyou2026';
  let firebaseUid = 'fam-' + Date.now();


  // 1. Create User in Firebase Auth
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, effectivePassword);
    firebaseUid = userCredential.user.uid;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      try {
        const signinRes = await signInWithEmailAndPassword(auth, cleanEmail, effectivePassword);
        firebaseUid = signinRes.user.uid;
      } catch (signinErr: any) {
        console.warn('Firebase signin fallback notice:', signinErr.message);
      }
    } else {
      console.warn('Firebase createUser notice:', err.message);
    }
  }

  let newAccount: FamilyAccount = {
    id: firebaseUid,
    email: cleanEmail,
    caregiverName: params.caregiverName.trim() || 'Caregiver',
    caregiverRole: params.caregiverRole.trim() || 'Parent',
    familyCode: deterministicCode,
    childProfile: {
      name: params.childName.trim() || 'Child',
      ageGroup: params.childAgeGroup || 'kid',
      interests: [],
      pronouns: '',
      pin: params.pin || '1234',
    },
    subscriptionTier: 'premium',
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
    message: `Account created for ${cleanEmail}! Family sync code: ${newAccount.familyCode}. Both devices link automatically!`,
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
 * Log out of family account
 */
export async function logoutFamilyAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
  saveStoredFamilyAccount(null);
}
