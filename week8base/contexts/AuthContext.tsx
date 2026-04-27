import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up the listener
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      const errorMessage = err.message || 'Sign up failed';
      setError(errorMessage);
      throw err;
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      const errorMessage = err.message || 'Sign in failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      setError(null);
      if (user) {
        await deleteUser(user);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Account deletion failed';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, logout, deleteAccount }}>
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
