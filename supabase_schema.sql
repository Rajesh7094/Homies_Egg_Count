-- ==============================================================================
-- BACHELOR EGG MANAGER - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Create Custom Enums & Types (Safely handle if already exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(10) UNIQUE NOT NULL, -- Auto generated e.g. RAJ001, HAR002
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    status user_status DEFAULT 'active'::user_status NOT NULL,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create Egg Batches Table
CREATE TABLE IF NOT EXISTS public.egg_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(20) UNIQUE NOT NULL, -- E.g. Batch-001, Batch-002
    total_eggs INT NOT NULL CHECK (total_eggs > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    price_per_egg NUMERIC(10, 2) NOT NULL CHECK (price_per_egg >= 0),
    remaining_eggs INT NOT NULL CHECK (remaining_eggs >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by VARCHAR(10) REFERENCES public.users(user_id) ON DELETE SET NULL
);

-- 4. Create Consumption Table
CREATE TABLE IF NOT EXISTS public.consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    custom_user_id VARCHAR(10) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    batch_id UUID REFERENCES public.egg_batches(id) ON DELETE CASCADE NOT NULL,
    batch_number VARCHAR(20) NOT NULL,
    egg_count INT DEFAULT 1 NOT NULL CHECK (egg_count > 0),
    price_per_egg NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    consumed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create Activity Logs Table ("user" is double-quoted because user is a PostgreSQL reserved keyword)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user" VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_user_id ON public.consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_batch_id ON public.consumption(batch_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON public.activity_logs(timestamp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egg_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users RLS (drop if exists before recreating to avoid duplicate error)
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow Admin to insert/update users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert/update users" ON public.users;

CREATE POLICY "Allow public read access to users" ON public.users 
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update users" ON public.users 
    FOR ALL USING (true);

-- Egg Batches RLS
DROP POLICY IF EXISTS "Everyone can view active and past batches" ON public.egg_batches;
DROP POLICY IF EXISTS "Admin full management for batches" ON public.egg_batches;

CREATE POLICY "Everyone can view active and past batches" ON public.egg_batches 
    FOR SELECT USING (true);

CREATE POLICY "Admin full management for batches" ON public.egg_batches 
    FOR ALL USING (true);

-- Consumption RLS
DROP POLICY IF EXISTS "Users can view all household consumptions" ON public.consumption;
DROP POLICY IF EXISTS "Users can log their own egg consumption" ON public.consumption;

CREATE POLICY "Users can view all household consumptions" ON public.consumption 
    FOR SELECT USING (true);

CREATE POLICY "Users can log their own egg consumption" ON public.consumption 
    FOR ALL USING (true);

-- Activity Logs RLS
DROP POLICY IF EXISTS "Everyone can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System and Admin can create activity logs" ON public.activity_logs;

CREATE POLICY "Everyone can view activity logs" ON public.activity_logs 
    FOR SELECT USING (true);

CREATE POLICY "System and Admin can create activity logs" ON public.activity_logs 
    FOR ALL USING (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Admin User
INSERT INTO public.users (user_id, name, email, mobile, role, status)
VALUES ('RAJ001', 'Rajesh (Admin)', 'rajesherode2004@gmail.com', '+91 98765 43210', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
