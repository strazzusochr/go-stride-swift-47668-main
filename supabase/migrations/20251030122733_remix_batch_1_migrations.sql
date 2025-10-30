
-- Migration: 20251030051335

-- Migration: 20251030031639
-- =====================================================
-- IronReign Bodybuilding Tracking Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE public.app_role AS ENUM ('user', 'coach', 'admin');

-- Training difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');

-- Equipment types
CREATE TYPE public.equipment_type AS ENUM (
  'barbell', 'dumbbell', 'cable', 'machine', 
  'bodyweight', 'resistance_band', 'kettlebell', 'other'
);

-- Primary muscle groups
CREATE TYPE public.muscle_group AS ENUM (
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves', 
  'abs', 'obliques', 'lower_back', 'traps', 'neck'
);

-- Training split types
CREATE TYPE public.split_type AS ENUM (
  'full_body', 'upper_lower', 'push_pull_legs', 
  'bro_split', 'custom'
);

-- Periodization types
CREATE TYPE public.periodization_type AS ENUM (
  'linear', 'undulating', 'block', 'dup'
);

-- Set types
CREATE TYPE public.set_type AS ENUM (
  'normal', 'warmup', 'drop_set', 'super_set', 
  'tri_set', 'myo_reps', 'rest_pause', 'cluster'
);

-- PR types
CREATE TYPE public.pr_type AS ENUM (
  'one_rm', 'three_rm', 'five_rm', 'eight_rm', 
  'ten_rm', 'volume', 'rep_at_weight'
);

-- =====================================================
-- USER PROFILES
-- =====================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_unit TEXT DEFAULT 'metric' CHECK (preferred_unit IN ('metric', 'imperial')),
  privacy_analytics_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- USER ROLES
-- =====================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================
-- EXERCISES
-- =====================================================

CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  primary_muscle muscle_group NOT NULL,
  secondary_muscles muscle_group[] DEFAULT ARRAY[]::muscle_group[],
  equipment equipment_type NOT NULL,
  difficulty difficulty_level DEFAULT 'intermediate',
  technique_cues TEXT[] DEFAULT ARRAY[]::TEXT[],
  contraindications TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT name_length CHECK (char_length(name) <= 100)
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public exercises"
  ON public.exercises FOR SELECT
  USING (NOT is_custom OR created_by = auth.uid());

CREATE POLICY "Users can create custom exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

CREATE POLICY "Users can update own custom exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = true);

CREATE INDEX idx_exercises_primary_muscle ON public.exercises(primary_muscle);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);

-- =====================================================
-- WORKOUT TEMPLATES
-- =====================================================

CREATE TABLE public.workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  split_type split_type DEFAULT 'custom',
  days_per_week INTEGER CHECK (days_per_week BETWEEN 1 AND 7),
  periodization periodization_type DEFAULT 'linear',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT template_name_length CHECK (char_length(name) <= 100)
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON public.workout_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create templates"
  ON public.workout_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.workout_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.workout_templates FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TEMPLATE EXERCISES
-- =====================================================

CREATE TABLE public.template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number > 0),
  exercise_order INTEGER NOT NULL CHECK (exercise_order > 0),
  target_sets INTEGER CHECK (target_sets BETWEEN 1 AND 20),
  target_reps_min INTEGER CHECK (target_reps_min > 0),
  target_reps_max INTEGER CHECK (target_reps_max > 0),
  target_rpe NUMERIC(3,1) CHECK (target_rpe BETWEEN 1 AND 10),
  rest_seconds INTEGER DEFAULT 120 CHECK (rest_seconds >= 0),
  notes TEXT
);

ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template exercises"
  ON public.template_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_templates
      WHERE id = template_exercises.template_id
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can modify template exercises"
  ON public.template_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_templates
      WHERE id = template_exercises.template_id
      AND user_id = auth.uid()
    )
  );

CREATE INDEX idx_template_exercises_template ON public.template_exercises(template_id);

-- =====================================================
-- WORKOUT SESSIONS
-- =====================================================

CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  perceived_energy INTEGER CHECK (perceived_energy BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_session_times CHECK (end_time IS NULL OR end_time > start_time)
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_sessions_user_date ON public.workout_sessions(user_id, date DESC);

-- =====================================================
-- SET ENTRIES
-- =====================================================

CREATE TABLE public.set_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  set_type set_type DEFAULT 'normal',
  reps INTEGER CHECK (reps BETWEEN 1 AND 500),
  weight NUMERIC(8,2) CHECK (weight >= 0 AND weight <= 1000),
  rpe NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  rir INTEGER CHECK (rir BETWEEN 0 AND 10),
  tempo TEXT CHECK (char_length(tempo) <= 10),
  rest_planned_sec INTEGER CHECK (rest_planned_sec >= 0),
  rest_actual_sec INTEGER CHECK (rest_actual_sec >= 0),
  completed BOOLEAN DEFAULT true,
  technique_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.set_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own set entries"
  ON public.set_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE id = set_entries.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage set entries"
  ON public.set_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE id = set_entries.session_id
      AND user_id = auth.uid()
    )
  );

CREATE INDEX idx_set_entries_session ON public.set_entries(session_id);
CREATE INDEX idx_set_entries_exercise ON public.set_entries(exercise_id);

-- =====================================================
-- PERSONAL RECORDS
-- =====================================================

CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  pr_type pr_type NOT NULL,
  value NUMERIC(8,2) NOT NULL CHECK (value > 0),
  reps INTEGER CHECK (reps > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, exercise_id, pr_type, date)
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PRs"
  ON public.personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create PRs"
  ON public.personal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PRs"
  ON public.personal_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own PRs"
  ON public.personal_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_prs_user_exercise ON public.personal_records(user_id, exercise_id, date DESC);

-- =====================================================
-- RECOVERY LOGS
-- =====================================================

CREATE TABLE public.recovery_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  soreness_data JSONB DEFAULT '{}'::JSONB,
  resting_hr INTEGER CHECK (resting_hr BETWEEN 30 AND 200),
  hrv INTEGER CHECK (hrv BETWEEN 0 AND 300),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, date)
);

ALTER TABLE public.recovery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recovery logs"
  ON public.recovery_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create recovery logs"
  ON public.recovery_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery logs"
  ON public.recovery_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery logs"
  ON public.recovery_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_recovery_logs_user_date ON public.recovery_logs(user_id, date DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

