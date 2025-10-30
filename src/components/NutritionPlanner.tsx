import { useState } from "react";
import { Calculator, Info, Droplet, Zap, TrendingUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const nutritionSchema = z.object({
  weight: z.number().min(30, "Gewicht muss mindestens 30 kg sein").max(300, "Gewicht darf maximal 300 kg sein"),
  bodyFat: z.number().min(3, "Körperfett muss mindestens 3% sein").max(50, "Körperfett darf maximal 50% sein"),
});

const NutritionPlanner = () => {
  const [weight, setWeight] = useState<number>(80);
  const [bodyFat, setBodyFat] = useState<number>(15);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [goal, setGoal] = useState<"bulk" | "cut" | "maintain">("bulk");
  const [showResults, setShowResults] = useState(false);

  const validateAndSetWeight = (value: string) => {
    const numValue = parseInt(value) || 0;
    const result = nutritionSchema.shape.weight.safeParse(numValue);
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setWeight(numValue);
  };

  const validateAndSetBodyFat = (value: string) => {
    const numValue = parseInt(value) || 0;
    const result = nutritionSchema.shape.bodyFat.safeParse(numValue);
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setBodyFat(numValue);
  };

  const calculateMacros = () => {
    // Final validation before calculating
    const result = nutritionSchema.safeParse({ weight, bodyFat });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    
    setShowResults(true);
    toast.success("Makros berechnet!");
  };

  const resetForm = () => {
    setWeight(80);
    setBodyFat(15);
    setGender("male");
    setGoal("bulk");
    setShowResults(false);
    toast.success("Formular zurückgesetzt");
  };

  // Berechnung Grundumsatz (Harris-Benedict)
  const bmr = gender === "male" 
    ? 66.47 + (13.7 * weight) - (5 * 25) + (6.8 * 175) // Annahme: 25 Jahre, 175cm
    : 655.1 + (9.6 * weight) - (1.8 * 25) + (1.8 * 165); // Annahme: 25 Jahre, 165cm
  
  // Aktivitätsfaktor (moderates Training)
  const tdee = Math.round(bmr * 1.55);
  
  // Kalorienüberschuss für Muskelaufbau
  const surplus = goal === "bulk" 
    ? (gender === "male" ? 400 : 250)
    : goal === "cut" 
    ? (gender === "male" ? -500 : -350)
    : 0;
  
  const calories = tdee + surplus;
  
  // Makronährstoffe berechnen
  const proteinGPerKg = 2.0; // 1,4-2,2 g/kg empfohlen
  const protein = Math.round(weight * proteinGPerKg);
  
  const fatGPerKg = 1.0; // mindestens 1 g/kg
  const fat = Math.round(weight * fatGPerKg);
  
  // Rest durch Kohlenhydrate
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  
  // Prozentuale Verteilung
  const proteinPercent = Math.round((protein * 4 / calories) * 100);
  const fatPercent = Math.round((fat * 9 / calories) * 100);
  const carbsPercent = Math.round((carbs * 4 / calories) * 100);
  
  // Flüssigkeitsbedarf
  const waterIntake = Math.round(weight * 0.04); // 40ml pro kg

  return (
    <div className="pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ernährung</h2>
        {showResults && (
          <Button onClick={resetForm} size="sm" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Zurücksetzen
          </Button>
        )}
      </div>

      {/* Macro Calculator */}
      <Card className="p-5 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Makro-Rechner</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="weight">Körpergewicht (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="30"
              max="300"
              value={weight}
              onChange={(e) => validateAndSetWeight(e.target.value)}
              onBlur={(e) => validateAndSetWeight(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bodyfat">Körperfett %</Label>
            <Input
              id="bodyfat"
              type="number"
              min="3"
              max="50"
              value={bodyFat}
              onChange={(e) => validateAndSetBodyFat(e.target.value)}
              onBlur={(e) => validateAndSetBodyFat(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Geschlecht</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={gender === "male" ? "default" : "outline"}
                onClick={() => setGender("male")}
              >
                Männlich
              </Button>
              <Button
                variant={gender === "female" ? "default" : "outline"}
                onClick={() => setGender("female")}
              >
                Weiblich
              </Button>
            </div>
          </div>

          <div>
            <Label>Ziel</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                variant={goal === "bulk" ? "default" : "outline"}
                onClick={() => setGoal("bulk")}
                className={goal === "bulk" ? "glow-neon" : ""}
              >
                Aufbau
              </Button>
              <Button
                variant={goal === "maintain" ? "default" : "outline"}
                onClick={() => setGoal("maintain")}
              >
                Halten
              </Button>
              <Button
                variant={goal === "cut" ? "default" : "outline"}
                onClick={() => setGoal("cut")}
              >
                Diät
              </Button>
            </div>
          </div>

          <Button onClick={calculateMacros} className="w-full glow-neon">
            Makros berechnen
          </Button>
        </div>
      </Card>

      {/* Results */}
      {showResults && (
        <>
          <Card className="p-5 bg-gradient-metal border-accent/20">
            <h3 className="font-bold text-lg mb-4 text-neon">Deine täglichen Ziele</h3>

            <div className="space-y-3">
              <MacroRow 
                label="Kalorien" 
                value={`${calories} kcal`} 
                subtitle={goal === "bulk" ? `+${surplus} kcal Überschuss` : goal === "cut" ? `${surplus} kcal Defizit` : "Erhaltung"}
                color="primary" 
              />
              <MacroRow 
                label="Protein" 
                value={`${protein}g`} 
                subtitle={`${proteinPercent}% | ${proteinGPerKg}g/kg`}
                color="primary" 
              />
              <MacroRow 
                label="Kohlenhydrate" 
                value={`${carbs}g`} 
                subtitle={`${carbsPercent}% | ${(carbs/weight).toFixed(1)}g/kg`}
                color="primary" 
              />
              <MacroRow 
                label="Fett" 
                value={`${fat}g`} 
                subtitle={`${fatPercent}% | ${fatGPerKg}g/kg`}
                color="primary" 
              />
            </div>

            <div className="mt-4 p-3 bg-secondary/30 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Basierend auf moderater Trainingsintensität (4-5x/Woche). Passe die Werte nach deinen Ergebnissen an.
              </p>
            </div>
          </Card>

          {/* Profi-Tipps */}
          <Card className="p-5 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Profi-Tipps</h3>
            </div>
            
            <div className="space-y-4">
              <TipCard
                icon={<Droplet className="w-5 h-5" />}
                title="Flüssigkeitszufuhr"
                content={`Trinke mindestens ${waterIntake} Liter Wasser täglich. Bei intensivem Training noch mehr. Wasser transportiert Nährstoffe zu den Muskeln.`}
              />
              <TipCard
                icon={<Zap className="w-5 h-5" />}
                title="Timing"
                content="Verteile dein Protein über 4-6 Mahlzeiten. Post-Workout: Schnelle Kohlenhydrate + Protein für optimale Regeneration."
              />
              <TipCard
                icon={<Info className="w-5 h-5" />}
                title="Qualität vor Quantität"
                content="Fokus auf komplexe Kohlenhydrate (Vollkorn, Kartoffeln), magere Proteinquellen und gesunde Fette (Nüsse, Avocado, Fisch)."
              />
            </div>
          </Card>
        </>
      )}

      {/* Meal Ideas */}
      <Card className="p-5 bg-card">
        <h3 className="font-bold text-lg mb-4">Beispiel-Tagesplan (Muskelaufbau)</h3>
        <div className="space-y-3">
          <MealCard
            title="Frühstück (7:00)"
            items={["6 Vollei-Omelett", "100g Haferflocken mit Beeren", "1 Banane", "30g Nüsse"]}
            macros="P: 45g | K: 85g | F: 28g | ~780 kcal"
          />
          <MealCard
            title="Snack (10:00)"
            items={["250g Magerquark", "1 EL Leinöl", "Handvoll Walnüsse"]}
            macros="P: 35g | K: 12g | F: 18g | ~360 kcal"
          />
          <MealCard
            title="Mittagessen (13:00)"
            items={["250g Hähnchenbrust", "300g Vollkornreis", "Buntes Gemüse", "1 EL Olivenöl"]}
            macros="P: 65g | K: 95g | F: 18g | ~820 kcal"
          />
          <MealCard
            title="Pre-Workout (16:00)"
            items={["Whey-Proteinshake", "2 Bananen", "1 EL Erdnussbutter"]}
            macros="P: 30g | K: 65g | F: 10g | ~470 kcal"
          />
          <MealCard
            title="Post-Workout (19:00)"
            items={["200g Lachs", "400g Kartoffeln", "Brokkoli", "Avocado"]}
            macros="P: 50g | K: 80g | F: 25g | ~750 kcal"
          />
          <MealCard
            title="Abendsnack (21:30)"
            items={["200g Hüttenkäse", "1 EL Leinöl", "Beeren"]}
            macros="P: 25g | K: 15g | F: 15g | ~300 kcal"
          />
        </div>
        
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <p className="text-xs font-bold text-primary mb-1">Tagessumme</p>
          <p className="text-sm text-muted-foreground">
            Protein: ~250g | Kohlenhydrate: ~352g | Fett: ~114g | Kalorien: ~3480 kcal
          </p>
        </div>
      </Card>
    </div>
  );
};

const MacroRow = ({ 
  label, 
  value, 
  subtitle, 
  color 
}: { 
  label: string; 
  value: string; 
  subtitle?: string;
  color: string;
}) => (
  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
    <div>
      <span className="font-semibold block">{label}</span>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </div>
    <span className={`text-lg font-bold text-primary`}>{value}</span>
  </div>
);

const TipCard = ({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) => (
  <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
    <div className="text-primary flex-shrink-0 mt-0.5">{icon}</div>
    <div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{content}</p>
    </div>
  </div>
);

const MealCard = ({
  title,
  items,
  macros,
}: {
  title: string;
  items: string[];
  macros: string;
}) => (
  <div className="p-4 bg-secondary/30 rounded-lg">
    <h4 className="font-bold mb-2">{title}</h4>
    <ul className="text-sm text-muted-foreground space-y-1 mb-2">
      {items.map((item, i) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
    <p className="text-xs font-mono text-primary">{macros}</p>
  </div>
);

export default NutritionPlanner;
