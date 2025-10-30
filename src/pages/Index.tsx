import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, TrendingUp, Utensils, Timer, Target, Award, Calendar, BookOpen, Heart, LogOut, Layout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import WorkoutTracker from "@/components/WorkoutTracker";
import ProgressDashboard from "@/components/ProgressDashboard";
import NutritionPlanner from "@/components/NutritionPlanner";
import Stopwatch from "@/components/Stopwatch";
import WorkoutHistory from "@/components/WorkoutHistory";
import ExerciseDatabase from "@/components/ExerciseDatabase";
import RecoveryTracker from "@/components/RecoveryTracker";
import TemplateManager from "@/components/TemplateManager";

type Tab = "home" | "workout" | "progress" | "nutrition" | "history" | "exercises" | "recovery" | "templates";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("home");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lädt...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-gradient-neon flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-background" />
              </div>
              <h1 className="text-2xl font-bold text-neon">IronReign</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Abmelden</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "home" && <HomeView onNavigate={setActiveTab} />}
        {activeTab === "workout" && <WorkoutTracker />}
        {activeTab === "progress" && <ProgressDashboard />}
        {activeTab === "nutrition" && <NutritionPlanner />}
        {activeTab === "history" && <WorkoutHistory />}
        {activeTab === "exercises" && <ExerciseDatabase />}
        {activeTab === "recovery" && <RecoveryTracker />}
        {activeTab === "templates" && <TemplateManager />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-3 min-w-max md:grid md:grid-cols-8">
            <NavButton
              icon={<Dumbbell className="w-5 h-5" />}
              label="Start"
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavButton
              icon={<Timer className="w-5 h-5" />}
              label="Training"
              active={activeTab === "workout"}
              onClick={() => setActiveTab("workout")}
            />
            <NavButton
              icon={<Calendar className="w-5 h-5" />}
              label="Kalender"
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            />
            <NavButton
              icon={<TrendingUp className="w-5 h-5" />}
              label="Fortschritt"
              active={activeTab === "progress"}
              onClick={() => setActiveTab("progress")}
            />
            <NavButton
              icon={<Utensils className="w-5 h-5" />}
              label="Ernährung"
              active={activeTab === "nutrition"}
              onClick={() => setActiveTab("nutrition")}
            />
            <NavButton
              icon={<BookOpen className="w-5 h-5" />}
              label="Übungen"
              active={activeTab === "exercises"}
              onClick={() => setActiveTab("exercises")}
            />
            <NavButton
              icon={<Heart className="w-5 h-5" />}
              label="Recovery"
              active={activeTab === "recovery"}
              onClick={() => setActiveTab("recovery")}
            />
            <NavButton
              icon={<Layout className="w-5 h-5" />}
              label="Templates"
              active={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

const HomeView = ({ onNavigate }: { onNavigate: (tab: Tab) => void }) => {
  return (
    <div className="pb-24 space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden gradient-metal p-8 border-accent/20">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-neon">Willkommen zurück, Krieger</h2>
          <p className="text-muted-foreground mb-6">Bereit, deine Grenzen zu sprengen?</p>
          <Button onClick={() => onNavigate("workout")} className="bg-primary hover:bg-primary/90 text-background font-bold glow-neon">
            Training starten
          </Button>
        </div>
      </Card>

      {/* Stopwatch */}
      <Stopwatch />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<Target />} label="Diese Woche" value="5 Trainings" />
        <StatCard icon={<Award />} label="Gesamtvolumen" value="12.450 kg" />
      </div>

      {/* Feature Cards */}
      <div className="space-y-4">
        <FeatureCard
          icon={<Timer className="w-6 h-6" />}
          title="Trainings-Tracker"
          description="Erfasse Übungen, Sätze, Wiederholungen und tracke dein Trainingsvolumen"
          onClick={() => onNavigate("workout")}
        />
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Fortschritts-Analyse"
          description="Visualisiere deinen Kraftzuwachs und Muskelaufbau"
          onClick={() => onNavigate("progress")}
        />
        <FeatureCard
          icon={<Utensils className="w-6 h-6" />}
          title="Ernährungsplaner"
          description="Berechne Makros und plane Mahlzeiten für optimalen Muskelaufbau"
          onClick={() => onNavigate("nutrition")}
        />
      </div>
    </div>
  );
};

const NavButton = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card className="p-4 bg-secondary/50 border-border">
    <div className="flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  </Card>
);

const FeatureCard = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <Card
    className="p-5 hover:border-primary/50 transition-all cursor-pointer bg-card"
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      <div className="text-primary mt-1">{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </Card>
);

export default Index;
