// client/src/auth/storage.ts

/* =========================
 * LocalStorage Keys
 * ========================= */
const USERS_KEY = 'inspect_now_users';
const SESSION_KEY = 'inspect_now_session';
const SHARED_REQUESTS_KEY = 'inspect_now_shared_requests';
const SHARED_PROFILES_KEY = 'inspect_now_shared_profiles';

/* =========================
 * Types
 * ========================= */
export type Role = 'client' | 'inspector';

export interface UserRecord {
  id: string;
  email: string;
  name?: string;
  role: Role;
  passwordHash?: string; // simple demo; don’t use for production
}

export interface Request {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'closed';
  type: 'client_request' | 'open_request';
  targetInspectorEmail?: string; // for client_request
  client: {
    name: string;
    email: string;
    phone: string;
  };
  property: {
    address: string;
    cityZip: string;
    type: 'House' | 'Townhome' | 'Condo';
    beds: number;
    baths: number;
    sqft?: number;
  };
  schedule: {
    preferredDate: string;
    altDate?: string;
  };
  budget?: number;
  notes: string;
  interestCount: number;
  interestedInspectorEmails: string[];
}

export interface InspectorProfile {
  email: string;            // primary id
  displayName: string;
  serviceAreas: string[];
  specialties: string[];
  basePrice: number;
  phone?: string;
  location?: string;
  bio?: string;
  yearsExperience?: number;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  completedInspections?: number;
  image?: string;
  verified?: boolean;
  availability?: {
    nextAvailable: string;
    responseTime: string;
    timeSlots?: Array<{
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      available: boolean;
    }>;
  };
  contact?: { phone: string; email: string; website?: string };
  insurance?: string;
}

/* =========================
 * Utils
 * ========================= */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function broadcast() {
  try { setTimeout(() => window.dispatchEvent(new Event('storage')), 10); } catch {}
}

