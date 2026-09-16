"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import { Profile, UserRole } from "@/lib/types/database";

interface SignUpMetadata {
  full_name: string;
  role: UserRole;
  shop_name?: string;
  market_location?: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any | null }>;
  signUpWithPassword: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: any | null }>;
  signInWithOtp: (email: string, role?: UserRole) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>("owner");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  const supabase = createClient();

  // Inspect environment variables
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || url.includes("placeholder") || !anonKey || anonKey.includes("placeholder")) {
      setIsConfigured(false);
    }
  }, []);

  // Sync active Supabase session & fetch live profile
  useEffect(() => {
    const syncSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Session check error:", error.message);
        }

        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
            setRole(profileData.role);
          } else {
            // Fallback profile from user metadata if table row is pending trigger
            const metaRole = (session.user.user_metadata?.role as UserRole) || "owner";
            const fallbackProf: Profile = {
              id: session.user.id,
              role: metaRole,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
              shop_name: session.user.user_metadata?.shop_name,
              market_location: session.user.user_metadata?.market_location,
              is_verified: false,
              created_at: session.user.created_at,
              updated_at: session.user.created_at,
            };
            setProfile(fallbackProf);
            setRole(metaRole);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn("Supabase auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    syncSession();

    // Listen to live auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
            setRole(profileData.role);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch {
      setIsLoading(false);
    }
  }, [supabase]);

  // Direct Email + Password Sign In
  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      setUser(data.user);
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setRole(profileData.role);
        }
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err };
    }
  };

  // Direct Email + Password Sign Up
  const signUpWithPassword = async (email: string, password: string, metadata: SignUpMetadata) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name,
            role: metadata.role,
            shop_name: metadata.shop_name || null,
            market_location: metadata.market_location || null,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        // Create profile record if not auto-created by trigger
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            role: metadata.role,
            full_name: metadata.full_name,
            shop_name: metadata.shop_name || null,
            market_location: metadata.market_location || null,
            is_verified: false,
          });
        } catch {
          // Trigger fallback
        }

        const newProfile: Profile = {
          id: data.user.id,
          role: metadata.role,
          full_name: metadata.full_name,
          shop_name: metadata.shop_name,
          market_location: metadata.market_location,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(newProfile);
        setRole(metadata.role);
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err };
    }
  };

  // Magic Link / OTP Sign In
  const signInWithOtp = async (email: string, targetRole: UserRole = "owner") => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { role: targetRole },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard/devices` : undefined,
        },
      });
      setIsLoading(false);
      return { error };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setUser(null);
    setProfile(null);
    setRole("owner");
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isConfigured,
        signInWithPassword,
        signUpWithPassword,
        signInWithOtp,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
