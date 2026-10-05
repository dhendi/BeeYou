import { UserAgeGroup, UserAccountRole, EnabledFeatures, getDefaultFeaturesForAge } from '../types';
import { setPairingCode, subscribeToCloudChannel, syncChildStatusToCaregiver, sendHeartbeat } from './caregiverSync';

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
  caregiverName: 'Sarah (Mom)',
  caregiverRole: 'Mom',
  familyCode: 'BEE-DEMO',
  childProfile: {
    name: 'Leo',
    ageGroup: 'kid',
    interests: ['Lego building', 'Space exploration', 'Visual schedules', 'Drawing'],
    pronouns: 'he/him',
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
    if (window.location.port === '3001' && view === 'caregiver') {
      localStorage.setItem(ACTIVE_DEVICE_VIEW_KEY, 'caregiver');
    } else if (window.location.port === '3000' && view === 'child') {
      localStorage.setItem(ACTIVE_DEVICE_VIEW_KEY, 'child');
    } else if (window.location.port !== '3000' && window.location.port !== '3001') {
      localStorage.setItem(ACTIVE_DEVICE_VIEW_KEY, view);
    }
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
  _password?: string
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
  let account: FamilyAccount = {
    id: 'fam-' + Date.now(),
    email: cleanEmail,
    caregiverName: 'Caregiver',
    caregiverRole: 'Parent / Caregiver',
    familyCode: deterministicCode,
    childProfile: {
      name: 'Leo',
      ageGroup: 'kid',
      interests: ['Visual Schedules', 'Sensory Breaks'],
      pronouns: 'they/them',
      pin: '1234',
    },
    subscriptionTier: 'premium',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  // 2. Fetch or login on server
  try {
    const res = await fetch('/api/caregiver/family/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.account) {
        account = {
          ...account,
          ...data.account,
          familyCode: data.account.familyCode || deterministicCode,
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/caregiver/family/login unreachable, using local deterministic account', err);
  }

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
 * Register a new Shared Family Account
 */
export async function registerSharedFamilyAccount(params: {
  email: string;
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

  const deterministicCode = getDeterministicFamilyCode(cleanEmail);

  let newAccount: FamilyAccount = {
    id: 'fam-' + Date.now(),
    email: cleanEmail,
    caregiverName: params.caregiverName.trim() || 'Caregiver',
    caregiverRole: params.caregiverRole.trim() || 'Parent',
    familyCode: deterministicCode,
    childProfile: {
      name: params.childName.trim() || 'Leo',
      ageGroup: params.childAgeGroup || 'kid',
      interests: ['Visual schedules', 'Calming activities'],
      pronouns: 'they/them',
      pin: params.pin || '1234',
    },
    subscriptionTier: 'premium',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  // Call server API to register family account
  try {
    const res = await fetch('/api/caregiver/family/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        caregiverName: newAccount.caregiverName,
        caregiverRole: newAccount.caregiverRole,
        childName: newAccount.childProfile.name,
        childAgeGroup: newAccount.childProfile.ageGroup,
        pin: newAccount.childProfile.pin,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.account) {
        newAccount = {
          ...newAccount,
          ...data.account,
          familyCode: data.account.familyCode || deterministicCode,
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/caregiver/family/register unreachable, using deterministic account', err);
  }

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
export function logoutFamilyAccount(): void {
  saveStoredFamilyAccount(null);
}
