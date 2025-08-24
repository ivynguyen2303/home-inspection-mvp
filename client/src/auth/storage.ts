import { User, Session } from './types';

const USERS_KEY = 'inspect_now_users';
const SESSION_KEY = 'inspect_now_session';

// Password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// User storage functions
export function getUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.id === id);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(userId: string, updates: Partial<User>): void {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
}

// Session storage functions
export function getSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading session from localStorage:', error);
    return null;
  }
}

export function setSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
}

// Generate unique ID
export function generateUserId(): string {
  return `usr_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize demo accounts
export async function initializeDemoAccounts(): Promise<void> {
  const users = getUsers();
  
  // Only initialize if no users exist
  if (users.length === 0) {
    const demoAccounts: Omit<User, 'passwordHash'>[] = [
      {
        id: 'usr_client_demo',
        email: 'client_demo@example.com',
        role: 'client',
        name: 'Demo Client',
        phone: '(555) 123-4567',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_inspector_demo',
        email: 'inspector_demo@example.com',
        role: 'inspector',
        name: 'Demo Inspector',
        phone: '(555) 987-6543',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_client_002',
        email: 'michael.chen@email.com',
        role: 'client',
        name: 'Michael Chen',
        phone: '(415) 555-0147',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'usr_client_003',
        email: 'emily.rodriguez@email.com',
        role: 'client',
        name: 'Emily Rodriguez',
        phone: '(415) 555-0198',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'usr_client_004',
        email: 'david.kim@email.com',
        role: 'client',
        name: 'David Kim',
        phone: '(415) 555-0276',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'usr_client_005',
        email: 'jennifer.taylor@email.com',
        role: 'client',
        name: 'Jennifer Taylor',
        phone: '(415) 555-0334',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'usr_client_006',
        email: 'alex.martinez@email.com',
        role: 'client',
        name: 'Alex Martinez',
        phone: '(415) 555-0412',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Hash password for demo accounts: "DemoPass123"
    const hashedAccounts = await Promise.all(demoAccounts.map(async (account) => {
      const passwordHash = await hashPassword('DemoPass123');
      return { ...account, passwordHash };
    }));
    
    saveUsers(hashedAccounts);
  }
}