export type Role = "client" | "inspector";

export interface User {
  id: string;            // "usr_xxxx"
  email: string;
  passwordHash: string;  // store hash, not raw password
  role: Role;
  name?: string;
  phone?: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  role: Role;
  name?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'phone'>>) => Promise<void>;
}