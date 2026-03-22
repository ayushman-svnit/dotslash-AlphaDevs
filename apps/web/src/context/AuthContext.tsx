"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export type UserRole = 'AUTHORITY' | 'OFFICER' | 'CITIZEN';

export interface EcoUser extends User {
  role?: UserRole;
  name?: string;
  postingLat?: number;
  postingLng?: number;
  token?: string; // Cache the token
}

interface AuthContextType {
  user: EcoUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  getToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<EcoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Force a reload if displayName is missing (common right after signup)
        if (!firebaseUser.displayName) {
          try {
            await firebaseUser.reload();
          } catch (e) {
            console.error("Auth sync reload failed:", e);
          }
        }

        const displayName = firebaseUser.displayName || '';
        const parts = displayName.split('|');
        const name = parts[0] || '';
        const roleStr = (parts[1] || 'CITIZEN').toUpperCase();
        const role = roleStr as UserRole;


        
        let postingLat, postingLng;
        // The display name format was updated in signup to: name|ROLE|lat|lng
        if (parts[2] && parts[3]) {
          postingLat = parseFloat(parts[2]);
          postingLng = parseFloat(parts[3]);
        } else if (parts[2] && parts[2].includes(',')) {
          // Fallback to old format name|ROLE|lat,lng
          const [lat, lng] = parts[2].split(',');
          postingLat = parseFloat(lat);
          postingLng = parseFloat(lng);
        }

        const token = await getIdToken(firebaseUser);

        const ecoUser: EcoUser = {
          ...firebaseUser,
          role,
          name,
          postingLat,
          postingLng,
          token
        };
        setUser(ecoUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return await getIdToken(auth.currentUser, true);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
