import { useState, useEffect } from 'react';
import { getSession, findUserById } from '@/auth/storage';

export interface Request {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'closed';
  type: 'client_request' | 'open_request';
  targetInspectorEmail?: string; // Only for client_request type
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
  email: string; // Primary identifier
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
  contact?: {
    phone: string;
    email: string;
    website?: string;
  };
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
const SHARED_REQUESTS_KEY = 'inspect_now_shared_requests'; // Shared across all users

// Helper function to get user-specific storage key for profiles only
function getUserStorageKey(userEmail?: string): string {
  if (!userEmail) return STORAGE_KEY;
  return `${STORAGE_KEY}_${userEmail}`;
}

export function useLocalStore() {
  // Get current user email from session
  const getCurrentUserEmail = () => {
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
  };

  const [store, setStore] = useState<LocalStore>(() => {
    const userEmail = getCurrentUserEmail();
    const userStorageKey = getUserStorageKey(userEmail);
    
    
    // Load shared requests (accessible to all users)
    let sharedRequests = [];
    try {
      console.log('🔍 [INIT DEBUG] Loading shared requests...');
      const savedRequests = localStorage.getItem(SHARED_REQUESTS_KEY);
      console.log('🔍 [INIT DEBUG] Raw localStorage data:', savedRequests?.substring(0, 200) + '...');
      
      if (savedRequests) {
        const parsed = JSON.parse(savedRequests);
        console.log('🔍 [INIT DEBUG] Parsed requests:', parsed.length, 'total');
        console.log('🔍 [INIT DEBUG] Request IDs:', parsed.map((r: any) => r.id));
        
        // Only clear if we actually find the old problematic fields
        const hasOldFormat = Array.isArray(parsed) && parsed.some((r: any) => 
          r.hasOwnProperty('interestedInspectorIds') || r.hasOwnProperty('targetInspectorId')
        );
        
        console.log('🔍 [INIT DEBUG] Has old format?', hasOldFormat);
        
        if (hasOldFormat) {
          console.log('🚨 [INIT DEBUG] Clearing old format data');
          localStorage.removeItem(SHARED_REQUESTS_KEY);
          sharedRequests = [];
        } else {
          sharedRequests = Array.isArray(parsed) ? parsed : [];
          console.log('✅ [INIT DEBUG] Loaded', sharedRequests.length, 'shared requests');
        }
      } else {
        console.log('❌ [INIT DEBUG] No shared requests found in localStorage');
      }
    } catch (error) {
      console.error('🏪 [STORE INIT] Error loading shared requests:', error);
    }
    
    // Load user-specific data (profiles)
    let userProfiles = { inspectorProfile: DEFAULT_INSPECTOR_PROFILE, allInspectorProfiles: [] };
    try {
      const savedUserData = localStorage.getItem(userStorageKey);
      
      if (savedUserData) {
        const parsed = JSON.parse(savedUserData);
        
        if (parsed.inspectorProfile && parsed.allInspectorProfiles) {
          userProfiles = {
            inspectorProfile: parsed.inspectorProfile,
            allInspectorProfiles: parsed.allInspectorProfiles
          };
        }
      }
    } catch (error) {
      console.error('🏪 [STORE INIT] Error loading user data:', error);
    }
    
    return {
      requests: sharedRequests,
      inspectorProfile: userProfiles.inspectorProfile,
      allInspectorProfiles: userProfiles.allInspectorProfiles
    };
  });

  // Debug function to inspect localStorage
  const debugLocalStorage = () => {
    console.log('🔍 [DEBUG STORAGE] === LocalStorage Debug ===');
    console.log('🔍 [DEBUG STORAGE] All localStorage keys:', Object.keys(localStorage));
    console.log('🔍 [DEBUG STORAGE] SHARED_REQUESTS_KEY:', SHARED_REQUESTS_KEY);
    
    const sharedRequests = localStorage.getItem(SHARED_REQUESTS_KEY);
    console.log('🔍 [DEBUG STORAGE] Shared requests raw:', sharedRequests);
    if (sharedRequests) {
      try {
        const parsed = JSON.parse(sharedRequests);
        console.log('🔍 [DEBUG STORAGE] Shared requests parsed:', parsed);
        console.log('🔍 [DEBUG STORAGE] Shared requests count:', parsed.length);
      } catch (e) {
        console.log('🔍 [DEBUG STORAGE] Error parsing shared requests:', e);
      }
    }
    
    const userEmail = getCurrentUserEmail();
    const userStorageKey = getUserStorageKey(userEmail);
    console.log('🔍 [DEBUG STORAGE] User storage key:', userStorageKey);
    
    const userData = localStorage.getItem(userStorageKey);
    console.log('🔍 [DEBUG STORAGE] User data raw:', userData);
    
    console.log('🔍 [DEBUG STORAGE] Current store state:', store);
    console.log('🔍 [DEBUG STORAGE] === End Debug ===');
  };

  // Clear all data function
  const clearAllData = () => {
    const userEmail = getCurrentUserEmail();
    const userStorageKey = getUserStorageKey(userEmail);
    // Clear shared requests and user-specific data
    localStorage.removeItem(SHARED_REQUESTS_KEY);
    localStorage.removeItem(userStorageKey);
    // Clear user accounts and sessions 
    localStorage.removeItem('inspect_now_users');
    localStorage.removeItem('inspect_now_session');
    
    setStore({
      requests: [],
      inspectorProfile: DEFAULT_INSPECTOR_PROFILE,
      allInspectorProfiles: []
    });
  };

  // Save to localStorage whenever store changes
  useEffect(() => {
    const userEmail = getCurrentUserEmail();
    const userStorageKey = getUserStorageKey(userEmail);
    
    try {
      // Save shared requests (accessible to all users)
      const requestsJson = JSON.stringify(store.requests);
      localStorage.setItem(SHARED_REQUESTS_KEY, requestsJson);
      
      // Save user-specific data (profiles only)
      const userData = {
        inspectorProfile: store.inspectorProfile,
        allInspectorProfiles: store.allInspectorProfiles
      };
      const userDataJson = JSON.stringify(userData);
      localStorage.setItem(userStorageKey, userDataJson);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [store]);

  const addRequest = (requestData: Omit<Request, 'id' | 'createdAt' | 'interestCount' | 'interestedInspectorEmails'>) => {
    const newRequest: Request = {
      ...requestData,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      interestCount: 0,
      interestedInspectorEmails: []
    };
    
    try {
      const currentRequests = localStorage.getItem(SHARED_REQUESTS_KEY);
      const existingRequests = currentRequests ? JSON.parse(currentRequests) : [];
      const updatedRequests = [newRequest, ...existingRequests];
      
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      
      // Update state
      setStore(prev => ({
        ...prev,
        requests: updatedRequests
      }));
    } catch (error) {
      console.error('Error adding request:', error);
      // Fallback to regular state update if localStorage fails
      setStore(prev => ({
        ...prev,
        requests: [newRequest, ...prev.requests]
      }));
    }
    
    return newRequest.id;
  };

  const toggleInterest = (requestId: string, inspectorEmail: string) => {
    console.log('toggleInterest called for:', { requestId, inspectorEmail });
    
    // Direct localStorage manipulation to ensure persistence
    try {
      const currentData = localStorage.getItem(SHARED_REQUESTS_KEY);
      const parsed = currentData ? JSON.parse(currentData) : [];
      
      const updatedRequests = parsed.map((req: Request) => {
        if (req.id === requestId) {
          const isInterested = req.interestedInspectorEmails.includes(inspectorEmail);
          const interestedInspectorEmails = isInterested
            ? req.interestedInspectorEmails.filter((email: string) => email !== inspectorEmail)
            : [...req.interestedInspectorEmails, inspectorEmail];
          
          const updatedRequest = {
            ...req,
            interestedInspectorEmails,
            interestCount: interestedInspectorEmails.length
          };
          
          console.log('toggleInterest - Updated request:', {
            id: requestId,
            wasInterested: isInterested,
            nowInterested: !isInterested,
            newCount: interestedInspectorEmails.length,
            interestedInspectorEmails
          });
          
          return updatedRequest;
        }
        return req;
      });
      
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      console.log('toggleInterest - Direct localStorage save successful');
      
      // Force React to re-read from localStorage
      setStore(prev => ({
        ...prev,
        requests: updatedRequests
      }));
      console.log('toggleInterest - Forced store update');
      
    } catch (error) {
      console.error('toggleInterest - localStorage backup failed:', error);
    }
  };


  const updateInspectorProfile = (updates: Partial<InspectorProfile>) => {
    setStore(prev => {
      const updatedProfile = { ...prev.inspectorProfile, ...updates };
      // Also update in the all profiles list
      const updatedAllProfiles = prev.allInspectorProfiles.map(profile => 
        profile.email === updatedProfile.email ? updatedProfile : profile
      );
      
      return {
        ...prev,
        inspectorProfile: updatedProfile,
        allInspectorProfiles: updatedAllProfiles
      };
    });
  };

  // Set the current inspector profile by email (for login)
  const setCurrentInspectorProfile = (userEmail: string) => {
    const profile = getInspectorProfileByEmail(userEmail);
    if (profile) {
      setStore(prev => ({
        ...prev,
        inspectorProfile: profile
      }));
    }
  };

  const addInspectorProfile = (profile: InspectorProfile) => {
    setStore(prev => ({
      ...prev,
      allInspectorProfiles: [...prev.allInspectorProfiles.filter(p => p.email !== profile.email), profile]
    }));
    
    // Trigger a storage event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  };

  const getAllInspectorProfiles = () => {
    return store.allInspectorProfiles;
  };

  const getInspectorProfileByEmail = (email: string) => {
    return store.allInspectorProfiles.find(profile => profile.email === email);
  };

  // Remove inspector profile when account is deleted
  const removeInspectorProfile = (userEmail: string) => {
    console.log('removeInspectorProfile called for userEmail:', userEmail);
    
    // Direct localStorage manipulation to ensure persistence
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const parsed = currentData ? JSON.parse(currentData) : { requests: [], inspectorProfile: DEFAULT_INSPECTOR_PROFILE, allInspectorProfiles: [] };
      
      console.log('removeInspectorProfile - All profile emails:', parsed.allInspectorProfiles.map((p: InspectorProfile) => p.email));
      console.log('removeInspectorProfile - Looking for userEmail:', userEmail);
      
      // Remove the inspector profile
      const updatedProfiles = parsed.allInspectorProfiles.filter((profile: InspectorProfile) => {
        const shouldKeep = profile.email !== userEmail;
        console.log(`removeInspectorProfile - Profile ${profile.email}: ${shouldKeep ? 'KEEP' : 'REMOVE'}`);
        return shouldKeep;
      });
      
      console.log('removeInspectorProfile - Profiles before:', parsed.allInspectorProfiles.length);
      console.log('removeInspectorProfile - Profiles after:', updatedProfiles.length);
      
      const updatedData = {
        ...parsed,
        allInspectorProfiles: updatedProfiles
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('removeInspectorProfile - Direct localStorage save successful');
      
      // Force React to re-read from localStorage
      setStore(updatedData);
      console.log('removeInspectorProfile - Forced store update');
      
      // Trigger storage event to refresh the inspectors page
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
    } catch (error) {
      console.error('removeInspectorProfile - localStorage backup failed:', error);
    }
  };

  const getRequestById = (id: string) => {
    return store.requests.find(req => req.id === id);
  };

  const getMyInterests = () => {
    return store.requests.filter(req => 
      req.interestedInspectorEmails?.includes(store.inspectorProfile.email)
    );
  };

  // Create booking request from time slot
  const createBookingFromTimeSlot = (
    timeSlotId: string,
    inspectorId: string,
    clientData: {
      name: string;
      email: string;
      phone: string;
      address: string;
      cityZip: string;
      propertyType: 'House' | 'Townhome' | 'Condo';
      beds: number;
      baths: number;
      sqft?: number;
      notes?: string;
    }
  ) => {
    // Find the inspector and time slot
    const inspector = getInspectorProfileByEmail(inspectorId);
    const timeSlot = inspector?.availability?.timeSlots?.find((slot: any) => slot.id === timeSlotId);
    
    if (!inspector || !timeSlot) {
      throw new Error('Inspector or time slot not found');
    }


    // Create the request
    const newRequest: Request = {
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      type: 'client_request',
      targetInspectorEmail: inspectorId,
      client: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone
      },
      property: {
        address: clientData.address,
        cityZip: clientData.cityZip,
        type: clientData.propertyType,
        beds: clientData.beds,
        baths: clientData.baths,
        sqft: clientData.sqft
      },
      schedule: {
        preferredDate: `${timeSlot.date} ${timeSlot.startTime}-${timeSlot.endTime}`
      },
      notes: clientData.notes || `Booking request for ${timeSlot.date} ${timeSlot.startTime}-${timeSlot.endTime}`,
      interestCount: 1,
      interestedInspectorEmails: [inspectorId]
    };

    // Add the request using shared storage (same method as open requests)
    console.log('📋 [CLIENT BOOKING] Creating client request:', newRequest);
    try {
      const currentRequests = localStorage.getItem(SHARED_REQUESTS_KEY);
      const existingRequests = currentRequests ? JSON.parse(currentRequests) : [];
      const updatedRequests = [newRequest, ...existingRequests];
      localStorage.setItem(SHARED_REQUESTS_KEY, JSON.stringify(updatedRequests));
      console.log('📋 [CLIENT BOOKING] Saved to localStorage, total requests:', updatedRequests.length);
      
      // Update state
      setStore(prev => ({
        ...prev,
        requests: updatedRequests
      }));
      console.log('📋 [CLIENT BOOKING] Client request created successfully with ID:', newRequest.id);
    } catch (error) {
      console.error('📋 [CLIENT BOOKING] Error saving client request:', error);
      // Fallback to regular state update
      setStore(prev => ({
        ...prev,
        requests: [newRequest, ...prev.requests]
      }));
    }

    // Mark time slot as unavailable
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

    return newRequest.id;
  };

  // Create open request (not tied to specific inspector)
  const createOpenRequest = (clientData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    cityZip: string;
    propertyType: 'House' | 'Townhome' | 'Condo';
    beds: number;
    baths: number;
    sqft?: number;
    preferredDate: string;
    altDate?: string;
    budget?: number;
    notes?: string;
  }) => {
    const newRequest: Request = {
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      type: 'open_request', // This is an open request for all inspectors
      client: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone
      },
      property: {
        address: clientData.address,
        cityZip: clientData.cityZip,
        type: clientData.propertyType,
        beds: clientData.beds,
        baths: clientData.baths,
        sqft: clientData.sqft
      },
      schedule: {
        preferredDate: clientData.preferredDate,
        altDate: clientData.altDate
      },
      budget: clientData.budget,
      notes: clientData.notes || '',
      interestCount: 0,
      interestedInspectorEmails: []
    };

    // Add the request
    setStore(prev => ({
      ...prev,
      requests: [newRequest, ...prev.requests]
    }));

    return newRequest.id;
  };

  // Get requests created by a specific client (by email)
  const getClientRequests = (clientEmail: string) => {
    console.log('📋 [GET CLIENT REQUESTS] Looking for requests by email:', clientEmail);
    console.log('📋 [GET CLIENT REQUESTS] Total requests in store:', store.requests.length);
    console.log('📋 [GET CLIENT REQUESTS] All requests:', store.requests);
    
    // Show ALL requests created by this client (both open_request and client_request types)
    const clientRequests = store.requests.filter(req => {
      const emailMatch = req.client.email === clientEmail;
      const typeMatch = req.type === 'open_request' || req.type === 'client_request';
      console.log('📋 [GET CLIENT REQUESTS] Request check:', {
        requestId: req.id,
        requestEmail: req.client.email,
        clientEmail,
        emailMatch,
        type: req.type,
        typeMatch,
        finalMatch: emailMatch && typeMatch
      });
      return emailMatch && typeMatch;
    });
    
    console.log('📋 [GET CLIENT REQUESTS] Filtered results:', clientRequests.length, 'requests');
    console.log('📋 [GET CLIENT REQUESTS] Results:', clientRequests);
    
    return clientRequests;
  };

  // Update a request (only if it belongs to the client)
  const updateRequest = (requestId: string, clientEmail: string, updates: Partial<Omit<Request, 'id' | 'createdAt'>>) => {
    const request = store.requests.find(r => r.id === requestId);
    if (!request || request.client.email !== clientEmail) {
      throw new Error('Request not found or unauthorized');
    }

    setStore(prev => ({
      ...prev,
      requests: prev.requests.map(req =>
        req.id === requestId ? { ...req, ...updates } : req
      )
    }));
  };

  // Delete a request (only if it belongs to the client)
  const deleteRequest = (requestId: string, clientEmail: string) => {
    const request = store.requests.find(r => r.id === requestId);
    if (!request || request.client.email !== clientEmail) {
      throw new Error('Request not found or unauthorized');
    }

    setStore(prev => ({
      ...prev,
      requests: prev.requests.filter(req => req.id !== requestId)
    }));

    // If it was a client_request, mark the time slot as available again
    if (request.type === 'client_request' && request.targetInspectorEmail) {
      setStore(prev => ({
        ...prev,
        allInspectorProfiles: prev.allInspectorProfiles.map(profile => {
          if (profile.email === request.targetInspectorEmail && profile.availability?.timeSlots) {
            return {
              ...profile,
              availability: {
                ...profile.availability,
                timeSlots: profile.availability.timeSlots.map(slot => {
                  // Check if this slot matches the request's preferred date/time
                  const preferredDateTime = request.schedule.preferredDate;
                  const slotDateTime = `${slot.date} ${slot.startTime}-${slot.endTime}`;
                  return slotDateTime === preferredDateTime ? { ...slot, available: true } : slot;
                })
              }
            };
          }
          return profile;
        })
      }));
    }
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
    clearAllData,
    createBookingFromTimeSlot,
    createOpenRequest,
    getClientRequests,
    updateRequest,
    deleteRequest,
    debugLocalStorage
  };
}