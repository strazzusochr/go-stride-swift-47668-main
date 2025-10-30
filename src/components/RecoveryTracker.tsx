import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Heart, Moon, Zap, Activity, Save } from "lucide-react";
import { format } from "date-fns";

interface RecoveryLog {
  id: string;
  date: string;
  sleep_hours: number | null;
  mood: number | null;
  stress_level: number | null;
  resting_hr: number | null;
  hrv: number | null;
  notes: string | null;
}

export default function RecoveryTracker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [todayLog, setTodayLog] = useState<RecoveryLog | null>(null);
  
  // Form state
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [mood, setMood] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [restingHR, setRestingHR] = useState<string>("");
  const [hrv, setHrv] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadTodayLog();
    }
  }, [user]);

  const loadTodayLog = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("recovery_logs")
        .select("*")
        .eq("user_id", user?.id)
        .eq("date", today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTodayLog(data);
        setSleepHours(data.sleep_hours || 7);
        setMood(data.mood || 7);
        setStressLevel(data.stress_level || 5);
        setRestingHR(data.resting_hr?.toString() || "");
        setHrv(data.hrv?.toString() || "");
        setNotes(data.notes || "");
      }
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const logData = {
        user_id: user.id,
        date: today,
        sleep_hours: sleepHours,
        mood,
        stress_level: stressLevel,
        resting_hr: restingHR ? parseInt(restingHR) : null,
        hrv: hrv ? parseInt(hrv) : null,
        notes: notes.trim() || null,
      };

      if (todayLog) {
        // Update existing
        const { error } = await supabase
          .from("recovery_logs")
          .update(logData)
          .eq("id", todayLog.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("recovery_logs")
          .insert([logData]);

        if (error) throw error;
      }

      toast({ title: "Erfolg", description: "Recovery-Daten gespeichert!" });
      loadTodayLog();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Recovery Tracking</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heutiges Recovery-Log</CardTitle>
          <CardDescription>Tracke Schlaf, Stimmung und Regeneration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sleep Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Schlaf
              </Label>
              <span className="text-sm font-medium">{sleepHours.toFixed(1)} Stunden</span>
            </div>
            <Slider
              value={[sleepHours]}
              onValueChange={([value]) => setSleepHours(value)}
              min={0}
              max={12}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Stimmung
              </Label>
              <span className="text-sm font-medium">{mood}/10</span>
            </div>
            <Slider
              value={[mood]}
              onValueChange={([value]) => setMood(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Schlecht</span>
              <span>Ausgezeichnet</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stress-Level</Label>
              <span className="text-sm font-medium">{stressLevel}/10</span>
            </div>
            <Slider
              value={[stressLevel]}
              onValueChange={([value]) => setStressLevel(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Entspannt</span>
              <span>Sehr gestresst</span>
            </div>
          </div>

          {/* Resting HR */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Ruhepuls (optional)
            </Label>
            <Input
              type="number"
              placeholder="z.B. 60"
              value={restingHR}
              onChange={(e) => setRestingHR(e.target.value)}
              min={30}
              max={200}
            />
          </div>

          {/* HRV */}
          <div className="space-y-2">
            <Label>HRV - Herzfrequenzvariabilität (optional)</Label>
            <Input
              type="number"
              placeholder="z.B. 45"
              value={hrv}
              onChange={(e) => setHrv(e.target.value)}
              min={0}
              max={300}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notizen</Label>
            <Textarea
              placeholder="Wie fühlst du dich heute? Schmerzen, Verletzungen, Energie..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Speichere..." : "Recovery-Log speichern"}
          </Button>
        </CardContent>
      </Card>

      {todayLog && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recovery Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Schlafqualität:</span>
                <span className="font-medium">{sleepHours >= 7 ? "Gut" : "Verbesserbar"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mental:</span>
                <span className="font-medium">
                  {mood >= 7 ? "Hervorragend" : mood >= 5 ? "Gut" : "Niedrig"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stress:</span>
                <span className="font-medium">
                  {stressLevel <= 4 ? "Niedrig" : stressLevel <= 7 ? "Moderat" : "Hoch"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
