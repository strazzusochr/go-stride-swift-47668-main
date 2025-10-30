import { useState, useEffect } from "react";
import { Plus, Trash2, Check, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { z } from "zod";

const workoutSchema = z.object({
  reps: z.number().int().min(1, "Mindestens 1 Wiederholung").max(500, "Maximum 500 Wiederholungen"),
  weight: z.number().min(0, "Gewicht muss positiv sein").max(1000, "Maximum 1000 kg"),
});

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  exercises: {
    name: string;
    sets: { reps: number; weight: number; completed: boolean }[];
  }[];
  totalSets: number;
  completedSets: number;
  totalVolume: number;
}

const EXERCISE_LIBRARY = {
  "Brust": [
    "Bankdrücken Langhantel",
    "Bankdrücken Kurzhantel",
    "Schrägbankdrücken",
    "Fliegende Kurzhantel",
    "Butterfly",
    "Dips (Brust)",
  ],
  "Rücken": [
    "Klimmzüge breit",
    "Klimmzüge eng",
    "Langhantelrudern",
    "Kurzhantelrudern einarmig",
    "T-Bar Rudern",
    "Latzug breit",
    "Latzug eng",
    "Kreuzheben",
    "Rumänisches Kreuzheben",
    "Hyperextensions",
  ],
  "Schultern": [
    "Überkopfdrücken Langhantel",
    "Schulterdrücken Kurzhantel",
    "Seitheben",
    "Frontheben",
    "Facepulls",
    "Reverse Flys",
    "Arnold Press",
  ],
  "Nacken/Trapez": [
    "Shrugs Langhantel",
    "Shrugs Kurzhantel",
    "Nackenziehen",
  ],
  "Arme": [
    "Bizeps Curls Langhantel",
    "Bizeps Curls Kurzhantel",
    "Hammercurls",
    "Konzentrationscurls",
    "Trizeps Dips",
    "Trizepsdrücken am Kabel",
    "French Press",
    "Kickbacks",
    "Unterarm Curls",
    "Reverse Curls",
  ],
  "Bauch/Core": [
    "Crunches",
    "Beinheben hängend",
    "Planks",
    "Side Planks",
    "Russian Twists",
    "Cable Crunches",
    "Ab Wheel Rollouts",
  ],
  "Beine": [
    "Kniebeugen",
    "Front Squats",
    "Beinpresse",
    "Ausfallschritte",
    "Beinstrecker",
    "Beinbeuger liegend",
    "Beinbeuger sitzend",
    "Wadenheben stehend",
    "Wadenheben sitzend",
    "Hip Thrusts",
    "Bulgarian Split Squats",
    "Adduktoren",
    "Abduktoren",
  ],
};

