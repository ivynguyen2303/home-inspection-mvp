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
    localStorage.removeItem(STORAGE_KEY);
    setStore({
      requests: [],
      inspectorProfile: DEFAULT_INSPECTOR_PROFILE,
      allInspectorProfiles: []
    });
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
    console.log('addRequest called with:', requestData);
    const newRequest: Request = {
      ...requestData,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      interestCount: 0,
      interestedInspectorIds: []
    };
    console.log('Created new request:', newRequest);
    console.log('Current store before update:', store);
    
    // Create updated store data
    const updatedStore = {
      ...store,
      requests: [newRequest, ...store.requests]
    };
    console.log('Manual updated store:', updatedStore);
    
    // Save directly to localStorage FIRST
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStore));
      console.log('Saved to localStorage successfully');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    
    // Try multiple React state update approaches
    console.log('Trying approach 1: Direct object');
    setStore(updatedStore);
    
    setTimeout(() => {
      console.log('Trying approach 2: Functional update');
      setStore(prev => {
        console.log('Functional update prev:', prev);
        const result = { ...prev, requests: [newRequest, ...prev.requests] };
        console.log('Functional update result:', result);
        return result;
      });
    }, 10);
    
    setTimeout(() => {
      console.log('Trying approach 3: Force re-read from localStorage');
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Re-read from localStorage:', parsed);
          setStore(parsed);
        }
      } catch (error) {
        console.error('Failed to re-read:', error);
      }
    }, 50);
    
    setTimeout(() => {
      console.log('Final store check:', store);
    }, 200);
    
    return newRequest.id;
  };

  const toggleInterest = (requestId: string, inspectorId: string) => {
    setStore(prev => ({
      ...prev,
      requests: prev.requests.map(req => {
        if (req.id === requestId) {
          const isInterested = req.interestedInspectorIds.includes(inspectorId);
          const interestedInspectorIds = isInterested
            ? req.interestedInspectorIds.filter(id => id !== inspectorId)
            : [...req.interestedInspectorIds, inspectorId];
          
          return {
            ...req,
            interestedInspectorIds,
            interestCount: interestedInspectorIds.length
          };
        }
        return req;
      })
    }));
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
    console.log('getClientRequests - filtering for email:', clientEmail);
    console.log('getClientRequests - all requests:', store.requests);
    const filtered = store.requests.filter(req => req.client.email === clientEmail);
    console.log('getClientRequests - filtered results:', filtered);
    return filtered;
  };

  // Update a request (only if it belongs to the client)
  const updateRequest = (requestId: string, clientEmail: string, updates: Partial<Omit<Request, 'id' | 'createdAt' | 'client'>>) => {
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