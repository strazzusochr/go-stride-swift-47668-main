import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: ms.toString().padStart(2, "0"),
    };
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formattedTime = formatTime(time);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 border-accent/20">
      <h3 className="font-bold text-lg mb-4 text-center">Trainings-Stoppuhr</h3>
      
      <div className="flex justify-center items-baseline gap-1 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-neon font-mono animate-scale-in">
            {formattedTime.hours}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Std</div>
        </div>
        <span className="text-4xl text-neon font-bold mb-2">:</span>
        <div className="text-center">
          <div className="text-5xl font-bold text-neon font-mono animate-scale-in">
            {formattedTime.minutes}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Min</div>
        </div>
        <span className="text-4xl text-neon font-bold mb-2">:</span>
        <div className="text-center">
          <div className="text-5xl font-bold text-neon font-mono animate-scale-in">
            {formattedTime.seconds}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Sek</div>
        </div>
        <span className="text-3xl text-primary/50 font-bold mb-2">.</span>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary/70 font-mono animate-scale-in">
            {formattedTime.milliseconds}
          </div>
          <div className="text-xs text-muted-foreground mt-1">MS</div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleStartPause}
          size="lg"
          className={`flex-1 max-w-[150px] ${
            isRunning
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-primary hover:bg-primary/90 glow-neon"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          onClick={handleReset}
          size="lg"
          variant="outline"
          disabled={time === 0}
          className="flex-1 max-w-[150px]"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>

      {isRunning && (
        <div className="mt-4 text-center">
          <div className="inline-block px-3 py-1 bg-primary/10 rounded-full animate-pulse">
            <span className="text-xs text-primary font-semibold">Training läuft...</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Stopwatch;
