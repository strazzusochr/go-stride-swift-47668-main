# IronReign - Architektur-Dokumentation

## 🏗️ Systemarchitektur

### High-Level Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │ Workout  │ │ Recovery │ │Analytics │  │
│  │  Flow    │ │ Tracking │ │ Tracking │ │Dashboard │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                         ↕                                │
│              Supabase Client (JS SDK)                    │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              Lovable Cloud / Supabase                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │PostgreSQL│ │  Auth    │ │   RLS    │ │ Realtime │  │
│  │ Database │ │ Service  │ │ Policies │ │(optional)│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📁 Projektstruktur

```
iron-reign/
├── src/
│   ├── components/          # React-Komponenten
│   │   ├── ui/             # shadcn/ui Basis-Komponenten
│   │   ├── WorkoutTracker.tsx
│   │   ├── ExerciseDatabase.tsx
│   │   ├── RecoveryTracker.tsx
│   │   ├── TemplateManager.tsx
│   │   ├── ProgressDashboard.tsx
│   │   └── ...
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAuth.tsx     # Auth-State-Management
│   │   └── use-toast.ts    # Toast-Notifikationen
│   ├── lib/                # Utilities & Helpers
│   │   ├── supabase.ts     # Supabase Client Setup
│   │   └── utils.ts        # Helper-Funktionen
│   ├── pages/              # Route-Components
│   │   ├── Index.tsx       # Haupt-Dashboard
│   │   ├── Auth.tsx        # Login/Signup
│   │   └── NotFound.tsx    # 404-Seite
│   ├── integrations/       # Auto-generated
│   │   └── supabase/
│   │       ├── client.ts   # ⚠️ Auto-generated
│   │       └── types.ts    # ⚠️ Auto-generated
│   ├── App.tsx             # Haupt-App mit Routing
│   └── main.tsx            # Entry Point
├── docs/                   # Dokumentation
│   ├── README.md
│   ├── ARCHITECTURE.md     # Diese Datei
│   └── SECURITY.md
└── supabase/              # Backend-Konfiguration
    └── migrations/        # SQL-Migrations
```

## 🔄 Datenflüsse

### 1. Authentifizierungs-Flow

```
User Input (Email/Password)
    ↓
Auth.tsx (Validation mit Zod)
    ↓
auth.signIn() / auth.signUp()
    ↓
Supabase Auth Service
    ↓
JWT Token + Session
    ↓
AuthProvider (Context)
    ↓
Protected Routes (useAuth Hook)
```

### 2. Workout-Tracking-Flow

```
User wählt Übung
    ↓
ExerciseDatabase (Filter & Search)
    ↓
User loggt Satz (Reps, Gewicht, RPE)
    ↓
WorkoutTracker (State-Management)
    ↓
Validierung (Zod Schema)
    ↓
supabase.from('workout_sessions').insert()
supabase.from('set_entries').insert()
    ↓
PostgreSQL (mit RLS-Check)
    ↓
Success → Toast-Notification
```

### 3. Recovery-Tracking-Flow

```
User füllt Recovery-Form aus
    ↓
RecoveryTracker (Slider-Inputs)
    ↓
Validierung (Sleep: 0-24h, Mood: 1-10)
    ↓
supabase.from('recovery_logs').upsert()
    ↓
PostgreSQL (UNIQUE constraint: user_id, date)
    ↓
Recovery-Score-Berechnung (Frontend)
```

### 4. Analytics-Flow

```
User öffnet Progress-Tab
    ↓
ProgressDashboard
    ↓
Query: workout_sessions + set_entries (JOIN)
    ↓
Aggregationen (SUM, COUNT, AVG)
    ↓
e1RM-Berechnung (Epley-Formel)
    ↓
Chart-Rendering (Recharts)
```

## 🗄️ Datenbankdesign

### ER-Diagramm (vereinfacht)

