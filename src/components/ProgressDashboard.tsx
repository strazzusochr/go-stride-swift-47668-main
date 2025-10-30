import { useState } from "react";
import { TrendingUp, Activity, Flame, Award, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const ProgressDashboard = () => {
  const [totalVolume, setTotalVolume] = useState("12.450 kg");
  const [volumeChange, setVolumeChange] = useState("+8%");
  const [workouts, setWorkouts] = useState("23");
  const [workoutsChange, setWorkoutsChange] = useState("+3");
  const [streak, setStreak] = useState("7 Tage");
  const [prs, setPrs] = useState("5");
  const [prsChange, setPrsChange] = useState("+2");
  const [volumePeriod, setVolumePeriod] = useState<"week" | "month" | "halfYear" | "year">("week");
  
  const [personalRecords, setPersonalRecords] = useState([
    { exercise: "Bankdrücken", weight: "120 kg", date: "Vor 2 Tagen" },
    { exercise: "Kniebeugen", weight: "180 kg", date: "Vor 1 Woche" },
    { exercise: "Kreuzheben", weight: "220 kg", date: "Vor 1 Woche" },
  ]);
  
  const [weeklyVolume, setWeeklyVolume] = useState([65, 80, 75, 90, 85, 95, 70]);
  const [monthlyVolume] = useState([70, 75, 80, 85, 88, 90, 85, 82, 87, 91, 89, 93, 88, 90, 92, 94, 91, 89, 87, 90, 92, 95, 93, 91, 88, 86, 89, 91, 93, 95]);
  const [halfYearVolume] = useState([65, 68, 72, 75, 78, 80, 82, 84, 86, 88, 87, 89, 90, 91, 89, 88, 90, 92, 91, 93, 94, 95, 93]);
  const [yearVolume] = useState([60, 65, 68, 70, 72, 75, 77, 80, 82, 84, 85, 87, 88, 89, 90, 91, 92, 93, 92, 91, 90, 92, 93, 94, 95, 94, 93, 92, 91, 93, 94, 95, 96, 95, 94, 93, 92, 94, 95, 96, 97, 96, 95, 94, 95, 96, 97, 98, 97, 96, 95, 96]);
  
  const [achievements, setAchievements] = useState([
    { title: "Volumen-Bestie", description: "20.000 kg Gesamtvolumen abgeschlossen", icon: "🏆" },
    { title: "Beständigkeits-König", description: "7-Tage Trainings-Serie", icon: "🔥" },
    { title: "PR-Meister", description: "5 neue persönliche Rekorde aufgestellt", icon: "💪" },
  ]);

  const resetProgress = () => {
    setTotalVolume("0 kg");
    setVolumeChange("+0%");
    setWorkouts("0");
    setWorkoutsChange("+0");
    setStreak("0 Tage");
    setPrs("0");
    setPrsChange("+0");
    toast.success("Gesamtfortschritt zurückgesetzt");
  };

  const resetPersonalRecords = () => {
    setPersonalRecords([]);
    setPrs("0");
    setPrsChange("+0");
    toast.success("Persönliche Rekorde zurückgesetzt");
  };

  const resetVolumeChart = () => {
    setWeeklyVolume([0, 0, 0, 0, 0, 0, 0]);
    toast.success("Volumen-Diagramm zurückgesetzt");
  };

  const resetAchievements = () => {
    setAchievements([]);
    toast.success("Erfolge zurückgesetzt");
  };

  const getVolumeData = () => {
    switch (volumePeriod) {
      case "month":
        return monthlyVolume;
      case "halfYear":
        return halfYearVolume;
      case "year":
        return yearVolume;
      default:
        return weeklyVolume;
    }
  };

  const getVolumeLabels = () => {
    switch (volumePeriod) {
      case "month":
        return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
      case "halfYear":
        return ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov"];
      case "year":
        return ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr"];
      default:
        return ["M", "D", "M", "D", "F", "S", "S"];
    }
  };

  return (
    <div className="pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fortschritt</h2>
        <Button onClick={resetProgress} size="sm" variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Zurücksetzen
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Gesamtvolumen"
          value={totalVolume}
          change={volumeChange}
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          label="Trainings"
          value={workouts}
          change={workoutsChange}
        />
        <MetricCard
          icon={<Flame className="w-5 h-5" />}
          label="Serie"
          value={streak}
          change="🔥"
        />
        <MetricCard
          icon={<Award className="w-5 h-5" />}
          label="PRs erreicht"
          value={prs}
          change={prsChange}
        />
      </div>

      {/* Personal Records */}
      <Card className="p-5 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Persönliche Rekorde</h3>
          <Button onClick={resetPersonalRecords} size="sm" variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {personalRecords.length > 0 ? (
            personalRecords.map((pr, index) => (
              <PRItem key={index} exercise={pr.exercise} weight={pr.weight} date={pr.date} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Rekorde vorhanden</p>
          )}
        </div>
      </Card>

      {/* Volume Chart */}
      <Card className="p-5 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Trainingsvolumen</h3>
          <Button onClick={resetVolumeChart} size="sm" variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        <Tabs value={volumePeriod} onValueChange={(v) => setVolumePeriod(v as any)} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">Woche</TabsTrigger>
            <TabsTrigger value="month">Monat</TabsTrigger>
            <TabsTrigger value="halfYear">6 Monate</TabsTrigger>
            <TabsTrigger value="year">Jahr</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-48 flex items-end justify-between gap-1 overflow-x-auto">
          {getVolumeData().map((height, i) => (
            <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-neon rounded-t opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${height}%` }}
              />
              {volumePeriod === "week" && (
                <span className="text-xs text-muted-foreground">
                  {getVolumeLabels()[i]}
                </span>
              )}
            </div>
          ))}
        </div>
        {volumePeriod !== "week" && (
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{getVolumeLabels()[0]}</span>
            <span>{getVolumeLabels()[Math.floor(getVolumeLabels().length / 2)]}</span>
            <span>{getVolumeLabels()[getVolumeLabels().length - 1]}</span>
          </div>
        )}
      </Card>

      {/* Recent Achievements */}
      <Card className="p-5 bg-secondary/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Letzte Erfolge</h3>
          <Button onClick={resetAchievements} size="sm" variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <Achievement
                key={index}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Erfolge vorhanden</p>
          )}
        </div>
      </Card>
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}) => (
  <Card className="p-4 bg-secondary/50">
    <div className="flex items-center gap-2 mb-2 text-primary">{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <div className="flex items-center justify-between mt-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-primary">{change}</p>
    </div>
  </Card>
);

const PRItem = ({ exercise, weight, date }: { exercise: string; weight: string; date: string }) => (
  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
    <div>
      <p className="font-semibold">{exercise}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
    <p className="text-lg font-bold text-primary">{weight}</p>
  </div>
);

const Achievement = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default ProgressDashboard;
