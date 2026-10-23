/**
 * BeeYou Authoritative Cloud Firestore Synchronization Service
 *
 * Provides production-grade, authenticated synchronization between BeeYou family
 * membership records and Cloud Firestore using atomic batch writes (:commit).
 *
 * Cloud Storage Security Rules depend on these Firestore documents for live,
 * authoritative membership verification and immediate revocation enforcement.
 */

import { GoogleAuth } from 'google-auth-library';

export class FirestoreSyncError extends Error {
  statusCode: number;
  isTransient: boolean;

  constructor(message: string, statusCode: number = 500, isTransient: boolean = false) {
    super(message);
    this.name = 'FirestoreSyncError';
    this.statusCode = statusCode;
    this.isTransient = isTransient;
  }
}

export interface FirestoreConfigReport {
  configured: boolean;
  mode: 'emulator' | 'service_account_json' | 'service_account_env' | 'google_application_credentials' | 'adc' | 'unconfigured';
  projectId: string;
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
  emulatorHost?: string;
}

export interface SyncOptions {
  timeoutMs?: number;
  maxRetries?: number;
  customFetch?: typeof fetch;
  customAuthHeader?: string;
  customHost?: string;
}

const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'beeyou-23d7d';

let cachedGoogleAuth: GoogleAuth | null = null;

/**
 * Diagnostic helper to verify Firestore credentials configuration without exposing secrets.
 */
export function verifyFirestoreConfig(): FirestoreConfigReport {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulatorHost) {
    return {
      configured: true,
      mode: 'emulator',
      projectId: FIREBASE_PROJECT_ID,
      hasClientEmail: false,
      hasPrivateKey: false,
      emulatorHost,
    };
  }

  // 1. JSON-encoded Service Account
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (saJson) {
    try {
      const parsed = JSON.parse(saJson);
      return {
        configured: Boolean(parsed.client_email && parsed.private_key),
        mode: 'service_account_json',
        projectId: parsed.project_id || FIREBASE_PROJECT_ID,
        hasClientEmail: Boolean(parsed.client_email),
        hasPrivateKey: Boolean(parsed.private_key),
      };
    } catch {
      return {
        configured: false,
        mode: 'service_account_json',
        projectId: FIREBASE_PROJECT_ID,
        hasClientEmail: false,
        hasPrivateKey: false,
      };
    }
  }

  // 2. Individual Environment Variables
  const clientEmail = process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (clientEmail || privateKey) {
    return {
      configured: Boolean(clientEmail && privateKey),
      mode: 'service_account_env',
      projectId: FIREBASE_PROJECT_ID,
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey),
    };
  }

  // 3. Google Application Credentials file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      configured: true,
      mode: 'google_application_credentials',
      projectId: FIREBASE_PROJECT_ID,
      hasClientEmail: true,
      hasPrivateKey: true,
    };
  }

  return {
    configured: false,
    mode: 'unconfigured',
    projectId: FIREBASE_PROJECT_ID,
    hasClientEmail: false,
    hasPrivateKey: false,
  };
}

/**
 * Resolves an authenticated authorization header for Cloud Firestore REST calls.
 */
export async function getFirestoreAuthHeader(options?: SyncOptions): Promise<string> {
  if (options?.customAuthHeader) {
    return options.customAuthHeader;
  }

  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulatorHost) {
    return 'Bearer owner';
  }

  // Resolve service account credentials if provided via environment
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let credentials: { client_email?: string; private_key?: string; project_id?: string } | undefined;

  if (saJson) {
    try {
      credentials = JSON.parse(saJson);
    } catch (e: any) {
      throw new FirestoreSyncError('Invalid JSON format in FIREBASE_SERVICE_ACCOUNT', 500, false);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL && process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      project_id: FIREBASE_PROJECT_ID,
    };
  }

  try {
    if (!cachedGoogleAuth) {
      cachedGoogleAuth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
        projectId: credentials?.project_id || FIREBASE_PROJECT_ID,
        ...(credentials ? { credentials } : {}),
        ...(process.env.GOOGLE_APPLICATION_CREDENTIALS ? { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS } : {}),
      });
    }

    const client = await cachedGoogleAuth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

    if (!token) {
      throw new Error('GoogleAuth client did not return a valid access token');
    }

    return `Bearer ${token}`;
  } catch (err: any) {
    throw new FirestoreSyncError(
      `Failed to authenticate with Cloud Firestore: ${err?.message || 'Credentials not configured'}`,
      401,
      false
    );
  }
}

/**
 * Reset cached GoogleAuth client (used for testing credential changes).
 */
