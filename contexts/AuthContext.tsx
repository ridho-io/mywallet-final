// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  loading: boolean; // Ini untuk loading sesi awal
  isGlobalLoading: boolean;
  setGlobalLoading: (isLoading: boolean, message?: string) => void;
  loadingMessage: string;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  isGlobalLoading: false,
  setGlobalLoading: () => {},
  loadingMessage: "Memproses...",
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memproses...");

  const setGlobalLoading = (isLoading: boolean, message: string = "Memproses...") => {
    setIsGlobalLoading(isLoading);
    if (isLoading) {
      setLoadingMessage(message);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    loading,
    isGlobalLoading,
    setGlobalLoading,
    loadingMessage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};