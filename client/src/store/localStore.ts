import { useState, useEffect } from 'react';

export interface Request {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'closed';
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
}

interface LocalStore {
  requests: Request[];
  inspectorProfile: InspectorProfile;
}

const DEFAULT_INSPECTOR_PROFILE: InspectorProfile = {
  id: 'demo_inspector_1',
  displayName: 'Ava Patel',
  serviceAreas: ['Irvine', 'Tustin'],
  specialties: ['Roof', 'Foundation'],
  basePrice: 350
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
      inspectorProfile: DEFAULT_INSPECTOR_PROFILE
    };
  });

  // Load example requests on first run
  useEffect(() => {
    if (store.requests.length === 0) {
      fetch('/src/data/requests.example.json')
        .then(response => response.json())
        .then(data => {
          if (data.requests) {
            setStore(prev => ({ ...prev, requests: data.requests }));
          }
        })
        .catch(error => console.error('Error loading example requests:', error));
    }
  }, [store.requests.length]);

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
    
    setStore(prev => ({
      ...prev,
      requests: [newRequest, ...prev.requests]
    }));
    
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
    setStore(prev => ({
      ...prev,
      inspectorProfile: { ...prev.inspectorProfile, ...updates }
    }));
  };

  const getRequestById = (id: string) => {
    return store.requests.find(req => req.id === id);
  };

  const getMyInterests = () => {
    return store.requests.filter(req => 
      req.interestedInspectorIds.includes(store.inspectorProfile.id)
    );
  };

  return {
    requests: store.requests,
    inspectorProfile: store.inspectorProfile,
    addRequest,
    toggleInterest,
    updateInspectorProfile,
    getRequestById,
    getMyInterests
  };
}