import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  userProfile: any | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  userProfile: null,
  login: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  logout: () => {},
  signInWithGoogle: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (data) {
        setUserProfile(data);
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newUser, error: createError } = await supabase
          .from('profiles')
          .insert([
            { id: uid, name: user?.user_metadata?.full_name || 'Usuário', email: user?.email, plan: 'Pro' }
          ])
          .select()
          .single();
        
        if (newUser) setUserProfile(newUser);
        if (createError) console.error("Error creating profile:", createError);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error("Error signing in with Google:", error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, userProfile, login, signUp, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
