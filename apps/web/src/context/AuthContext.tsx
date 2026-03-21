'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export type UserRole = 'AUTHORITY' | 'OFFICER' | 'CITIZEN';

export interface EcoUser extends User {
  role?: UserRole;
  name?: string;
  lat?: number;
  lng?: number;
}

interface AuthContextType {
  user: EcoUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<EcoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const displayName = firebaseUser.displayName || '';
        const [name, roleStr, latStr, lngStr] = displayName.split('|');
        setUser({
          ...firebaseUser,
          role: (roleStr as UserRole) || 'CITIZEN',
          name: name || '',
          lat: latStr ? parseFloat(latStr) : undefined,
          lng: lngStr ? parseFloat(lngStr) : undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
