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
  hashPassword,
  generateUserId,
  initializeDemoAccounts
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
  const { updateInspectorProfile } = useLocalStore();

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize demo accounts and wait for completion
        await initializeDemoAccounts();
        
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

  const login = async (credentials: LoginCredentials): Promise<void> => {
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

      // Redirect based on role
      if (user.role === 'client') {
        setLocation('/inspectors');
      } else {
        setLocation('/requests');
      }
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
        updateInspectorProfile({
          id: user.id,
          displayName: data.name || user.email.split('@')[0],
          serviceAreas: [],
          specialties: [],
          basePrice: 400
        });
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

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateProfile
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