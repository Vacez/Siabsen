-- ==============================================================================
-- PROJECT: SIABSEN — SMART EMPLOYEE ATTENDANCE SYSTEM
-- DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: PostgreSQL 15+ / Supabase
-- Timezone Standard: Asia/Jakarta (WIB, UTC+7)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('employee', 'admin');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'leave');
CREATE TYPE work_mode AS ENUM ('WFO', 'WFH');
CREATE TYPE leave_category AS ENUM ('cuti', 'izin', 'sakit');
CREATE TYPE leave_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE notification_category AS ENUM ('info', 'success', 'warning', 'alert');

-- ------------------------------------------------------------------------------
-- 2. TABLE: PROFILES (Karyawan & Admin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone VARCHAR(30),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_schedule VARCHAR(100) NOT NULL DEFAULT 'Senin - Jumat (08:30 - 17:30)',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    remaining_leave_days INT NOT NULL DEFAULT 12 CHECK (remaining_leave_days >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ------------------------------------------------------------------------------
-- 3. TABLE: COMPANY_SETTINGS (Aturan Jam Kantor & Geofence GPS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
    id INT PRIMARY KEY DEFAULT 1,
    office_name VARCHAR(150) NOT NULL DEFAULT 'SiAbsen HQ - Menara Mandiri Sudirman',
    latitude DOUBLE PRECISION NOT NULL DEFAULT -6.2255,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 106.8093,
    geofence_radius_meters INT NOT NULL DEFAULT 250,
    work_start_time TIME NOT NULL DEFAULT '08:30:00',
    work_end_time TIME NOT NULL DEFAULT '17:30:00',
    late_tolerance_minutes INT NOT NULL DEFAULT 15,
    allow_remote_work BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row_settings CHECK (id = 1)
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: ATTENDANCE (Presensi Check-In & Check-Out)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta'),
    check_in_time TIME NOT NULL DEFAULT (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta'),
    check_out_time TIME,
    work_duration_hours INT DEFAULT 0,
    work_duration_minutes INT DEFAULT 0,
    status attendance_status NOT NULL DEFAULT 'present',
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    late_minutes INT NOT NULL DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    work_type work_mode NOT NULL DEFAULT 'WFO',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate check-in by employee on the exact same workday
    CONSTRAINT unique_user_attendance_per_day UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

-- ------------------------------------------------------------------------------
-- 5. TABLE: LEAVE_REQUESTS (Pengajuan Cuti, Izin, Sakit)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type leave_category NOT NULL,
    sub_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL DEFAULT 1 CHECK (days_count > 0),
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status leave_request_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Date logic validation
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_user ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON public.leave_requests(start_date, end_date);

-- ------------------------------------------------------------------------------
-- 6. TABLE: NOTIFICATIONS (Notifikasi Dalam Aplikasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means broadcast to all
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_category NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    related_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- ------------------------------------------------------------------------------
-- 7. TABLE: AUDIT_LOGS (Integritas, Audit Trail & Tracking Keamanan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PROFILES POLICIES ---
-- Any authenticated user can read directory profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own phone or name
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Only Admins can insert or delete profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin());

-- --- COMPANY SETTINGS POLICIES ---
-- All authenticated users can read settings
CREATE POLICY "Company settings are viewable by all"
ON public.company_settings FOR SELECT
TO authenticated
USING (true);

-- Only Admins can modify company settings
CREATE POLICY "Admins can update company settings"
ON public.company_settings FOR UPDATE
TO authenticated
USING (public.is_admin());

-- --- ATTENDANCE POLICIES ---
-- Employees can view only their own attendance; Admins can view all
CREATE POLICY "Employees can view own attendance; Admins view all"
ON public.attendance FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Employees can insert their own attendance for today
CREATE POLICY "Employees can check-in for themselves"
ON public.attendance FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Employees can update check-out for their own record today
CREATE POLICY "Employees can check-out their own record"
ON public.attendance FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- --- LEAVE REQUESTS POLICIES ---
-- Employees can view own requests; Admins view all
CREATE POLICY "Leave requests visibility"
ON public.leave_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Employees can submit leave requests with 'pending' status
CREATE POLICY "Employees can submit leave requests"
ON public.leave_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Employees can cancel their own 'pending' requests
CREATE POLICY "Employees can cancel own pending requests"
ON public.leave_requests FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (status = 'cancelled');

-- Admins can update any request to approved or rejected
CREATE POLICY "Admins can review leave requests"
ON public.leave_requests FOR UPDATE
TO authenticated
USING (public.is_admin());

-- --- NOTIFICATIONS POLICIES ---
CREATE POLICY "Users view own notifications and broadcasts"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can mark own notifications as read"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- --- AUDIT LOGS POLICIES ---
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. STORED PROCEDURES / SECURE RPC FUNCTIONS
-- ------------------------------------------------------------------------------

-- SECURE SERVER-SIDE CHECK-IN (TAMPER-PROOF TIMESTAMP)
CREATE OR REPLACE FUNCTION public.rpc_secure_check_in(
    p_work_type work_mode,
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_today DATE := (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE;
    v_current_time TIME := (NOW() AT TIME ZONE 'Asia/Jakarta')::TIME;
    v_settings public.company_settings%ROWTYPE;
    v_start_min INT;
    v_current_min INT;
    v_diff INT;
    v_is_late BOOLEAN := FALSE;
    v_late_minutes INT := 0;
    v_new_record public.attendance%ROWTYPE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Autentikasi diperlukan.';
    END IF;

    -- Check duplicate
    IF EXISTS (SELECT 1 FROM public.attendance WHERE user_id = v_user_id AND date = v_today) THEN
        RAISE EXCEPTION 'Anda sudah melakukan presensi masuk hari ini.';
    END IF;

    -- Get Settings
    SELECT * INTO v_settings FROM public.company_settings WHERE id = 1;

    -- Compute late calculation server-side
    v_start_min := EXTRACT(HOUR FROM v_settings.work_start_time) * 60 + EXTRACT(MINUTE FROM v_settings.work_start_time);
    v_current_min := EXTRACT(HOUR FROM v_current_time) * 60 + EXTRACT(MINUTE FROM v_current_time);
    v_diff := v_current_min - v_start_min;

    IF v_diff > v_settings.late_tolerance_minutes THEN
        v_is_late := TRUE;
        v_late_minutes := v_diff - v_settings.late_tolerance_minutes;
    END IF;

    -- Insert record
    INSERT INTO public.attendance (
        user_id,
        date,
        check_in_time,
        status,
        is_late,
        late_minutes,
        latitude,
        longitude,
        address,
        work_type,
        notes
    ) VALUES (
        v_user_id,
        v_today,
        v_current_time,
        CASE WHEN v_is_late THEN 'late'::attendance_status ELSE 'present'::attendance_status END,
        v_is_late,
        v_late_minutes,
        p_latitude,
        p_longitude,
        CASE WHEN p_work_type = 'WFO' THEN v_settings.office_name ELSE 'Lokasi Remote (WFH)' END,
        p_work_type,
        COALESCE(p_notes, CASE WHEN v_is_late THEN 'Terlambat ' || v_late_minutes || ' menit' ELSE 'Check-in tepat waktu' END)
    ) RETURNING * INTO v_new_record;

    -- Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (v_user_id, 'CHECK_IN', 'attendance', v_new_record.id::TEXT, row_to_json(v_new_record)::jsonb);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Check-in berhasil dicatat.',
        'check_in_time', v_current_time,
        'is_late', v_is_late,
        'late_minutes', v_late_minutes
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURE SERVER-SIDE REVIEW LEAVE REQUEST
CREATE OR REPLACE FUNCTION public.rpc_review_leave(
    p_request_id UUID,
    p_action leave_request_status,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_req public.leave_requests%ROWTYPE;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya Admin yang berhak menyetujui atau menolak permohonan.';
    END IF;

    SELECT * INTO v_req FROM public.leave_requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permohonan tidak ditemukan.';
    END IF;

    -- Update leave request
    UPDATE public.leave_requests
    SET status = p_action,
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        review_note = p_note,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- If approved and category is 'cuti', deduct leave days
    IF p_action = 'approved' AND v_req.type = 'cuti' THEN
        UPDATE public.profiles
        SET remaining_leave_days = GREATEST(0, remaining_leave_days - v_req.days_count)
        WHERE id = v_req.user_id;
    END IF;

    -- Send notification to employee
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
        v_req.user_id,
        CASE WHEN p_action = 'approved' THEN 'Pengajuan Disetujui ✅' ELSE 'Pengajuan Ditolak ❌' END,
        'Permohonan ' || v_req.sub_type || ' Anda telah ' || UPPER(p_action::TEXT) || '. ' || COALESCE(p_note, ''),
        CASE WHEN p_action = 'approved' THEN 'success'::notification_category ELSE 'alert'::notification_category END,
        v_req.id::TEXT
    );

    -- Log action
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (v_admin_id, 'REVIEW_LEAVE_' || UPPER(p_action::TEXT), 'leave_requests', v_req.id::TEXT, jsonb_build_object('status', p_action, 'note', p_note));

    RETURN jsonb_build_object('success', true, 'message', 'Keputusan berhasil disimpan.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 10. INITIAL SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.company_settings (id, office_name, latitude, longitude, geofence_radius_meters, work_start_time, work_end_time, late_tolerance_minutes, allow_remote_work)
VALUES (1, 'SiAbsen HQ - Menara Mandiri Sudirman', -6.2255, 106.8093, 250, '08:30:00', '17:30:00', 15, true)
ON CONFLICT (id) DO NOTHING;

