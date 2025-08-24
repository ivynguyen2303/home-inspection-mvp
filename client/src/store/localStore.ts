import { useState, useEffect } from 'react';
import { getSession, findUserById } from '@/auth/storage';

export interface Request {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'closed';
  type: 'client_request' | 'open_request';
  targetInspectorEmail?: string;
  client: { name: string; email: string; phone: string };
  property: {
    address: string;
    cityZip: string;
    type: 'House' | 'Townhome' | 'Condo';
    beds: number;
    baths: number;
    sqft?: number;
  };
  schedule: { preferredDate: string; altDate?: string };
  budget?: number;
  notes: string;
  interestCount: number;
  interestedInspectorEmails: string[];
}

export interface InspectorProfile {
  email: string;
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

interface LocalStore {
  requests: Request[];
  inspectorProfile: InspectorProfile;
  allInspectorProfiles: InspectorProfile[];
}

const DEFAULT_INSPECTOR_PROFILE: InspectorProfile = {
  email: 'inspector_demo@example.com',
  displayName: 'Demo Inspector',
  serviceAreas: ['San Francisco', 'Oakland', 'San Jose', 'Palo Alto'],
  specialties: ['Foundation', 'Electrical', 'Plumbing', 'HVAC'],
  basePrice: 400
};

const STORAGE_KEY = 'inspect_now_store';
const SHARED_REQUESTS_KEY = 'inspect_now_shared_requests';
const SHARED_PROFILES_KEY = 'inspect_now_shared_profiles';

function getUserStorageKey(userEmail?: string): string {
  if (!userEmail) return STORAGE_KEY;
  return `${STORAGE_KEY}_${userEmail}`;
}

const broadcast = () => {
  try { setTimeout(() => window.dispatchEvent(new Event('storage')), 10); } catch {}
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

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

function getCurrentUserEmail(): string | undefined {
  try {
    const session = getSession();
    if (session) {
      const user = findUserById(session.userId);
      return user?.email;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return undefined;
}

export function useLocalStore() {
  const [store, setStore] = useState<LocalStore>(() => {
    const userEmail = getCurrentUserEmail();
    const userStorageKey = getUserStorageKey(userEmail);

    let sharedRequests: Request[] = [];
    try {
      const savedRequests = localStorage.getItem(SHARED_REQUESTS_KEY);
      if (savedRequests) {
        sharedRequests = safeParse<any[]>(savedRequests, []).map(normalizeRequest);
        // Write back normalized to ensure consistency
        localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(sharedRequests));
      }
    } catch (error) {
      console.error('Error loading shared requests:', error);
    }

    let sharedProfiles: InspectorProfile[] = [];
    try {
      const savedProfiles = localStorage.getItem(SHARED_PROFILES_KEY);
      if (savedProfiles) {
        const parsed = safeParse<InspectorProfile[]>(savedProfiles, []);
        sharedProfiles = Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error loading shared profiles:', error);
    }

    let userInspectorProfile = DEFAULT_INSPECTOR_PROFILE;
    try {
      const savedUserData = localStorage.getItem(userStorageKey);
      if (savedUserData) {
        const parsed = safeParse<any>(savedUserData, {});
        if (parsed.inspectorProfile) {
          userInspectorProfile = parsed.inspectorProfile;
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }

    return {
      requests: sharedRequests,
      inspectorProfile: userInspectorProfile,
      allInspectorProfiles: sharedProfiles
    };
  });

  /** Cross-tab/account sync: hydrate on storage events */
  useEffect(() => {
    const onStorage = () => {
      try {
        const sharedRequests = safeParse<any[]>(
          localStorage.getItem(SHARED_REQUESTS_KEY),
          []
        ).map(normalizeRequest);
        const sharedProfiles = safeParse<InspectorProfile[]>(
          localStorage.getItem(SHARED_PROFILES_KEY),
          []
        );

        const nextReqJson = JSON.stringify(sharedRequests);
        const curReqJson = JSON.stringify(store.requests);
        const nextProfJson = JSON.stringify(sharedProfiles);
        const curProfJson = JSON.stringify(store.allInspectorProfiles);

        if (nextReqJson !== curReqJson || nextProfJson !== curProfJson) {
          setStore(prev => ({
            ...prev,
            requests: nextReqJson !== curReqJson ? sharedRequests : prev.requests,
            allInspectorProfiles: nextProfJson !== curProfJson ? sharedProfiles : prev.allInspectorProfiles
          }));
        }
      } catch (e) {
        console.error('Failed to sync from storage event', e);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.requests, store.allInspectorProfiles]);

  /**
   * Persist ONLY the per-user blob in the generic effect.
   * DO NOT write SHARED_REQUESTS_KEY or SHARED_PROFILES_KEY here.
   * Those are written exactly at mutation sites below to avoid “nuking” shared data.
   */
  useEffect(() => {
    const userEmail = getCurrentUserEmail();
    const userStorageKey = getUserStorageKey(userEmail);
    try {
      localStorage.setItem(userStorageKey, JSON.stringify({ inspectorProfile: store.inspectorProfile }));
      broadcast();
    } catch (error) {
      console.error('Error saving per-user data to localStorage:', error);
    }
  }, [store.inspectorProfile]);

  /* =========================
   * Shared data mutations — write shared keys here ONLY
   * ========================= */

  const addRequest = (
    requestData: Omit<Request, 'id' | 'createdAt' | 'interestCount' | 'interestedInspectorEmails'>
  ) => {
    const newRequest: Request = {
      ...requestData,
      id: (globalThis.crypto as any)?.randomUUID?.() ?? `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      interestCount: 0,
      interestedInspectorEmails: []
    };

    try {
      const existing = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []).map(normalizeRequest);
      const updatedRequests = [newRequest, ...existing];
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      setStore(prev => ({ ...prev, requests: updatedRequests }));
      broadcast();
    } catch (error) {
      console.error('Error adding request:', error);
      setStore(prev => ({ ...prev, requests: [newRequest, ...prev.requests] }));
      broadcast();
    }

    return newRequest.id;
  };

  const toggleInterest = (requestId: string, inspectorEmail: string) => {
    if (!inspectorEmail) return;
    try {
      const current = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []).map(normalizeRequest);
      const updatedRequests: Request[] = current.map(req => {
        if (req.id !== requestId) return req;
        const set = new Set(req.interestedInspectorEmails);
        if (set.has(inspectorEmail)) set.delete(inspectorEmail); else set.add(inspectorEmail);
        const emails = Array.from(set);
        return { ...req, interestedInspectorEmails: emails, interestCount: emails.length };
      });
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      setStore(prev => ({ ...prev, requests: updatedRequests }));
      broadcast();
    } catch (error) {
      console.error('toggleInterest failed:', error);
    }
  };

  const updateInspectorProfile = (updates: Partial<InspectorProfile>) => {
    setStore(prev => {
      const updatedProfile = { ...prev.inspectorProfile, ...updates };
      const updatedAllProfiles = prev.allInspectorProfiles.map(profile =>
        profile.email === updatedProfile.email ? updatedProfile : profile
      );

      // Persist shared profiles here (not in the generic effect)
      try {
        localStorage.setItem(SHARED_PROFILES_KEY, JSON.stringify(updatedAllProfiles));
        broadcast();
      } catch (e) {
        console.error('Error saving shared profiles:', e);
      }

      return { ...prev, inspectorProfile: updatedProfile, allInspectorProfiles: updatedAllProfiles };
    });
  };

  const setCurrentInspectorProfile = (userEmail: string) => {
    const profile = getInspectorProfileByEmail(userEmail);
    if (profile) {
      setStore(prev => ({ ...prev, inspectorProfile: profile }));
      // per-user persist happens via the effect on inspectorProfile
    }
  };

  const addInspectorProfile = (profile: InspectorProfile) => {
    setStore(prev => {
      const nextAll = [...prev.allInspectorProfiles.filter(p => p.email !== profile.email), profile];
      try {
        localStorage.setItem(SHARED_PROFILES_KEY, JSON.stringify(nextAll));
        broadcast();
      } catch (e) {
        console.error('Error saving shared profiles:', e);
      }
      return { ...prev, allInspectorProfiles: nextAll };
    });
  };

  const getAllInspectorProfiles = () => store.allInspectorProfiles;
  const getInspectorProfileByEmail = (email: string) => store.allInspectorProfiles.find(p => p.email === email);

  const removeInspectorProfile = (userEmail: string) => {
    try {
      const profiles = safeParse<InspectorProfile[]>(
        localStorage.getItem(SHARED_PROFILES_KEY),
        []
      );
      const next = profiles.filter(p => p.email !== userEmail);
      localStorage.setItem(SHARED_PROFILES_KEY, JSON.stringify(next));
      setStore(prev => ({ ...prev, allInspectorProfiles: next }));
      broadcast();
    } catch (error) {
      console.error('removeInspectorProfile failed:', error);
    }
  };

  const getRequestById = (id: string) => store.requests.find(req => req.id === id);
  const getMyInterests = () =>
    store.requests.filter(req => req.interestedInspectorEmails?.includes(store.inspectorProfile.email));

  const createBookingFromTimeSlot = (
    timeSlotId: string,
    inspectorId: string,
    clientData: {
      name: string; email: string; phone: string;
      address: string; cityZip: string; propertyType: 'House' | 'Townhome' | 'Condo';
      beds: number; baths: number; sqft?: number; notes?: string;
    }
  ) => {
    const inspector = getInspectorProfileByEmail(inspectorId);
    const timeSlot = inspector?.availability?.timeSlots?.find((slot: any) => slot.id === timeSlotId);
    if (!inspector || !timeSlot) throw new Error('Inspector or time slot not found');

    const newRequest: Request = {
      id: (globalThis.crypto as any)?.randomUUID?.() ?? `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      type: 'client_request',
      targetInspectorEmail: inspectorId,
      client: { name: clientData.name, email: clientData.email, phone: clientData.phone },
      property: {
        address: clientData.address, cityZip: clientData.cityZip,
        type: clientData.propertyType, beds: clientData.beds, baths: clientData.baths, sqft: clientData.sqft
      },
      schedule: {
        preferredDate: `${timeSlot.date} ${timeSlot.startTime}-${timeSlot.endTime}`
      },
      notes: clientData.notes || `Booking request for ${timeSlot.date} ${timeSlot.startTime}-${timeSlot.endTime}`,
      interestCount: 1,
      interestedInspectorEmails: [inspectorId]
    };

    try {
      const existing = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []).map(normalizeRequest);
      const updatedRequests = [newRequest, ...existing];
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      setStore(prev => ({ ...prev, requests: updatedRequests }));
      broadcast();
    } catch (error) {
      console.error('Error saving client request:', error);
      setStore(prev => ({ ...prev, requests: [newRequest, ...prev.requests] }));
      broadcast();
    }

    // Mark time slot unavailable locally
    setStore(prev => ({
      ...prev,
      allInspectorProfiles: prev.allInspectorProfiles.map(profile => {
        if (profile.email === inspectorId && profile.availability?.timeSlots) {
          return {
            ...profile,
            availability: {
              ...profile.availability,
              timeSlots: profile.availability.timeSlots.map(slot =>
                slot.id === timeSlotId ? { ...slot, available: false } : slot
              )
            }
          };
        }
        return profile;
      })
    }));

    // Persist updated profiles after slot change
    try {
      const nextProfiles = getAllInspectorProfiles();
      localStorage.setItem(SHARED_PROFILES_KEY, JSON.stringify(nextProfiles));
      broadcast();
    } catch (e) {
      console.error('Error saving shared profiles after slot change:', e);
    }

    return newRequest.id;
  };

  const createOpenRequest = (clientData: {
    name: string; email: string; phone: string;
    address: string; cityZip: string; propertyType: 'House' | 'Townhome' | 'Condo';
    beds: number; baths: number; sqft?: number; preferredDate: string; altDate?: string; budget?: number; notes?: string;
  }) => {
    const newRequest: Request = {
      id: (globalThis.crypto as any)?.randomUUID?.() ?? `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      type: 'open_request',
      client: { name: clientData.name, email: clientData.email, phone: clientData.phone },
      property: {
        address: clientData.address, cityZip: clientData.cityZip,
        type: clientData.propertyType, beds: clientData.beds, baths: clientData.baths, sqft: clientData.sqft
      },
      schedule: { preferredDate: clientData.preferredDate, altDate: clientData.altDate },
      budget: clientData.budget,
      notes: clientData.notes || '',
      interestCount: 0,
      interestedInspectorEmails: []
    };

    try {
      const existing = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []).map(normalizeRequest);
      const updated = [newRequest, ...existing];
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updated));
      setStore(prev => ({ ...prev, requests: updated }));
      broadcast();
    } catch (error) {
      console.error('Error adding open request:', error);
      setStore(prev => ({ ...prev, requests: [newRequest, ...prev.requests] }));
      broadcast();
    }

    return newRequest.id;
  };

  const getClientRequests = (clientEmail: string) =>
    store.requests.filter(req => req.client.email === clientEmail && (req.type === 'open_request' || req.type === 'client_request'));

  const updateRequest = (
    requestId: string,
    clientEmail: string,
    updates: Partial<Omit<Request, 'id' | 'createdAt'>>
  ) => {
    const found = store.requests.find(r => r.id === requestId);
    if (!found || found.client.email !== clientEmail) throw new Error('Request not found or unauthorized');

    try {
      const existing = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []).map(normalizeRequest);
      const updatedRequests = existing.map(req => (req.id === requestId ? { ...req, ...updates } as Request : req));
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      setStore(prev => ({ ...prev, requests: updatedRequests }));
      broadcast();
    } catch (error) {
      console.error('Error updating request in localStorage:', error);
      setStore(prev => ({
        ...prev,
        requests: prev.requests.map(req => (req.id === requestId ? ({ ...req, ...updates } as Request) : req))
      }));
      broadcast();
    }
  };

  const deleteRequest = (requestId: string, clientEmail: string) => {
    const found = store.requests.find(r => r.id === requestId);
    if (!found || found.client.email !== clientEmail) throw new Error('Request not found or unauthorized');

    try {
      const existing = safeParse<any[]>(localStorage.getItem(SHARED_REQUESTS_KEY), []).map(normalizeRequest);
      const updatedRequests = existing.filter(req => req.id !== requestId);
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      setStore(prev => ({ ...prev, requests: updatedRequests }));
      broadcast();
    } catch (error) {
      console.error('Error deleting request from localStorage:', error);
      setStore(prev => ({ ...prev, requests: prev.requests.filter(req => req.id !== requestId) }));
      broadcast();
    }

    // (optional) free timeslot logic could persist profiles here if you modify availability
  };

  const debugLocalStorage = () => {
    console.log('🔍 [DEBUG STORAGE] Keys:', Object.keys(localStorage));
    console.log('🔍 Requests:', localStorage.getItem(SHARED_REQUESTS_KEY));
    console.log('🔍 Profiles:', localStorage.getItem(SHARED_PROFILES_KEY));
    console.log('🔍 Store state:', store);
  };

  return {
    requests: store.requests,
    inspectorProfile: store.inspectorProfile,
    allInspectorProfiles: store.allInspectorProfiles,
    addRequest,
    toggleInterest,
    updateInspectorProfile,
    setCurrentInspectorProfile,
    addInspectorProfile,
    getAllInspectorProfiles,
    getInspectorProfileByEmail,
    removeInspectorProfile,
    getRequestById,
    getMyInterests,
    debugLocalStorage,
    createBookingFromTimeSlot,
    createOpenRequest,
    getClientRequests,
    updateRequest,
    deleteRequest
  };
}
