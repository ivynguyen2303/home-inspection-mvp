import { useState, useEffect } from 'react';

export interface Request {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'closed';
  type: 'client_request' | 'open_request';
  targetInspectorId?: string; // Only for client_request type
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
  interestedInspectorIds: string[];
}

export interface InspectorProfile {
  id: string;
  displayName: string;
  serviceAreas: string[];
  specialties: string[];
  basePrice: number;
  email?: string;
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
  id: 'inspector_demo',
  displayName: 'Demo Inspector',
  serviceAreas: ['San Francisco', 'Oakland', 'San Jose', 'Palo Alto'],
  specialties: ['Foundation', 'Electrical', 'Plumbing', 'HVAC'],
  basePrice: 400
};

const STORAGE_KEY = 'inspect_now_store';

export function useLocalStore() {
  const [store, setStore] = useState<LocalStore>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    // Load initial data from example file
    return {
      requests: [],
      inspectorProfile: DEFAULT_INSPECTOR_PROFILE,
      allInspectorProfiles: []
    };
  });

  // Clear all data function
  const clearAllData = () => {
    // Clear inspector/request data
    localStorage.removeItem(STORAGE_KEY);
    // Clear user accounts and sessions 
    localStorage.removeItem('inspect_now_users');
    localStorage.removeItem('inspect_now_session');
    
    setStore({
      requests: [],
      inspectorProfile: DEFAULT_INSPECTOR_PROFILE,
      allInspectorProfiles: []
    });
    
    console.log('🧹 ALL DATA CLEARED!');
    console.log('- User accounts: cleared');
    console.log('- Sessions: cleared'); 
    console.log('- Inspector profiles: cleared');
    console.log('- Requests: cleared');
    
    // Force page refresh to show clean state
    window.location.reload();
  };

  // Save to localStorage whenever store changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [store]);

  const addRequest = (requestData: Omit<Request, 'id' | 'createdAt' | 'interestCount' | 'interestedInspectorIds'>) => {
    const newRequest: Request = {
      ...requestData,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      interestCount: 0,
      interestedInspectorIds: []
    };
    
    // Try direct localStorage manipulation as backup
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const parsed = currentData ? JSON.parse(currentData) : { requests: [], inspectorProfile: DEFAULT_INSPECTOR_PROFILE, allInspectorProfiles: [] };
      const updatedData = {
        ...parsed,
        requests: [newRequest, ...parsed.requests]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      // Force React to re-read from localStorage
      setStore(updatedData);
    } catch (error) {
      // Fallback to regular state update if localStorage fails
      setStore(prev => ({
        ...prev,
        requests: [newRequest, ...prev.requests]
      }));
    }
    
    return newRequest.id;
  };

  const toggleInterest = (requestId: string, inspectorId: string) => {
    console.log('toggleInterest called for:', { requestId, inspectorId });
    
    // Direct localStorage manipulation to ensure persistence
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const parsed = currentData ? JSON.parse(currentData) : { requests: [], inspectorProfile: DEFAULT_INSPECTOR_PROFILE, allInspectorProfiles: [] };
      
      const updatedRequests = parsed.requests.map((req: Request) => {
        if (req.id === requestId) {
          const isInterested = req.interestedInspectorIds.includes(inspectorId);
          const interestedInspectorIds = isInterested
            ? req.interestedInspectorIds.filter((id: string) => id !== inspectorId)
            : [...req.interestedInspectorIds, inspectorId];
          
          const updatedRequest = {
            ...req,
            interestedInspectorIds,
            interestCount: interestedInspectorIds.length
          };
          
          console.log('toggleInterest - Updated request:', {
            id: requestId,
            wasInterested: isInterested,
            nowInterested: !isInterested,
            newCount: interestedInspectorIds.length,
            interestedInspectorIds
          });
          
          return updatedRequest;
        }
        return req;
      });
      
      const updatedData = {
        ...parsed,
        requests: updatedRequests
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('toggleInterest - Direct localStorage save successful');
      
      // Force React to re-read from localStorage
      setStore(updatedData);
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
        profile.id === updatedProfile.id ? updatedProfile : profile
      );
      
      return {
        ...prev,
        inspectorProfile: updatedProfile,
        allInspectorProfiles: updatedAllProfiles
      };
    });
  };

  const addInspectorProfile = (profile: InspectorProfile) => {
    setStore(prev => ({
      ...prev,
      allInspectorProfiles: [...prev.allInspectorProfiles.filter(p => p.id !== profile.id), profile]
    }));
    
    // Trigger a storage event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  };

  const getAllInspectorProfiles = () => {
    return store.allInspectorProfiles;
  };

  const getInspectorProfileById = (id: string) => {
    return store.allInspectorProfiles.find(profile => profile.id === id);
  };

  // Remove inspector profile when account is deleted
  const removeInspectorProfile = (userId: string) => {
    console.log('removeInspectorProfile called for userId:', userId);
    
    // Direct localStorage manipulation to ensure persistence
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const parsed = currentData ? JSON.parse(currentData) : { requests: [], inspectorProfile: DEFAULT_INSPECTOR_PROFILE, allInspectorProfiles: [] };
      
      console.log('removeInspectorProfile - All profile IDs:', parsed.allInspectorProfiles.map((p: InspectorProfile) => p.id));
      console.log('removeInspectorProfile - Looking for userId:', userId);
      
      // Remove the inspector profile
      const updatedProfiles = parsed.allInspectorProfiles.filter((profile: InspectorProfile) => {
        const shouldKeep = profile.id !== userId;
        console.log(`removeInspectorProfile - Profile ${profile.id}: ${shouldKeep ? 'KEEP' : 'REMOVE'}`);
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
      req.interestedInspectorIds.includes(store.inspectorProfile.id)
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
    const inspector = getInspectorProfileById(inspectorId);
    const timeSlot = inspector?.availability?.timeSlots?.find(slot => slot.id === timeSlotId);
    
    if (!inspector || !timeSlot) {
      throw new Error('Inspector or time slot not found');
    }

    // Create the request
    const newRequest: Request = {
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      type: 'client_request',
      targetInspectorId: inspectorId,
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
      interestedInspectorIds: [inspectorId]
    };

    // Add the request
    setStore(prev => ({
      ...prev,
      requests: [newRequest, ...prev.requests]
    }));

    // Mark time slot as unavailable
    setStore(prev => ({
      ...prev,
      allInspectorProfiles: prev.allInspectorProfiles.map(profile => {
        if (profile.id === inspectorId && profile.availability?.timeSlots) {
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
      interestedInspectorIds: []
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
    return store.requests.filter(req => req.client.email === clientEmail);
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
    if (request.type === 'client_request' && request.targetInspectorId) {
      setStore(prev => ({
        ...prev,
        allInspectorProfiles: prev.allInspectorProfiles.map(profile => {
          if (profile.id === request.targetInspectorId && profile.availability?.timeSlots) {
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
    addInspectorProfile,
    getAllInspectorProfiles,
    getInspectorProfileById,
    removeInspectorProfile,
    getRequestById,
    getMyInterests,
    clearAllData,
    createBookingFromTimeSlot,
    createOpenRequest,
    getClientRequests,
    updateRequest,
    deleteRequest
  };
}