```
┌──────────┐       ┌──────────────┐       ┌───────────┐
│ profiles │───┬───│workout_      │───┬───│ set_      │
│          │   │   │sessions      │   │   │ entries   │
└──────────┘   │   └──────────────┘   │   └───────────┘
               │                      │
               │   ┌──────────────┐   │
               └───│ workout_     │───┘
                   │ templates    │
                   └──────────────┘
                   
┌──────────┐       ┌──────────────┐
│exercises │───────│ personal_    │
│          │       │ records      │
└──────────┘       └──────────────┘

┌──────────┐       
│recovery_ │       
│logs      │       
└──────────┘       
```

### Relationen & Constraints

1. **profiles → workout_sessions** (1:N)
   - Foreign Key: `workout_sessions.user_id → profiles.id`
   - ON DELETE: CASCADE

2. **workout_sessions → set_entries** (1:N)
   - Foreign Key: `set_entries.session_id → workout_sessions.id`
   - ON DELETE: CASCADE

3. **exercises → set_entries** (1:N)
   - Foreign Key: `set_entries.exercise_id → exercises.id`
   - ON DELETE: CASCADE

4. **UNIQUE Constraints**:
   - `recovery_logs(user_id, date)` → Ein Log pro User pro Tag
   - `personal_records(user_id, exercise_id, pr_type, date)` → Kein Duplikat

## 🔐 Sicherheitsarchitektur

### Row Level Security (RLS) Strategie

**Prinzip**: Users können nur eigene Daten sehen/bearbeiten.

#### Beispiel: `workout_sessions`

```sql
-- SELECT Policy
CREATE POLICY "Users can view own sessions"
ON workout_sessions FOR SELECT
USING (auth.uid() = user_id);

-- INSERT Policy  
CREATE POLICY "Users can create sessions"
ON workout_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy
CREATE POLICY "Users can update own sessions"
ON workout_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE Policy
CREATE POLICY "Users can delete own sessions"
ON workout_sessions FOR DELETE
USING (auth.uid() = user_id);
```

#### Nested RLS (set_entries)

```sql
-- set_entries referenzieren workout_sessions
-- → Zugriff nur wenn User Owner der Session ist
CREATE POLICY "Users can view own set entries"
ON set_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE id = set_entries.session_id
    AND user_id = auth.uid()
  )
);
```

### Rollen-System

**Implementierung via `user_roles` Tabelle + Security Definer Function**

```sql
-- Security Definer verhindert RLS-Rekursion
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Verwendung in Policy
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

## 🎯 State-Management

### Auth-State (Global)

**Implementierung**: React Context API

```typescript
// AuthProvider wraps entire App
<AuthProvider>
  <App />
</AuthProvider>

// Komponenten nutzen useAuth Hook
const { user, session, loading } = useAuth();
```

### Lokaler Component-State

**Werkzeuge**:
- `useState` für UI-State (Tabs, Inputs)
- `useEffect` für Data-Fetching
- `TanStack Query` für Server-State (zukünftig)

### State-Persistence

1. **Server-State**: PostgreSQL (primär)
2. **localStorage**: Nur für temporäre Daten (z.B. Draft-Workouts)
3. **Session Storage**: Nicht verwendet

## 🔄 Event-Handling & Actions

### User-Actions → Side-Effects

```typescript
// Beispiel: Workout speichern
const handleFinishWorkout = async () => {
  // 1. Validierung
  const validated = workoutSchema.safeParse(data);
  if (!validated.success) {
    toast.error("Ungültige Daten");
    return;
  }

  // 2. DB-Insert (Transaction)
  const { data: session } = await supabase
    .from('workout_sessions')
    .insert({ ... })
    .select()
    .single();

  const { error } = await supabase
    .from('set_entries')
    .insert(setEntries.map(set => ({
      session_id: session.id,
      ...set
    })));

  // 3. Erfolgs-Handling
  if (!error) {
    toast.success("Workout gespeichert!");
    navigate('/history');
  }
};
```

## 📊 Analytics & Berechnungen

### e1RM-Berechnung (Estimated 1-Rep-Max)

**Epley-Formel**:
```typescript
const calculateE1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};
```

### Volumenlast-Berechnung

```typescript
const calculateVolume = (sets: SetEntry[]): number => {
  return sets.reduce((total, set) => {
    return total + (set.reps * set.weight);
  }, 0);
};
```

### Recovery-Score

```typescript
const calculateRecoveryScore = (log: RecoveryLog): number => {
  let score = 0;
  
  // Sleep (max 40 points)
  score += Math.min((log.sleep_hours / 8) * 40, 40);
  
  // Mood (max 30 points)
  score += (log.mood / 10) * 30;
  
  // Stress (inverted, max 30 points)
  score += ((10 - log.stress_level) / 10) * 30;
  
  return Math.round(score);
};
```

## 🚀 Performance-Optimierungen

### 1. Query-Optimierung

```typescript
// ❌ N+1-Problem
sessions.forEach(async session => {
  const sets = await supabase
    .from('set_entries')
    .select('*')
    .eq('session_id', session.id);
});

