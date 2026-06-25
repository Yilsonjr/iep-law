import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import type { UserProfile, UserRole } from '../types';

interface RolePermissions {
  canCreateContent: boolean;
  canEditAnyContent: boolean;
  canManageUsers: boolean;
  canGoLive: boolean;
  canViewDashboard: boolean;
}

interface AuthContextType extends RolePermissions {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  canEditContent: (authorId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canCreateContent: true,
    canEditAnyContent: true,
    canManageUsers: true,
    canGoLive: true,
    canViewDashboard: true,
  },
  pastor: {
    canCreateContent: true,
    canEditAnyContent: true,
    canManageUsers: true,
    canGoLive: true,
    canViewDashboard: true,
  },
  leader: {
    canCreateContent: true,
    canEditAnyContent: false,
    canManageUsers: false,
    canGoLive: false,
    canViewDashboard: true,
  },
  member: {
    canCreateContent: false,
    canEditAnyContent: false,
    canManageUsers: false,
    canGoLive: false,
    canViewDashboard: false,
  },
};

const noPermissions: RolePermissions = {
  canCreateContent: false,
  canEditAnyContent: false,
  canManageUsers: false,
  canGoLive: false,
  canViewDashboard: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Re-fetch profile when another admin changes this user's role/status
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profile-own-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, () => {
        fetchProfile(user.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    // El perfil se crea automáticamente via trigger en la base de datos
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const canEditContent = (authorId: string) => {
    if (!profile) return false;
    return profile.role === 'admin' || profile.role === 'pastor' || profile.id === authorId;
  };

  const permissions = profile ? rolePermissions[profile.role] : noPermissions;

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      canEditContent,
      ...permissions,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
