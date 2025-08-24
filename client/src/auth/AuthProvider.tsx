import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/store/localStore';
import { 
  AuthContextType, 
  AuthState, 
  User, 
  LoginCredentials, 
  SignupData, 
  Session 
} from './types';
import {
  getSession,
  setSession,
  findUserById,
  findUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  hashPassword,
  generateUserId,
  clearAllUsers
} from './storage';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { updateInspectorProfile, addInspectorProfile, removeInspectorProfile, setCurrentInspectorProfile } = useLocalStore();

  // Initialize session on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const session = getSession();
        if (session) {
          const user = findUserById(session.userId);
          if (user) {
            setAuthState({ user, loading: false });
          } else {
            // Invalid session, clear it
            setSession(null);
            setAuthState({ user: null, loading: false });
          }
        } else {
          setAuthState({ user: null, loading: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({ user: null, loading: false });
      }
    };

    initAuth();
  }, []);

  // Auto-load inspector profile when inspector logs in
  useEffect(() => {
    if (authState.user && authState.user.role === 'inspector') {
      setCurrentInspectorProfile(authState.user.email);
    }
  }, [authState.user, setCurrentInspectorProfile]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      const user = findUserByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const passwordHash = await hashPassword(credentials.password);
      if (passwordHash !== user.passwordHash) {
        throw new Error('Invalid email or password');
      }

      const session: Session = {
        userId: user.id,
        createdAt: new Date().toISOString()
      };

      setSession(session);
      setAuthState({ user, loading: false });

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name || user.email}`,
      });

      // Return user info so the component can handle redirect
      return user;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    try {
      // Check if user already exists
      const existingUser = findUserByEmail(data.email);
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const passwordHash = await hashPassword(data.password);
      const user: User = {
        id: generateUserId(),
        email: data.email,
        passwordHash,
        role: data.role,
        name: data.name,
        phone: data.phone,
        createdAt: new Date().toISOString()
      };

      addUser(user);

      // If inspector role, initialize inspector profile
      if (data.role === 'inspector') {
        const inspectorProfile = {
          email: user.email,
          displayName: data.name || user.email.split('@')[0],
          serviceAreas: ['San Francisco Bay Area'],
          specialties: [],
          basePrice: 400,
          phone: data.phone,
          location: 'San Francisco, CA',
          bio: `Professional home inspector with expertise in residential property assessments.`,
          yearsExperience: 1,
          certifications: ['State Licensed'],
          rating: 5.0,
          reviewCount: 0,
          completedInspections: 0,
          image: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1560250097' : '1472099645'}-0b93528c311a?w=400&h=400&fit=crop&crop=face`,
          verified: true,
          availability: {
            nextAvailable: 'This week',
            responseTime: 'Within 4 hours',
            timeSlots: [
              { id: 'slot1', date: 'Mon Dec 30', startTime: '9:00 AM', endTime: '11:00 AM', available: true },
              { id: 'slot2', date: 'Mon Dec 30', startTime: '2:00 PM', endTime: '4:00 PM', available: true },
              { id: 'slot3', date: 'Tue Dec 31', startTime: '10:00 AM', endTime: '12:00 PM', available: true },
              { id: 'slot4', date: 'Wed Jan 1', startTime: '1:00 PM', endTime: '3:00 PM', available: true },
              { id: 'slot5', date: 'Thu Jan 2', startTime: '9:00 AM', endTime: '11:00 AM', available: true }
            ]
          },
          contact: {
            phone: data.phone || '(555) 123-4567',
            email: user.email
          },
          insurance: '$1M Professional Liability'
        };
        updateInspectorProfile(inspectorProfile);
        
        // Also add to the public directory using the store function
        addInspectorProfile(inspectorProfile);
      }

      // Create session
      const session: Session = {
        userId: user.id,
        createdAt: new Date().toISOString()
      };

      setSession(session);
      setAuthState({ user, loading: false });

      toast({
        title: "Account Created!",
        description: `Welcome to InspectNow, ${user.name || user.email}!`,
      });

      // Redirect based on role
      if (user.role === 'client') {
        setLocation('/inspectors');
      } else {
        setLocation('/requests');
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "An error occurred during signup",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = (): void => {
    setSession(null);
    setAuthState({ user: null, loading: false });
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    setLocation('/');
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'phone'>>): Promise<void> => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    try {
      updateUser(authState.user.id, updates);
      const updatedUser = { ...authState.user, ...updates };
      setAuthState({ user: updatedUser, loading: false });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    try {
      const userId = authState.user.id;
      
      // Remove user from auth storage
      deleteUser(userId);
      
      // ALSO remove inspector profile if they have one
      removeInspectorProfile(authState.user.email);
      
      // Clear session
      setSession(null);
      setAuthState({ user: null, loading: false });

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Redirect to landing page
      setLocation('/');
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}