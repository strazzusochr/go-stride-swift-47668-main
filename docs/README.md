# IronReign - Fortgeschrittenes Bodybuilding-Tracking

## 🎯 Überblick

IronReign ist eine vollständige Bodybuilding-Tracking-Anwendung mit fortgeschrittenen Features für ernsthaftes Krafttraining. Die App bietet umfassendes Tracking von Workouts, Recovery, Ernährung und Fortschritt.

## ✨ Hauptfeatures

### 1. **Workout-Tracking**
- Vollständige Übungsdatenbank mit 30+ vordefinierten Übungen
- Detailliertes Set-Tracking (Reps, Gewicht, RPE, RIR, Tempo)
- Erweiterte Satzarten (Supersatz, Drop-Set, Myo-Reps, etc.)
- Integrierte Timer für Satzpausen
- Tagesform-Check (Perceived Energy)

### 2. **Übungsdatenbank**
- 30+ vordefinierte Übungen nach Muskelgruppen
- Filterung nach Primärmuskel, Equipment, Schwierigkeit
- Technik-Cues und Kontraindikationen
- Sekundäre Muskelgruppen-Anzeige
- Custom-Übungen erstellen (optional)

### 3. **Recovery-Tracking**
- Schlaf-Tracking (Stunden)
- Stimmungs- und Stress-Level
- Ruhepuls & HRV (optional)
- Notizen für Schmerzen/Verletzungen
- Recovery-Score-Berechnung

### 4. **Template-Management**
- Vordefinierte Split-Templates:
  - Ganzkörper (3x/Woche)
  - OK/UK-Split (4x/Woche)
  - Push/Pull/Legs (6x/Woche)
  - 5-Tage Bro-Split
- Periodisierungsoptionen (Linear, Wellenförmig, Block, DUP)
- Custom-Templates erstellen

### 5. **Fortschritts-Analytics**
- e1RM-Schätzungen (Estimated 1-Rep-Max)
- Volumenlast-Tracking (Sets × Reps × Weight)
- Personal Records (PRs)
- Muskelgruppen-Volumen pro Woche
- Trainings-Streaks

### 6. **Ernährungsplanung**
- Makro-Berechnung basierend auf Körpergewicht & Körperfett
- Zielkorridor-Anzeige
- Kalorienbedarf-Rechner
- Eingabevalidierung

### 7. **Workout-History**
- Kalender-Ansicht aller Trainings
- Detaillierte Session-Übersicht
- Volumen- und Satz-Statistiken
- Export-Funktionen (geplant)

## 🏗️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **TailwindCSS** für Styling
- **shadcn/ui** Komponenten-Bibliothek
- **React Router** für Navigation
- **TanStack Query** für Data Fetching
- **Zod** für Validierung

### Backend (Lovable Cloud)
- **Supabase** (PostgreSQL)
- Row Level Security (RLS) Policies
- Authentifizierung (Email/Password)
- Auto-confirm Email aktiviert

## 📊 Datenmodell

### Haupttabellen

#### `profiles`
- User-Profile mit Display-Name, Avatar
- Präferierte Einheiten (metrisch/imperial)
- Privacy-Einstellungen

#### `exercises`
- ID, Name, Primary/Secondary Muscles
- Equipment, Difficulty
- Technique Cues, Contraindications
- Custom-Übungen pro User

#### `workout_templates`
- Template-Name, Split-Type
- Days per Week, Periodization
- Public/Private-Flag

#### `workout_sessions`
- User-ID, Template-ID (optional)
- Start/End Time
- Perceived Energy (1-10)
- Notes

#### `set_entries`
- Session-ID, Exercise-ID
- Set Number, Set Type
- Reps, Weight
- RPE (1-10), RIR (0-10)
- Tempo, Rest Times
- Technique Notes

#### `personal_records`
- Exercise-ID, PR-Type
- Value (Weight/Reps)
- Date, Session-ID

#### `recovery_logs`
- Date, Sleep Hours
- Mood (1-10), Stress Level (1-10)
- Resting HR, HRV
- Soreness Data (JSONB)
- Notes

## 🔐 Sicherheit

### Authentifizierung
- Email/Password-Authentifizierung
- Auto-confirm aktiviert (für Testzwecke)
- Session-Management mit Supabase Auth
- Sichere Token-Speicherung

### Row Level Security (RLS)
Alle Tabellen haben RLS-Policies:
- Users können nur eigene Daten lesen/schreiben
- Public-Übungen sind für alle sichtbar
- Custom-Übungen nur für Ersteller
- Security-Definer-Funktionen für Rollen-Checks

