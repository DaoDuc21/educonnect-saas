-- ============================================================================
-- EDUCONNECT SAAS - PRODUCTION DATABASE SCHEMA
-- PostgreSQL 16
-- Requirements: Fast Querying (B-Tree/GIN/Trigram), High Sync (OCC & Changelog), Future-Proof (Branch/Multi-tenant)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. SYSTEM & BRANCHES (Multi-branch / Multi-tenant scalability)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'branch-main',
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default main branch
INSERT INTO branches (id, code, name, address, phone)
VALUES ('branch-main', 'MAIN', 'EduConnect Central Campus', 'Hà Nội, Việt Nam', '0988-123-456')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. USERS & PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) DEFAULT 'branch-main' REFERENCES branches(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT '',
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'tutor', 'student', 'parent')),
    admin_role VARCHAR(30) CHECK (admin_role IN ('super_admin', 'academic_coordinator', 'admissions') OR admin_role IS NULL),
    title VARCHAR(100) DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    last_login TIMESTAMPTZ,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS classrooms (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) DEFAULT 'branch-main' REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) DEFAULT 'physical' CHECK (type IN ('physical', 'online', 'lab')),
    capacity INT NOT NULL DEFAULT 30,
    facilities TEXT[] DEFAULT '{}',
    location VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tutor_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    hourly_rate NUMERIC(12, 2) DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    completed_hours_month NUMERIC(6, 1) DEFAULT 0,
    total_earnings_month NUMERIC(14, 2) DEFAULT 0,
    active_classes_count INT DEFAULT 0,
    salary_status VARCHAR(30) DEFAULT 'approved',
    degrees TEXT[] DEFAULT '{}',
    experience_years INT DEFAULT 1,
    achievements TEXT[] DEFAULT '{}',
    quote TEXT DEFAULT '',
    badge_title VARCHAR(100) DEFAULT '',
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    parent_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    grade VARCHAR(50) NOT NULL,
    overall_progress INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed')),
    tuition_status VARCHAR(20) DEFAULT 'paid' CHECK (tuition_status IN ('paid', 'pending', 'overdue')),
    study_streak_days INT DEFAULT 0,
    exam_goal JSONB,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS student_badges (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(30) NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    category VARCHAR(30) DEFAULT 'grade',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. COURSES & ENROLLMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) DEFAULT 'branch-main' REFERENCES branches(id) ON DELETE SET NULL,
    code VARCHAR(30),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    tutor_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    tutor_name VARCHAR(150),
    tutor_avatar TEXT,
    tutor_title VARCHAR(100),
    duration VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    original_price NUMERIC(12, 2),
    schedule_description VARCHAR(255),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    enrolled_count INT DEFAULT 0,
    max_students INT DEFAULT 30,
    features TEXT[] DEFAULT '{}',
    banner_image TEXT,
    commitment_badge VARCHAR(100),
    target_audience TEXT,
    course_overview TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS course_registrations (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    tutor_name VARCHAR(150),
    price NUMERIC(12, 2) DEFAULT 0,
    duration VARCHAR(100),
    schedule_description VARCHAR(255),
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    student_name VARCHAR(150) NOT NULL,
    student_phone VARCHAR(30) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    target_goal TEXT,
    selected_schedule VARCHAR(255) NOT NULL,
    learning_format VARCHAR(20) DEFAULT 'online' CHECK (learning_format IN ('online', 'offline')),
    confirmed_terms BOOLEAN DEFAULT TRUE,
    center_status VARCHAR(20) DEFAULT 'pending' CHECK (center_status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(100),
    assigned_room VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    payment_code VARCHAR(50) NOT NULL,
    paid_at TIMESTAMPTZ,
    current_step INT DEFAULT 1,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. SMART SCHEDULING & ATTENDANCE (With Conflict Detection Constraints)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_events (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) DEFAULT 'branch-main' REFERENCES branches(id) ON DELETE SET NULL,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    date_str VARCHAR(15) NOT NULL, -- YYYY-MM-DD
    start_time VARCHAR(10) NOT NULL, -- HH:mm
    end_time VARCHAR(10) NOT NULL, -- HH:mm
    start_hour NUMERIC(4, 2) NOT NULL,
    duration_hours NUMERIC(4, 2) NOT NULL,
    tutor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_name VARCHAR(150) NOT NULL,
    tutor_avatar TEXT,
    room VARCHAR(100) NOT NULL,
    room_capacity INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    student_ids TEXT[] DEFAULT '{}',
    student_names TEXT[] DEFAULT '{}',
    online_meeting_url TEXT,
    document_url TEXT,
    description TEXT,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL REFERENCES schedule_events(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_avatar TEXT,
    date VARCHAR(15) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'late', 'absent')),
    remarks TEXT DEFAULT '',
    comprehension_rating INT DEFAULT 5 CHECK (comprehension_rating BETWEEN 1 AND 5),
    homework_score NUMERIC(4, 1),
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. TUITION & INVOICES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_invoices (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) DEFAULT 'branch-main' REFERENCES branches(id) ON DELETE SET NULL,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    due_date VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    payment_date VARCHAR(20),
    payment_code VARCHAR(50) NOT NULL,
    sessions_count INT NOT NULL DEFAULT 24,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. HOMEWORK & SUBMISSIONS (With Rubric Scoring)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS homework_assignments (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES schedule_events(id) ON DELETE SET NULL,
    session_title VARCHAR(255),
    subject VARCHAR(50) NOT NULL,
    tutor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_name VARCHAR(150) NOT NULL,
    tutor_avatar TEXT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    attachment_url TEXT,
    assigned_date VARCHAR(20) NOT NULL,
    due_date VARCHAR(25) NOT NULL,
    total_score NUMERIC(5, 2) DEFAULT 10.0,
    student_ids TEXT[] DEFAULT '{}',
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework_submissions (
    id VARCHAR(50) PRIMARY KEY,
    homework_id VARCHAR(50) NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_avatar TEXT,
    status VARCHAR(25) DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'submitted', 'graded')),
    submitted_at TIMESTAMPTZ,
    submission_text TEXT,
    submission_file_url TEXT,
    score NUMERIC(4, 1),
    tutor_feedback TEXT,
    comprehension_rating INT,
    rubric_scores JSONB DEFAULT '[]'::jsonb,
    graded_at TIMESTAMPTZ,
    graded_by VARCHAR(100),
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. QUIZZES & KNOWLEDGE GAP ENGINE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 45,
    total_questions INT NOT NULL DEFAULT 10,
    passing_score NUMERIC(4, 2) DEFAULT 5.0,
    assigned_date VARCHAR(25) NOT NULL,
    due_date VARCHAR(25) NOT NULL,
    difficulty_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    order_number INT NOT NULL,
    content TEXT NOT NULL,
    difficulty_level VARCHAR(30) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    options JSONB NOT NULL, -- Array of {id, label, content}
    correct_option_id VARCHAR(20) NOT NULL,
    explanation TEXT,
    points NUMERIC(4, 2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    quiz_title VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_avatar TEXT,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL,
    score NUMERIC(4, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted',
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    gap_report JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. ADMISSIONS & LEADS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admissions_leads (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) DEFAULT 'branch-main' REFERENCES branches(id) ON DELETE SET NULL,
    student_name VARCHAR(150) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(30) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    desired_course VARCHAR(255) NOT NULL,
    consultant_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    consultant_name VARCHAR(150),
    status VARCHAR(30) DEFAULT 'consulting' CHECK (status IN ('consulting', 'trial_lesson', 'enrolled', 'pending_provision', 'provisioned')),
    notes TEXT,
    requested_at TIMESTAMPTZ,
    provisioned_at TIMESTAMPTZ,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS & RESOURCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    target_role VARCHAR(50) NOT NULL,
    target_user_id VARCHAR(50),
    target_tab VARCHAR(50),
    action_url TEXT,
    entity_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_resources (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    file_url TEXT NOT NULL,
    file_size VARCHAR(30),
    recording_date VARCHAR(20),
    duration VARCHAR(50),
    description TEXT,
    uploaded_by VARCHAR(100),
    grade_level VARCHAR(50),
    subject VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. CHAT & CONVERSATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
    course_id VARCHAR(50),
    course_title VARCHAR(255),
    participants JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_message TEXT,
    last_message_time VARCHAR(30),
    unread_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    ticket_status VARCHAR(30) DEFAULT 'open',
    pinned_announcement JSONB,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(150) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. HIGH SYNCHRONIZATION: AUDIT & SYNC CHANGELOG (Event-Driven Sync)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_changelog (
    id BIGSERIAL PRIMARY KEY,
    entity_table VARCHAR(60) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    version INT NOT NULL DEFAULT 1,
    client_id VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. PERFORMANCE INDEXES (Optimized for Sub-millisecond Execution)
-- ----------------------------------------------------------------------------
-- Schedule Conflict & Time Range Queries
CREATE INDEX IF NOT EXISTS idx_sched_room_date_time ON schedule_events (room, date_str, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_sched_tutor_date_time ON schedule_events (tutor_id, date_str, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_sched_date ON schedule_events (date_str);
CREATE INDEX IF NOT EXISTS idx_sched_course ON schedule_events (course_id);

-- Attendance & Student Queries
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records (session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records (date);

-- Homework & Submissions
CREATE INDEX IF NOT EXISTS idx_homework_tutor ON homework_assignments (tutor_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework_assignments (due_date);
CREATE INDEX IF NOT EXISTS idx_submissions_hw_student ON homework_submissions (homework_id, student_id);

-- Invoices & Registrations
CREATE INDEX IF NOT EXISTS idx_invoices_student_status ON tuition_invoices (student_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_code ON tuition_invoices (payment_code);
CREATE INDEX IF NOT EXISTS idx_registrations_course ON course_registrations (course_id);
CREATE INDEX IF NOT EXISTS idx_registrations_step ON course_registrations (current_step, center_status);

-- Quizzes & Bloom Taxonomy Knowledge Gap
CREATE INDEX IF NOT EXISTS idx_quiz_course ON quizzes (course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions (topic);
CREATE INDEX IF NOT EXISTS idx_quiz_sub_student ON quiz_submissions (student_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sub_gap_report ON quiz_submissions USING gin (gap_report);

-- Fast Trigram Full-Text Search
CREATE INDEX IF NOT EXISTS idx_courses_title_trgm ON courses USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Sync Changelog Real-time Query
CREATE INDEX IF NOT EXISTS idx_sync_changelog_created ON sync_changelog (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_changelog_entity ON sync_changelog (entity_table, entity_id);

-- Chat messages order
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages (conversation_id, created_at ASC);

-- ----------------------------------------------------------------------------
-- 13. AUTOMATED TRIGGERS FOR TIMESTAMPS & CHANGELOG
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF TG_OP = 'UPDATE' THEN
    NEW.version = COALESCE(OLD.version, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to core tables
DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_courses ON courses;
CREATE TRIGGER set_timestamp_courses BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_schedule ON schedule_events;
CREATE TRIGGER set_timestamp_schedule BEFORE UPDATE ON schedule_events FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_attendance ON attendance_records;
CREATE TRIGGER set_timestamp_attendance BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_invoices ON tuition_invoices;
CREATE TRIGGER set_timestamp_invoices BEFORE UPDATE ON tuition_invoices FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_homework ON homework_assignments;
CREATE TRIGGER set_timestamp_homework BEFORE UPDATE ON homework_assignments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_submissions ON homework_submissions;
CREATE TRIGGER set_timestamp_submissions BEFORE UPDATE ON homework_submissions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
