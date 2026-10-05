-- Create storage bucket for emergency recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'emergency-recordings',
  'emergency-recordings',
  false,
  524288000,
  ARRAY['video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4']
) ON CONFLICT DO NOTHING;

-- RLS: users can only upload/read their own recordings
CREATE POLICY "Users upload own recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'emergency-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'emergency-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  xp integer DEFAULT 0,
  streak integer DEFAULT 0,
  plan text DEFAULT 'free',
  last_lesson_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create the profile row when a new auth user signs up. Runs as the function
-- owner (SECURITY DEFINER) so it works even when the user has no active session yet
-- (e.g. while email confirmation is pending). The client passes `name` as user
-- metadata during signUp; we read it from raw_user_meta_data here.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Emergency queries table
CREATE TABLE IF NOT EXISTS public.emergency_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  query text,
  category text,
  response text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.emergency_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own queries" ON public.emergency_queries
  FOR ALL USING (auth.uid() = user_id);

-- User progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  topic_id text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Add XP function
CREATE OR REPLACE FUNCTION add_xp(user_id uuid, amount integer)
RETURNS void LANGUAGE sql AS $$
  UPDATE public.users SET xp = xp + amount WHERE id = user_id;
$$;

-- Law chunks table for RAG
CREATE TABLE IF NOT EXISTS public.law_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  law_name text NOT NULL,
  section_number text,
  section_title text,
  content text NOT NULL,
  plain_english text,
  topic_slug text,
  embedding vector(768),
  created_at timestamptz DEFAULT now()
);

-- match_law_chunks function
CREATE OR REPLACE FUNCTION match_law_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  topic_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  law_name text,
  section_number text,
  section_title text,
  content text,
  plain_english text,
  topic_slug text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id, law_name, section_number, section_title, content, plain_english, topic_slug,
    1 - (embedding <=> query_embedding) AS similarity
  FROM law_chunks
  WHERE
    (topic_filter IS NULL OR topic_slug = topic_filter)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