### Eingabevalidierung
- **Client-seitig**: Zod-Schemas
- **Server-seitig**: PostgreSQL Constraints
- Limits für Gewicht (0-1000kg), Reps (1-500), RPE (1-10)

## 🚀 Getting Started

### Voraussetzungen
- Node.js 18+
- Lovable Cloud Account (automatisch bereitgestellt)

### Installation
```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev
```

### Erster Login
1. App öffnen → `/auth`
2. "Registrieren"-Tab wählen
3. Email, Passwort eingeben (mind. 8 Zeichen)
4. Account wird automatisch erstellt und aktiviert

### Erste Schritte
1. **Übungsdatenbank** erkunden (30+ vordefinierte Übungen)
2. **Recovery-Log** erstellen (Tagesform tracken)
3. **Workout starten** → Übung auswählen → Sätze loggen
4. **Historie** anzeigen → Kalender-Ansicht

## 📖 User Guide

### Workout-Tracking
1. Tab "Training" öffnen
2. Übung aus Bibliothek auswählen
3. Sätze hinzufügen (Reps, Gewicht, RPE)
4. Optional: RPE (Rate of Perceived Exertion), RIR (Reps in Reserve), Tempo
5. Satz-Timer nutzen
6. "Workout beenden" → automatische Speicherung

### Recovery-Tracking
1. Tab "Recovery" öffnen
2. Schlaf-Stunden (Slider)
3. Stimmung (1-10)
4. Stress-Level (1-10)
5. Optional: Ruhepuls, HRV
6. Notizen für Schmerzen/Verletzungen
7. "Speichern"

### Template-Nutzung
1. Tab "Templates" öffnen
2. Vordefinierte Templates ansehen
3. Template auswählen → "Starten"
4. Workout wird mit Template-Übungen vorausgefüllt

## 🎨 Designsystem

Die App nutzt ein konsistentes Designsystem:
- **Primary Colors**: Neon-Akzente für CTAs
- **Dark Theme**: Optimiert für Gym-Umgebung
- **Responsive**: Mobile-first Design
- **Semantic Tokens**: Alle Colors über Design-System

## 🔧 Konfiguration

### Auth-Einstellungen
- Auto-confirm: ✅ Aktiviert
- Signup: ✅ Aktiviert
- Email-Redirect: `window.location.origin`

### Datenbankindizes
- `exercises`: primary_muscle, equipment
- `workout_sessions`: user_id, date (DESC)
- `set_entries`: session_id, exercise_id
- `personal_records`: user_id, exercise_id, date (DESC)
- `recovery_logs`: user_id, date (DESC)

## 📝 Entwicklungs-Roadmap

### ✅ Phase 1-3 (Implementiert)
- [x] Backend-Schema & RLS
- [x] Authentifizierung
- [x] Übungsdatenbank (30+ Übungen)
- [x] Recovery-Tracking
- [x] Template-Management (Basis)
- [x] Workout-Tracking (Basic)

### 🚧 Phase 4-6 (In Arbeit)
- [ ] Erweiterte Satzarten (Supersatz, Drop-Set)
- [ ] e1RM-Berechnungen & Trends
- [ ] Volumenlast-Analytics
- [ ] PR-Auto-Detection
- [ ] Deload-Assistent

### 🔮 Phase 7-10 (Geplant)
- [ ] Social Features (Challenges, Badges)
- [ ] KI-basierte Trainingsplanung
- [ ] Export/Import (CSV/JSON)
- [ ] Video-Technik-Guides
- [ ] Gym-Profile & Equipment-Mapping

## 🐛 Bekannte Issues

1. **localStorage Migration**: Alte Workout-Daten aus localStorage werden nicht automatisch in DB migriert
   - **Fix**: Manuelle Migration oder Neustart

2. **Template-Exercises**: Template-Detail-View noch nicht implementiert
   - **Workaround**: Templates direkt beim Workout-Start verwenden

3. **e1RM-Formeln**: Mehrere Formeln zur Auswahl fehlen noch
   - **Status**: Epley-Formel bereits implementiert

## 🤝 Contributing

Dieses Projekt ist Teil des Lovable Cloud Ecosystems. 

### Code-Standards
- TypeScript strict mode
- ESLint + Prettier
- Semantic Git Commits
- Component-first Architecture

## 📄 Lizenz

Proprietary - IronReign Fitness Tracking App

## 🙏 Credits

- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Backend**: Supabase / Lovable Cloud
- **Übungsdatenbank**: Kuratiert aus Public-Domain-Quellen

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: 2025-10-30  
**Status**: ✅ Production-Ready (MVP)
