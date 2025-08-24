import { useState, useEffect } from 'react';

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

export function useLocalStore() {
  const [store, setStore] = useState<LocalStore>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Migrate old incompatible data format without losing valid data
        let needsMigration = false;
        
        // Fix inspector profile if needed
        if (parsed.inspectorProfile?.id && !parsed.inspectorProfile.email) {
          needsMigration = true;
          parsed.inspectorProfile = DEFAULT_INSPECTOR_PROFILE;
        }
        
        // Fix requests if needed - filter out old format, keep new format
        if (parsed.requests) {
          const migratedRequests = parsed.requests.filter((r: any) => 
            r.interestedInspectorEmails && !r.interestedInspectorIds &&
            (!r.targetInspectorId || r.targetInspectorEmail)
          );
          if (migratedRequests.length !== parsed.requests.length) {
            needsMigration = true;
            parsed.requests = migratedRequests;
          }
        }
        
        if (needsMigration) {
          console.log('Migrated data to new format, keeping valid requests');
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    // Start with completely empty data
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
  };

  // Save to localStorage whenever store changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [store]);

  const addRequest = (requestData: Omit<Request, 'id' | 'createdAt' | 'interestCount' | 'interestedInspectorEmails'>) => {
    // Use email-based identification: client email + timestamp for uniqueness  
    const requestId = `${requestData.client.email}_${Date.now()}`;
    const newRequest: Request = {
      ...requestData,
      id: requestId,
      createdAt: new Date().toISOString(),
      interestCount: 0,
      interestedInspectorEmails: []
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

  const toggleInterest = (requestId: string, inspectorEmail: string) => {
    console.log('toggleInterest called for:', { requestId, inspectorEmail });
    
    // Direct localStorage manipulation to ensure persistence
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const parsed = currentData ? JSON.parse(currentData) : { requests: [], inspectorProfile: DEFAULT_INSPECTOR_PROFILE, allInspectorProfiles: [] };
      
      const updatedRequests = parsed.requests.map((req: Request) => {
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
    inspectorEmail: string,
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
    const inspector = getInspectorProfileByEmail(inspectorEmail);
    const timeSlot = inspector?.availability?.timeSlots?.find((slot: any) => slot.id === timeSlotId);
    
    if (!inspector || !timeSlot) {
      throw new Error('Inspector or time slot not found');
    }

    // Use email-based identification for the booking request
    const requestId = `${clientData.email}_booking_${Date.now()}`;
    // Create the request
    const newRequest: Request = {
      id: requestId,
      createdAt: new Date().toISOString(),
      status: 'open',
      type: 'client_request',
      targetInspectorEmail: inspectorEmail,
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
      interestedInspectorEmails: [inspectorEmail]
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
        if (profile.email === inspectorEmail && profile.availability?.timeSlots) {
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
    // Show ALL requests created by this client (both open_request and client_request types)
    const clientRequests = store.requests.filter(req => 
      req.client.email === clientEmail && 
      (req.type === 'open_request' || req.type === 'client_request')
    );
    
    
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
    deleteRequest
  };
}