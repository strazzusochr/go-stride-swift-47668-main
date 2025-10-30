import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Layout, Plus, Dumbbell, Calendar } from "lucide-react";

interface WorkoutTemplate {
  id: string;
  name: string;
  split_type: string;
  days_per_week: number | null;
  periodization: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export default function TemplateManager() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getSplitLabel = (splitType: string) => {
    const labels: Record<string, string> = {
      full_body: "Ganzkörper",
      upper_lower: "OK/UK-Split",
      push_pull_legs: "Push/Pull/Legs",
      bro_split: "Bro-Split",
      custom: "Custom",
    };
    return labels[splitType] || splitType;
  };

  const getPeriodizationLabel = (periodization: string) => {
    const labels: Record<string, string> = {
      linear: "Linear",
      undulating: "Wellenförmig",
      block: "Block",
      dup: "DUP",
    };
    return labels[periodization] || periodization;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Trainings-Templates</h2>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Neu
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Layout className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Keine Templates gefunden</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Erstelle dein erstes Trainings-Template um strukturierte Workouts zu planen
              </p>
            </div>
            <div className="grid gap-3 max-w-md mx-auto">
              <Card className="p-4 text-left hover:border-primary transition-colors cursor-pointer">
                <h4 className="font-medium mb-1">🏋️ Ganzkörper (3x/Woche)</h4>
                <p className="text-xs text-muted-foreground">Ideal für Anfänger und Regeneration</p>
              </Card>
              <Card className="p-4 text-left hover:border-primary transition-colors cursor-pointer">
                <h4 className="font-medium mb-1">💪 OK/UK-Split (4x/Woche)</h4>
                <p className="text-xs text-muted-foreground">Perfekt für fortgeschrittene Athleten</p>
              </Card>
              <Card className="p-4 text-left hover:border-primary transition-colors cursor-pointer">
                <h4 className="font-medium mb-1">🔥 Push/Pull/Legs (6x/Woche)</h4>
                <p className="text-xs text-muted-foreground">Maximales Volumen für erfahrene Bodybuilder</p>
              </Card>
            </div>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description || "Kein Beschreibung"}
                      </CardDescription>
                    </div>
                    {template.is_public && (
                      <Badge variant="secondary">Öffentlich</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{getSplitLabel(template.split_type)}</span>
                      {template.days_per_week && (
                        <span className="text-muted-foreground"> • {template.days_per_week}x/Woche</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Periodisierung: {getPeriodizationLabel(template.periodization)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Bearbeiten
                    </Button>
                    <Button size="sm" className="flex-1">
                      Starten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
