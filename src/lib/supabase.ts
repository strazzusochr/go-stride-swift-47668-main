import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export { supabase };
export type { User, Session };

// Auth helpers
export const auth = {
  getSession: () => supabase.auth.getSession(),
  getUser: () => supabase.auth.getUser(),
  signUp: async (email: string, password: string, displayName?: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: displayName,
        },
      },
    });
  },
  signIn: (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },
  signInAnonymously: () => {
    return supabase.auth.signInAnonymously();
  },
  signOut: () => supabase.auth.signOut(),
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
