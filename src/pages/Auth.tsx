import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    await auth.signInWithOAuth({
      provider: "github",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Anmelden</h1>
        <p className="text-muted-foreground mb-6">Melden Sie sich an, um auf die App zuzugreifen.</p>
        <Button onClick={handleLogin}>Mit GitHub anmelden</Button>
      </div>
    </div>
  );
};

export default Auth;
