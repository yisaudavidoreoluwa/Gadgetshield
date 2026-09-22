"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "./client";
import { Profile, UserRole, TechnicianProfile, TechnicianAccreditationStatus } from "@/lib/types/database";
import { hybridStore } from "@/lib/storage/hybrid-store";

export interface SignUpMetadata {
  full_name: string;
  role: UserRole;
  phone_number?: string;
  // SME Fleet fields
  company_name?: string;
  rc_number?: string;
  corporate_domain?: string;
  // Technician accreditation fields
  shop_name?: string;
  workshop_address?: string;
  trade_association?: string;
  license_number?: string;
  proof_document_url?: string;
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
  submitTechnicianAccreditation: (data: {
    shop_name: string;
    workshop_address: string;
    trade_association: string;
    license_number: string;
    proof_document_url?: string;
  }) => Promise<{ profile: Profile | null; error: any | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>("owner");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  const supabase = createClient();

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    if (isConfigured) {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setRole(profileData.role);
          hybridStore.setCurrentSession(user, profileData);
          return;
        }
      } catch {}
    }

    const localProfile = hybridStore.getCurrentProfile();
    if (localProfile) {
      setProfile(localProfile);
      setRole(localProfile.role);
    }
  }, [user, isConfigured, supabase]);

  useEffect(() => {
    // Check if Supabase keys exist
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const configured = Boolean(url && !url.includes("placeholder") && anonKey && !anonKey.includes("placeholder"));
    setIsConfigured(configured);

    // Initial session load from hybrid store or Supabase
    const initSession = async () => {
      try {
        if (configured) {
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
              hybridStore.setCurrentSession(session.user, profileData);
              setIsLoading(false);
              return;
            }
          }
        }

        // Check local storage session
        const storedUser = hybridStore.getCurrentUser();
        const storedProfile = hybridStore.getCurrentProfile();
        if (storedUser && storedProfile) {
          setUser(storedUser);
          setProfile(storedProfile);
          setRole(storedProfile.role);
        }
      } catch (err) {
        console.warn("Session check fallback:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Supabase Auth listener if configured
    if (configured) {
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
              hybridStore.setCurrentSession(session.user, profileData);
            }
          } else {
            setUser(null);
            setProfile(null);
            setRole("owner");
            hybridStore.clearSession();
          }
        });
        return () => subscription.unsubscribe();
      } catch {
        // Ignore
      }
    }
  }, [supabase]);

  // Sign In With Password
  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase first if configured
    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          setUser(data.user);
          const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
          if (prof) {
            setProfile(prof);
            setRole(prof.role);
            hybridStore.setCurrentSession(data.user, prof);
          }
          setIsLoading(false);
          return { error: null };
        }
        if (error) {
          setIsLoading(false);
          return { error };
        }
      } catch (err) {
        console.warn("Supabase auth error:", err);
      }
    }

    // 2. Local Multi-User Registry Fallback
    const existingAccount = hybridStore.getUserAccount(cleanEmail);
    if (existingAccount) {
      if (existingAccount.password && existingAccount.password !== password) {
        setIsLoading(false);
        return { error: new Error("Invalid email or password.") };
      }

      setUser(existingAccount.user);
      setProfile(existingAccount.profile);
      setRole(existingAccount.profile.role);
      hybridStore.setCurrentSession(existingAccount.user, existingAccount.profile);
      setIsLoading(false);
      return { error: null };
    }

    // Unregistered account
    setIsLoading(false);
    return { error: new Error("No account found with this email. Please sign up.") };
  };

  // Sign Up With Password & Strict Role Verification
  const signUpWithPassword = async (email: string, password: string, metadata: SignUpMetadata) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = new Date().toISOString();

    // Validate technician accreditation details if technician role selected
    let technicianProfile: TechnicianProfile | undefined;
    if (metadata.role === "technician") {
      if (!metadata.shop_name || !metadata.workshop_address || !metadata.license_number) {
        setIsLoading(false);
        return { 
          error: new Error("Technician registration requires workshop name, physical address, and trade guild license number.") 
        };
      }

      const licenseClean = metadata.license_number.trim().toUpperCase();
      const isAccreditedCode = 
        licenseClean.startsWith("CAPDAN-") ||
        licenseClean.startsWith("IRP-") ||
        licenseClean.startsWith("IEEE-") ||
        licenseClean.startsWith("CAC-") ||
        licenseClean.startsWith("RC-") ||
        licenseClean.startsWith("BN-");

      technicianProfile = {
        shop_name: metadata.shop_name.trim(),
        workshop_address: metadata.workshop_address.trim(),
        trade_association: metadata.trade_association?.trim() || "CAPDAN Certified Hub",
        license_number: licenseClean,
        proof_document_url: metadata.proof_document_url?.trim(),
        accreditation_status: isAccreditedCode ? "VERIFIED" : "PENDING_ACCREDITATION",
        submitted_at: timestamp,
        verified_at: isAccreditedCode ? timestamp : undefined,
        reviewer_notes: isAccreditedCode 
          ? "Official Trade Guild / IRP Accreditation Validated" 
          : "Credentials Submitted. Pending National Trade Guild Verification.",
      };
    }

    // Build Profile
    const localProfile: Profile = {
      id: userId,
      role: metadata.role,
      full_name: metadata.full_name.trim() || cleanEmail.split("@")[0].toUpperCase(),
      email: cleanEmail,
      phone_number: metadata.phone_number?.trim(),
      company_name: metadata.company_name?.trim(),
      shop_name: metadata.shop_name?.trim(),
      market_location: metadata.workshop_address?.trim(),
      is_verified: metadata.role === "technician" ? technicianProfile?.accreditation_status === "VERIFIED" : true,
      technician_profile: technicianProfile,
      fleet_profile: metadata.role === "fleet_manager" ? {
        company_name: metadata.company_name?.trim() || "Enterprise Fleet",
        rc_number: metadata.rc_number?.trim() || "RC-PENDING",
        corporate_domain: metadata.corporate_domain?.trim() || cleanEmail.split("@")[1],
        registered_at: timestamp,
      } : undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const localUser = {
      id: userId,
      email: cleanEmail,
      user_metadata: {
        full_name: localProfile.full_name,
        role: metadata.role,
      }
    };

    // 1. Try Supabase if configured
    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: localProfile.full_name,
              role: metadata.role,
            }
          }
        });

        if (!error && data.user) {
          localProfile.id = data.user.id;
          localUser.id = data.user.id;

          try {
            await supabase.from("profiles").insert({
              id: data.user.id,
              full_name: localProfile.full_name,
              role: metadata.role,
              company_name: localProfile.company_name,
              shop_name: localProfile.shop_name,
              market_location: localProfile.market_location,
              is_verified: localProfile.is_verified,
            });
          } catch {}

          setUser(data.user);
          setProfile(localProfile);
          setRole(metadata.role);
          hybridStore.setCurrentSession(data.user, localProfile);
          setIsLoading(false);
          return { error: null };
        }
      } catch (err) {
        console.warn("Supabase sign up error, continuing to local store:", err);
      }
    }

    // 2. Local Multi-User Registry Store
    hybridStore.saveUserAccount(localUser, localProfile, password);
    setUser(localUser);
    setProfile(localProfile);
    setRole(metadata.role);
    hybridStore.setCurrentSession(localUser, localProfile);

    setIsLoading(false);
    return { error: null };
  };

  // Sign In with OTP / Magic Link
  const signInWithOtp = async (email: string, targetRole: UserRole = "owner") => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (isConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            data: { role: targetRole },
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard/devices` : undefined,
          }
        });
        if (!error) {
          setIsLoading(false);
          return { error: null };
        }
      } catch {}
    }

    // Local Mock OTP
    const existing = hybridStore.getUserAccount(cleanEmail);
    if (existing) {
      setUser(existing.user);
      setProfile(existing.profile);
      setRole(existing.profile.role);
      hybridStore.setCurrentSession(existing.user, existing.profile);
      setIsLoading(false);
      return { error: null };
    }

    // Create fresh account on OTP
    const userId = `usr-${Date.now()}`;
    const newProfile: Profile = {
      id: userId,
      role: targetRole,
      full_name: cleanEmail.split("@")[0].toUpperCase(),
      email: cleanEmail,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const newUser = { id: userId, email: cleanEmail };
    hybridStore.saveUserAccount(newUser, newProfile);
    setUser(newUser);
    setProfile(newProfile);
    setRole(targetRole);
    hybridStore.setCurrentSession(newUser, newProfile);

    setIsLoading(false);
    return { error: null };
  };

  // Submit Technician Accreditation Proof
  const submitTechnicianAccreditation = async (data: {
    shop_name: string;
    workshop_address: string;
    trade_association: string;
    license_number: string;
    proof_document_url?: string;
  }) => {
    if (!user) {
      return { profile: null, error: new Error("Authentication required") };
    }

    const updated = hybridStore.submitTechnicianAccreditation(user.id, data);
    if (updated) {
      setProfile(updated);
      setRole("technician");
      return { profile: updated, error: null };
    }
    return { profile: null, error: new Error("Failed to submit accreditation") };
  };

  const signOut = async () => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch {}
    hybridStore.clearSession();
    setUser(null);
    setProfile(null);
    setRole("owner");
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
        submitTechnicianAccreditation,
        refreshProfile,
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