export function resetCachedGoogleAuth(): void {
  cachedGoogleAuth = null;
}

/**
 * Authoritatively synchronizes family membership, approvals, and revocations to Cloud Firestore.
 * Executes atomic batch writes and enforces retries on transient errors.
 */
export async function syncFamilyToFirestore(
  familyCode: string,
  action: 'init_owner' | 'approve' | 'revoke',
  targetUid: string,
  details?: { role?: string; email?: string; reason?: string },
  options?: SyncOptions
): Promise<{ success: boolean; commitTime?: string; skipped?: boolean }> {
  const cleanCode = (familyCode || '').trim().toUpperCase();
  if (!cleanCode || cleanCode === 'BEE-DEMO') {
    return { success: true, skipped: true };
  }

  const config = verifyFirestoreConfig();
  if (!config.configured && !options?.customAuthHeader) {
    if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_FIRESTORE_SYNC === 'true') {
      throw new FirestoreSyncError(
        'Cloud Firestore service account credentials are required in production',
        500,
        false
      );
    }
    return { success: true, skipped: true };
  }

  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  const baseHost = options?.customHost
    || (emulatorHost ? `http://${emulatorHost}` : 'https://firestore.googleapis.com');
  const url = `${baseHost}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;

  const writes: any[] = [];
  const baseDocPath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/beeyou_families/${cleanCode}`;

  if (action === 'init_owner') {
    writes.push({
      update: {
        name: baseDocPath,
        fields: {
          ownerUid: { stringValue: targetUid },
          createdAt: { integerValue: String(Date.now()) },
          updatedAt: { integerValue: String(Date.now()) },
        },
      },
    });
    writes.push({
      update: {
        name: `${baseDocPath}/members/${targetUid}`,
        fields: {
          uid: { stringValue: targetUid },
          role: { stringValue: 'owner' },
          active: { booleanValue: true },
          approvedAt: { integerValue: String(Date.now()) },
        },
      },
    });
  } else if (action === 'approve') {
    writes.push({
      update: {
        name: `${baseDocPath}/members/${targetUid}`,
        fields: {
          uid: { stringValue: targetUid },
          role: { stringValue: details?.role || 'caregiver' },
          email: { stringValue: details?.email || '' },
          active: { booleanValue: true },
          approvedAt: { integerValue: String(Date.now()) },
        },
      },
    });
    writes.push({
      delete: `${baseDocPath}/revokedMembers/${targetUid}`,
    });
  } else if (action === 'revoke') {
    writes.push({
      update: {
        name: `${baseDocPath}/revokedMembers/${targetUid}`,
        fields: {
          uid: { stringValue: targetUid },
          revokedAt: { integerValue: String(Date.now()) },
          reason: { stringValue: details?.reason || 'Revoked by family owner' },
        },
      },
    });
    writes.push({
      delete: `${baseDocPath}/members/${targetUid}`,
    });
  }

  if (writes.length === 0) {
    return { success: true, skipped: true };
  }

  const authHeader = await getFirestoreAuthHeader(options);
  const maxRetries = options?.maxRetries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 6000;
  const fetchFn = options?.customFetch ?? fetch;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ writes }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorDetail = '';
        try {
          const json = await res.json();
          errorDetail = json?.error?.message || JSON.stringify(json);
        } catch {
          errorDetail = await res.text().catch(() => '');
        }

        const isTransient = res.status >= 500 || res.status === 429;
        const syncError = new FirestoreSyncError(
          `Firestore write failed with status ${res.status}: ${errorDetail || res.statusText}`,
          res.status,
          isTransient
        );

        // Immediate fail for non-transient client errors (400, 401, 403, 404)
        if (!isTransient) {
          throw syncError;
        }

        lastError = syncError;
      } else {
        const data = await res.json().catch(() => ({}));
        return {
          success: true,
          commitTime: data?.commitTime,
        };
      }
    } catch (err: any) {
      if (err instanceof FirestoreSyncError && !err.isTransient) {
        throw err;
      }

      if (err?.name === 'AbortError') {
        lastError = new FirestoreSyncError(`Firestore write timed out after ${timeoutMs}ms`, 504, true);
      } else if (err instanceof FirestoreSyncError) {
        lastError = err;
      } else {
        lastError = new FirestoreSyncError(
          `Firestore network interruption: ${err?.message || 'connection failed'}`,
          502,
          true
        );
      }
    } finally {
      clearTimeout(timer);
    }

    // Exponential backoff before retry if retries remain
    if (attempt < maxRetries) {
      const delayMs = 150 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new FirestoreSyncError('Firestore synchronization failed after maximum retries', 500, false);
}
