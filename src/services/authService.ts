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

// Save family account to local storage and bind live sync code
export function saveStoredFamilyAccount(account: FamilyAccount | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (account) {
      localStorage.setItem(FAMILY_ACCOUNT_KEY, JSON.stringify(account));
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
    const v = localStorage.getItem(ACTIVE_DEVICE_VIEW_KEY);
    if (v === 'caregiver' || v === 'child') return v;
  } catch {}
  return 'child';
}

export function setActiveDeviceView(view: 'child' | 'caregiver'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_DEVICE_VIEW_KEY, view);
  } catch {}
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
    return {
      success: true,
      account: demo,
      message: 'Logged into Demo Family Account! Both devices are now linked to "BEE-DEMO".',
    };
  }

  // 2. Check existing stored account or generate unique family account
  let account = getStoredFamilyAccount();
  if (!account || account.email !== cleanEmail) {
    // Generate deterministic clean 6-character family code from email
    const hash = cleanEmail.replace(/[^a-z0-9]/g, '').slice(0, 4).toUpperCase();
    const familyCode = `BEE-${hash || 'FAM'}`;

    account = {
      id: 'fam-' + Date.now(),
      email: cleanEmail,
      caregiverName: 'Caregiver',
      caregiverRole: 'Parent / Caregiver',
      familyCode,
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
  }

  saveStoredFamilyAccount(account);
  return {
    success: true,
    account,
    message: `Logged in as ${cleanEmail}. Family sync code is ${account.familyCode}.`,
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

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand2 = '';
  for (let i = 0; i < 2; i++) rand2 += chars.charAt(Math.floor(Math.random() * chars.length));
  const familyCode = `FAM-${rand2}${Math.floor(Math.random() * 89 + 10)}`;

  const newAccount: FamilyAccount = {
    id: 'fam-' + Date.now(),
    email: cleanEmail,
    caregiverName: params.caregiverName.trim() || 'Caregiver',
    caregiverRole: params.caregiverRole.trim() || 'Parent',
    familyCode,
    childProfile: {
      name: params.childName.trim() || 'Child',
      ageGroup: params.childAgeGroup || 'kid',
      interests: ['Visual schedules', 'Calming activities'],
      pronouns: 'they/them',
      pin: params.pin || '1234',
    },
    subscriptionTier: 'premium',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  saveStoredFamilyAccount(newAccount);

  return {
    success: true,
    account: newAccount,
    message: `Account created for ${cleanEmail}! Both devices can now connect using this email.`,
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