// ✅ Batch-Query mit JOIN
const { data } = await supabase
  .from('workout_sessions')
  .select(`
    *,
    set_entries(*)
  `)
  .eq('user_id', userId);
```

### 2. Lazy Loading

```typescript
// Übungsdatenbank: nur sichtbare Items laden
<ScrollArea onScroll={handleLoadMore}>
  {exercises.slice(0, page * 20)}
</ScrollArea>
```

### 3. Memoization

```typescript
const exerciseStats = useMemo(() => {
  return calculateExerciseStats(setEntries);
}, [setEntries]);
```

## 🔧 Fehlerbehandlung

### Error-Boundaries (React)

```typescript
// Globale Error-Boundary für Crash-Protection
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

### API-Error-Handling

```typescript
try {
  const { data, error } = await supabase
    .from('exercises')
    .select('*');
  
  if (error) throw error;
  
  setExercises(data);
} catch (error: any) {
  console.error('Exercise load failed:', error);
  toast({
    title: "Fehler",
    description: error.message,
    variant: "destructive"
  });
}
```

### Validation-Errors

```typescript
const schema = z.object({
  reps: z.number().min(1).max(500),
  weight: z.number().min(0).max(1000)
});

try {
  schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    toast.error(error.errors[0].message);
  }
}
```

## 🧪 Testing-Strategie

### Unit-Tests
- **Utils**: e1RM-Berechnung, Volumen-Berechnung
- **Validierung**: Zod-Schemas
- **Pure Functions**: Recovery-Score

### Integration-Tests
- **Workflow**: Login → Workout erstellen → Speichern
- **RLS**: Zugriffs-Tests für verschiedene User-Rollen

### E2E-Tests
- **Kritische Flows**: Signup → Workout → Analytics
- **Tool**: Playwright (zukünftig)

## 🔮 Skalierbarkeit

### Horizontale Skalierung
- Supabase managed automatisch DB-Connections
- Stateless Frontend → kann problemlos repliziert werden

### Vertikal Skalierung
- PostgreSQL-Indizes auf häufig genutzte Spalten
- Connection Pooling via Supabase

### Caching-Strategie (zukünftig)
- TanStack Query für Client-Side-Caching
- Stale-While-Revalidate Pattern

## 📦 Deployment

### Build-Prozess
```bash
npm run build  # Vite build → dist/
```

### Umgebungsvariablen
```env
VITE_SUPABASE_URL=<auto-generated>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-generated>
VITE_SUPABASE_PROJECT_ID=<auto-generated>
```

### Lovable Cloud Deployment
- Automatisch bei Git-Push
- Edge Functions werden auto-deployed
- Migrations werden auto-executed

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-30  
**Maintainer**: IronReign Development Team
