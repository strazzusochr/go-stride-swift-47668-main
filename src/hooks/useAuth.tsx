import { useState, useEffect, createContext, useContext } from "react";
import { auth, User, Session } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check for existing session
      const { data: { session } } = await auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
      } else {
        // Sign in anonymously if no session
        const { data, error } = await auth.signInAnonymously();
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