const WorkoutTracker = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseSelect, setShowExerciseSelect] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Start workout timer when first exercise is added
  useEffect(() => {
    if (exercises.length > 0 && !workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
  }, [exercises.length, workoutStartTime]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWorkoutDuration = () => {
    if (!workoutStartTime) return "00:00:00";
    const diff = currentTime.getTime() - workoutStartTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const addExercise = (name: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      sets: [{ id: Date.now().toString(), reps: 0, weight: 0, completed: false }],
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseSelect(false);
    toast.success(`${name} hinzugefügt`);
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [...ex.sets, { id: Date.now().toString(), reps: 0, weight: 0, completed: false }],
            }
          : ex
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: "reps" | "weight", value: number) => {
    // Validate the input
    const result = workoutSchema.shape[field].safeParse(value);
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
            }
          : ex
      )
    );
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, completed: !set.completed } : set
              ),
            }
          : ex
      )
    );
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
    toast.success("Übung entfernt");
  };

  const finishWorkout = () => {
    if (!workoutStartTime) return;

    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    // Calculate total volume
    const totalVolume = exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((setSum, set) => {
        return setSum + (set.completed ? set.reps * set.weight : 0);
      }, 0);
    }, 0);

    // Save workout to history
    const workoutSession: WorkoutSession = {
      id: Date.now().toString(),
      date: format(workoutStartTime, "yyyy-MM-dd"),
      startTime: format(workoutStartTime, "HH:mm"),
      endTime: format(new Date(), "HH:mm"),
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: s.completed }))
      })),
      totalSets,
      completedSets,
      totalVolume,
    };

    // Load existing history and add new workout
    const stored = localStorage.getItem("workoutHistory");
    const history: WorkoutSession[] = stored ? JSON.parse(stored) : [];
    history.push(workoutSession);
    localStorage.setItem("workoutHistory", JSON.stringify(history));

    toast.success(`Training gespeichert! ${completedSets}/${totalSets} Sätze, ${totalVolume}kg Volumen`);
    
    // Reset workout
    setExercises([]);
    setWorkoutStartTime(null);
  };

  const resetWorkout = () => {
    setExercises([]);
    setWorkoutStartTime(null);
    toast.success("Training zurückgesetzt");
  };

  return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Training</h2>
        <div className="flex gap-2">
          {exercises.length > 0 && (
            <Button onClick={resetWorkout} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={() => setShowExerciseSelect(!showExerciseSelect)} size="sm" className="glow-neon">
            <Plus className="w-4 h-4 mr-2" />
            Übung hinzufügen
          </Button>
        </div>
      </div>

      {/* Workout Timer */}
      {workoutStartTime && exercises.length > 0 && (
        <Card className="p-4 bg-gradient-metal border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Trainingsdauer</span>
            </div>
            <div className="text-2xl font-bold font-mono text-neon">
              {getWorkoutDuration()}
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Gestartet um {format(workoutStartTime, "HH:mm")} Uhr
          </div>
        </Card>
      )}

      {showExerciseSelect && (
        <Card className="p-4 bg-secondary border-accent/20">
          <h3 className="font-bold mb-3 text-sm text-muted-foreground">Übung nach Muskelgruppe auswählen</h3>
          <Tabs defaultValue="Brust" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="Brust">Brust</TabsTrigger>
              <TabsTrigger value="Rücken">Rücken</TabsTrigger>
              <TabsTrigger value="Schultern">Schultern</TabsTrigger>
              <TabsTrigger value="Nacken/Trapez">Nacken</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="Arme">Arme</TabsTrigger>
              <TabsTrigger value="Bauch/Core">Bauch</TabsTrigger>
              <TabsTrigger value="Beine">Beine</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[300px] w-full pr-4">
              {Object.entries(EXERCISE_LIBRARY).map(([group, exercises]) => (
                <TabsContent key={group} value={group} className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {exercises.map((exercise) => (
                      <Button
                        key={exercise}
                        variant="secondary"
                        size="sm"
                        onClick={() => addExercise(exercise)}
                        className="text-xs h-auto py-2 px-3"
                      >
                        {exercise}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </Card>
      )}

      {exercises.length === 0 ? (
        <Card className="p-12 text-center bg-card/50">
          <p className="text-muted-foreground">Noch keine Übungen. Füge eine hinzu um zu starten!</p>
        </Card>
      ) : (
        <>
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="p-4 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExercise(exercise.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8 text-muted-foreground">#{index + 1}</span>
                    <Input
                      type="number"
                      placeholder="Wdh"
                      min="1"
                      max="500"
                      value={set.reps || ""}
                      onChange={(e) =>
                        updateSet(exercise.id, set.id, "reps", parseInt(e.target.value) || 0)
                      }
                      className="w-20 text-center"
                    />
                    <span className="text-muted-foreground">×</span>
                    <Input
                      type="number"
                      placeholder="kg"
                      min="0"
                      max="1000"
                      step="0.5"
                      value={set.weight || ""}
                      onChange={(e) =>
                        updateSet(exercise.id, set.id, "weight", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 text-center"
                    />
                    <Button
                      size="sm"
                      variant={set.completed ? "default" : "outline"}
                      onClick={() => toggleSetComplete(exercise.id, set.id)}
                      className={set.completed ? "glow-neon" : ""}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => addSet(exercise.id)}
                className="w-full mt-3 text-primary"
              >
                + Satz hinzufügen
              </Button>
            </Card>
          ))}

          <Button onClick={finishWorkout} className="w-full glow-neon" size="lg">
            Training beenden
          </Button>
        </>
      )}
    </div>
  );
};

export default WorkoutTracker;