export function generateUserId(): string {
  // demo UUID
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() ?? `uid_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

export async function hashPassword(plain: string): Promise<string> {
  // DO NOT USE IN PROD – demo only
  return btoa(plain);
}

/* =========================
 * Session / Users (PUBLIC API)
 * ========================= */

// --- add near the other exports in client/src/auth/storage.ts ---

// Back-compat wrapper so existing code that calls `deleteUser(...)` keeps working.
// Accepts either a userId or an email. If it contains '@', we treat it as an email.
export function deleteUser(identifier: string): boolean {
  if (identifier.includes('@')) {
    return deleteUserByEmailSafe(identifier);
  }
  return deleteUserByIdSafe(identifier);
}

// Optional convenience aliases if you prefer these names elsewhere:
export { deleteUserByIdSafe as deleteUserById };
export { deleteUserByEmailSafe as deleteUserByEmail };

export function getUsers(): UserRecord[] {
  return safeParse<UserRecord[]>(localStorage.getItem(USERS_KEY), []);
}

export function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  broadcast();
}

export function addUser(user: Omit<UserRecord, 'id'> & { id?: string }): UserRecord {
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) throw new Error('Email already exists');
  const record: UserRecord = { id: user.id ?? generateUserId(), ...user };
  users.push(record);
  saveUsers(users);
  return record;
}

export function updateUser(id: string, patch: Partial<UserRecord>) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
}

export function findUserById(id: string): UserRecord | undefined {
  return getUsers().find(u => u.id === id);
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const e = email.toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === e);
}

export function getSession(): { userId: string } | null {
  return safeParse<{ userId: string } | null>(localStorage.getItem(SESSION_KEY), null);
}

export function setSession(userId: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
  broadcast();
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  broadcast();
}

/* Optional: seed demo accounts */
export function initializeDemoAccounts() {
  const users = getUsers();
  if (users.length) return;
  const demoInspector: UserRecord = { id: generateUserId(), email: 'inspector_demo@example.com', name: 'Demo Inspector', role: 'inspector' };
  const demoClient: UserRecord = { id: generateUserId(), email: 'client_demo@example.com', name: 'Demo Client', role: 'client' };
  saveUsers([demoInspector, demoClient]);
}

/* =========================
 * Request Normalizer (Fix for TS errors)
 * ========================= */
function normalizeRequest(raw: any): Request {
  const type: Request['type'] =
    raw?.type === 'client_request' || raw?.type === 'open_request' ? raw.type : 'open_request';

  const status: Request['status'] =
    raw?.status === 'open' || raw?.status === 'matched' || raw?.status === 'closed' ? raw.status : 'open';

  const propType: Request['property']['type'] =
    raw?.property?.type === 'House' || raw?.property?.type === 'Townhome' || raw?.property?.type === 'Condo'
      ? raw.property.type
      : 'House';

  const emails: string[] = Array.isArray(raw?.interestedInspectorEmails)
    ? raw.interestedInspectorEmails.map(String)
    : [];

  return {
    id: String(raw?.id ?? `req_${Date.now()}`),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    status,
    type,
    targetInspectorEmail: raw?.targetInspectorEmail ? String(raw.targetInspectorEmail) : undefined,
    client: {
      name: String(raw?.client?.name ?? 'Client'),
      email: String(raw?.client?.email ?? ''),
      phone: String(raw?.client?.phone ?? '')
    },
    property: {
      address: String(raw?.property?.address ?? ''),
      cityZip: String(raw?.property?.cityZip ?? ''),
      type: propType,
      beds: Number(raw?.property?.beds ?? 0),
      baths: Number(raw?.property?.baths ?? 0),
      sqft: raw?.property?.sqft != null ? Number(raw.property.sqft) : undefined
    },
    schedule: {
      preferredDate: String(raw?.schedule?.preferredDate ?? new Date().toISOString()),
      altDate: raw?.schedule?.altDate != null ? String(raw.schedule.altDate) : undefined
    },
    budget: raw?.budget != null ? Number(raw.budget) : undefined,
    notes: String(raw?.notes ?? ''),
    interestCount: Number.isFinite(raw?.interestCount) ? Number(raw.interestCount) : emails.length,
    interestedInspectorEmails: emails
  };
}

/* =========================
 * Safe Delete (PUBLIC API)
 * ========================= */

/**
 * Delete a user by ID without wiping other users or shared data.
 * - Removes user from USERS_KEY
 * - Clears session if they’re the current user
 * - Cascades into shared requests/profiles, using strict typing
 */
export function deleteUserByIdSafe(userId: string): boolean {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  // 1) Remove just this user
  const kept = users.filter(u => u.id !== userId);
  saveUsers(kept);

  // 2) Clear session if needed
  const session = getSession();
  if (session?.userId === userId) {
    clearSession();
  }

  // 3) Cascade by email & role
  cascadeDeleteForEmail(user.email, user.role);

  broadcast();
  return true;
}

/** Same as above, by email */
export function deleteUserByEmailSafe(email: string): boolean {
  const u = findUserByEmail(email);
  if (!u) return false;
  return deleteUserByIdSafe(u.id);
}

/* =========================
 * Cascade logic (uses normalizer)
 * ========================= */
function cascadeDeleteForEmail(email: string, role: Role) {
  // Normalize current requests from storage
  const raw = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []);
  const currentRequests: Request[] = raw.map(normalizeRequest);

  // Inspector vs Client handling
  if (role === 'client') {
    // Remove ONLY this client's requests
    const finalRequests: Request[] = currentRequests.filter(r => r.client.email !== email);
    localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(finalRequests));
  } else {
    // Inspector: remove likes; if targeted, convert to open_request
    const nextRequests: Request[] = currentRequests.map((req): Request => {
      const wasTargeted = req.targetInspectorEmail === email;
      const removedLikes = req.interestedInspectorEmails.filter(e => e !== email);
      const newCount = removedLikes.length;

      if (wasTargeted) {
        return {
          ...req,
          type: 'open_request',
          targetInspectorEmail: undefined,
          interestedInspectorEmails: removedLikes,
          interestCount: newCount,
          status: req.status === 'matched' ? 'open' : req.status
        };
      }
      return { ...req, interestedInspectorEmails: removedLikes, interestCount: newCount };
    });

    localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(nextRequests));

    // Remove ONLY this inspector's profile (do not nuke all)
    const profiles = safeParse<InspectorProfile[]>(localStorage.getItem(SHARED_PROFILES_KEY), []);
    const nextProfiles = profiles.filter(p => p.email !== email);
    localStorage.setItem(SHARED_PROFILES_KEY, JSON.stringify(nextProfiles));
  }

  broadcast();
}
