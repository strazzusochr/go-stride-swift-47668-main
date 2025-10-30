import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Dumbbell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: string;
  technique_cues: string[];
  contraindications: string[];
}

export default function ExerciseDatabase() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string>("all");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("all");

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("is_custom", false)
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || ex.primary_muscle === muscleFilter;
    const matchesEquipment = equipmentFilter === "all" || ex.equipment === equipmentFilter;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const muscleGroups = Array.from(new Set(exercises.map((ex) => ex.primary_muscle))).sort();
  const equipmentTypes = Array.from(new Set(exercises.map((ex) => ex.equipment))).sort();

  const getMuscleLabel = (muscle: string) => {
    const labels: Record<string, string> = {
      chest: "Brust",
      back: "Rücken",
      shoulders: "Schultern",
      biceps: "Bizeps",
      triceps: "Trizeps",
      forearms: "Unterarme",
      quads: "Quadrizeps",
      hamstrings: "Beinbeuger",
      glutes: "Gesäß",
      calves: "Waden",
      abs: "Bauch",
      obliques: "Seitliche Bauchmuskeln",
      lower_back: "Unterer Rücken",
      traps: "Trapezius",
      neck: "Nacken",
    };
    return labels[muscle] || muscle;
  };

  const getEquipmentLabel = (equipment: string) => {
    const labels: Record<string, string> = {
      barbell: "Langhantel",
      dumbbell: "Kurzhanteln",
      cable: "Kabel",
      machine: "Maschine",
      bodyweight: "Körpergewicht",
      resistance_band: "Widerstandsband",
      kettlebell: "Kettlebell",
      other: "Sonstige",
    };
    return labels[equipment] || equipment;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-500",
      intermediate: "bg-yellow-500",
      advanced: "bg-orange-500",
      elite: "bg-red-500",
    };
    return colors[difficulty] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Übungsdatenbank...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Übungsdatenbank</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Übung suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Muskelgruppe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Muskeln</SelectItem>
            {muscleGroups.map((muscle) => (
              <SelectItem key={muscle} value={muscle}>
                {getMuscleLabel(muscle)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Geräte</SelectItem>
            {equipmentTypes.map((equipment) => (
              <SelectItem key={equipment} value={equipment}>
                {getEquipmentLabel(equipment)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredExercises.length} von {exercises.length} Übungen
      </p>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getMuscleLabel(exercise.primary_muscle)}
                    </CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Equipment:</p>
                  <Badge variant="outline">{getEquipmentLabel(exercise.equipment)}</Badge>
                </div>

                {exercise.secondary_muscles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Sekundär:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondary_muscles.map((muscle, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {getMuscleLabel(muscle)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.technique_cues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Technik-Hinweise:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {exercise.technique_cues.slice(0, 3).map((cue, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exercise.contraindications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">Kontraindikationen:</p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.contraindications.join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
