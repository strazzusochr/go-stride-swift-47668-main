import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

interface WorkoutSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  exercises: WorkoutExercise[];
  totalSets: number;
  completedSets: number;
  totalVolume: number;
}

const WorkoutHistory = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = () => {
    const stored = localStorage.getItem("workoutHistory");
    if (stored) {
      setWorkoutHistory(JSON.parse(stored));
    }
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return workoutHistory.filter((workout) => workout.date === dateStr);
  };

  const selectedDateWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : [];

  const hasWorkoutOnDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return workoutHistory.some((workout) => workout.date === dateStr);
  };

  const totalWorkouts = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0);
  const thisWeekWorkouts = workoutHistory.filter((w) => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  return (
    <div className="pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trainingskalender</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Automatische Zeiterfassung</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-1">Gesamt</p>
          <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">Trainings</p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-1">Diese Woche</p>
          <p className="text-2xl font-bold text-primary">{thisWeekWorkouts}</p>
          <p className="text-xs text-muted-foreground">Einheiten</p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-1">Volumen</p>
          <p className="text-2xl font-bold text-primary">{(totalVolume / 1000).toFixed(1)}t</p>
          <p className="text-xs text-muted-foreground">Gesamtgewicht</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-5 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Kalender</h3>
        </div>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={de}
          className={cn("rounded-md border pointer-events-auto")}
          modifiers={{
            workout: (date) => hasWorkoutOnDate(date),
          }}
          modifiersStyles={{
            workout: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: 'hsl(var(--primary))',
            },
          }}
        />
        
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Trainingstag</span>
          </div>
        </div>
      </Card>

      {/* Selected Date Workouts */}
      {selectedDate && (
        <Card className="p-5 bg-card">
          <h3 className="font-bold text-lg mb-4">
            {format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })}
          </h3>

          {selectedDateWorkouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Keine Trainingseinheiten an diesem Tag</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {selectedDateWorkouts.map((workout) => (
                  <Card
                    key={workout.id}
                    className="p-4 bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-mono">{workout.startTime}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-mono">{workout.endTime}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 transition-transform",
                          selectedWorkout?.id === workout.id && "rotate-90"
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary">
                        {workout.completedSets}/{workout.totalSets} Sätze
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span>{workout.totalVolume.toLocaleString()} kg</span>
                      </div>
                    </div>

                    {selectedWorkout?.id === workout.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        {workout.exercises.map((exercise, idx) => (
                          <div key={idx} className="space-y-2">
                            <h4 className="font-semibold text-sm">{exercise.name}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {exercise.sets.map((set, setIdx) => (
                                <div
                                  key={setIdx}
                                  className={cn(
                                    "text-xs p-2 rounded bg-background",
                                    set.completed ? "border-primary/50 border" : "border-border border"
                                  )}
                                >
                                  <span className="text-muted-foreground">Satz {setIdx + 1}: </span>
                                  <span className="font-medium">
                                    {set.reps}×{set.weight}kg
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      )}
    </div>
  );
};

export default WorkoutHistory;
