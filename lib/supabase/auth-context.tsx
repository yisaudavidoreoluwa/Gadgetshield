"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import { Profile, UserRole } from "@/lib/types/database";

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  signInWithOtp: (email: string, role?: UserRole) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>({
    id: "tech-001",
    role: "technician",
    full_name: "Master Technician (Demo)",
    shop_name: "Apex Electronics Hub",
    market_location: "Cluster Slot 14",
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [role, setRole] = useState<UserRole>("technician");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const supabase = createClient();

  useEffect(() => {
    // Check if live Supabase is connected
    const checkUser = async () => {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
          const { data: { session } } = await supabase.auth.getSession();
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
          }
        }
      } catch (err) {
        console.warn("Using local auth state:", err);
      }
    };

    checkUser();

    // Listen to live auth changes
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            if (profileData) {
              setProfile(profileData);
              setRole(profileData.role);
            }
          }
        });
        return () => subscription.unsubscribe();
      }
    } catch {
      // Offline fallback
    }
  }, [supabase]);

  const signInWithOtp = async (email: string, targetRole: UserRole = "technician") => {
    setIsLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: { role: targetRole },
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
          },
        });
        setIsLoading(false);
        return { error };
      } else {
        // Mock demo immediate login
        setRole(targetRole);
        setUser({ id: "demo-user", email });
        setProfile({
          id: "demo-user",
          role: targetRole,
          full_name: email.split("@")[0].toUpperCase(),
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return { error: null };
      }
    } catch (err) {
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
    setRole("technician");
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
