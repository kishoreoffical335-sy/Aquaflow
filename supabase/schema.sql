-- ============================================================================
-- WATER QUALITY & FLOW MONITORING SYSTEM - PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase Schema with Row-Level Security (RLS) & Realtime
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. DEVICES TABLE (ESP32 Nodes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    device_uid TEXT UNIQUE NOT NULL,
    api_key_hash TEXT NOT NULL,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'warning', 'fault')),
    last_seen_at TIMESTAMPTZ,
    firmware_version TEXT DEFAULT '1.0.0',
    offline_timeout_seconds INTEGER DEFAULT 60 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. SENSORS TABLE (Physical Measured & Derived / Calculated)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
    sensor_type TEXT NOT NULL CHECK (sensor_type IN ('ph', 'turbidity', 'flow_rate', 'total_flow', 'dissolved_oxygen')),
    sensor_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    measurement_type TEXT NOT NULL CHECK (measurement_type IN ('MEASURED', 'DERIVED', 'CALCULATED')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'calibrating', 'fault', 'disabled')),
    enabled BOOLEAN DEFAULT true NOT NULL,
    calculation_model TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(device_id, sensor_type)
);

-- ----------------------------------------------------------------------------
-- 4. SENSOR READINGS TABLE (Strictly real telemetry only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    ph NUMERIC(5, 2) CHECK (ph >= 0 AND ph <= 14),
    turbidity NUMERIC(8, 2) CHECK (turbidity >= 0),
    flow_rate NUMERIC(8, 2) CHECK (flow_rate >= 0),
    total_flow NUMERIC(12, 2) CHECK (total_flow >= 0),
    dissolved_oxygen NUMERIC(5, 2) CHECK (dissolved_oxygen >= 0),
    do_calculation_meta JSONB,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. THRESHOLDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parameter TEXT NOT NULL CHECK (parameter IN ('ph', 'turbidity', 'flow_rate', 'dissolved_oxygen')),
    minimum_value NUMERIC(8, 2) NOT NULL,
    maximum_value NUMERIC(8, 2) NOT NULL,
    warning_low NUMERIC(8, 2),
    warning_high NUMERIC(8, 2),
    critical_low NUMERIC(8, 2),
    critical_high NUMERIC(8, 2),
    enabled BOOLEAN DEFAULT true NOT NULL,
    unit TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, parameter)
);

-- ----------------------------------------------------------------------------
-- 6. ALERTS TABLE (Deduplicated, Cooldown & Recovery Aware)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
    sensor_id UUID REFERENCES public.sensors(id) ON DELETE SET NULL,
    parameter TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'THRESHOLD_BREACH',
        'SENSOR_COMM_FAILURE',
        'ESP32_OFFLINE',
        'TELEMETRY_MALFORMED',
        'FLOW_ANOMALY',
        'CALCULATION_UNAVAILABLE'
    )),
    current_value NUMERIC(8, 2),
    threshold_value NUMERIC(8, 2),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    dedup_key TEXT NOT NULL,
    occurrence_count INTEGER DEFAULT 1 NOT NULL,
    last_occurred_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 7. DEVICE EVENTS & AUDIT LOG TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.device_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'DEVICE_CONNECTED',
        'DEVICE_DISCONNECTED',
        'TELEMETRY_ACCEPTED',
        'TELEMETRY_REJECTED',
        'ALERT_TRIGGERED',
        'ALERT_RESOLVED',
        'CREDENTIAL_ROTATED',
        'THRESHOLD_MODIFIED',
        'EXPORT_GENERATED'
    )),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. EXPORT JOBS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    record_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_devices_user ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_uid ON public.devices(device_uid);
CREATE INDEX IF NOT EXISTS idx_sensors_device ON public.sensors(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_date ON public.sensor_readings(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_date ON public.sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_status ON public.alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_dedup ON public.alerts(dedup_key, status);
CREATE INDEX IF NOT EXISTS idx_device_events_device_date ON public.device_events(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thresholds_user ON public.thresholds(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read & update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Devices: users manage their own devices
CREATE POLICY "Users can view own devices" ON public.devices
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.devices
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.devices
    FOR DELETE USING (auth.uid() = user_id);

-- Sensors: users can access sensors belonging to their devices
CREATE POLICY "Users can view own sensors" ON public.sensors
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.devices WHERE devices.id = sensors.device_id AND devices.user_id = auth.uid()
    ));
CREATE POLICY "Users can insert sensors on own devices" ON public.sensors
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.devices WHERE devices.id = sensors.device_id AND devices.user_id = auth.uid()
    ));
CREATE POLICY "Users can update sensors on own devices" ON public.sensors
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.devices WHERE devices.id = sensors.device_id AND devices.user_id = auth.uid()
    ));

-- Sensor Readings: users can view readings of their devices
CREATE POLICY "Users can view own sensor readings" ON public.sensor_readings
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.devices WHERE devices.id = sensor_readings.device_id AND devices.user_id = auth.uid()
    ));

-- Thresholds: users manage their own thresholds
CREATE POLICY "Users can view own thresholds" ON public.thresholds
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own thresholds" ON public.thresholds
    FOR ALL USING (auth.uid() = user_id);

-- Alerts: users view and manage their alerts
CREATE POLICY "Users can view own alerts" ON public.alerts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.alerts
    FOR UPDATE USING (auth.uid() = user_id);

-- Device Events: users can view events for their devices
CREATE POLICY "Users can view own device events" ON public.device_events
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.devices WHERE devices.id = device_events.device_id AND devices.user_id = auth.uid()
    ));

-- Export Jobs: users manage own exports
CREATE POLICY "Users can view own export jobs" ON public.export_jobs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own export jobs" ON public.export_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- REALTIME PUBLICATION SETUP
-- ============================================================================
-- Enable realtime for tables that need instant frontend updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors;
