-- Code Reviewer Rotation App - Supabase DB Schema
-- Authoritative schema source (can be used by Cursor or other tools to understand structure)

-- ==============================
-- PROFILES
-- ==============================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_admin boolean default false,
  user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================
-- PROJECTS
-- ==============================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rotation_period_days int not null default 15,
  rotation_start_day date not null,
  reviewers_count int not null default 2,
  state text not null check (state in ('draft', 'active', 'inactive')),
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================
-- ROTATIONS
-- ==============================
create table if not exists rotations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  manually_triggered boolean default false,
  is_final boolean default false,
  created_at timestamp with time zone default now()
);

-- ==============================
-- ROTATION ASSIGNMENTS
-- ==============================
-- This links each assignee to one reviewer in a rotation
create table if not exists rotation_assignments (
  id uuid primary key default gen_random_uuid(),
  rotation_id uuid references rotations(id) on delete cascade,
  assignee_profile_id uuid references profiles(id),
  reviewer_profile_id uuid references profiles(id)
);

-- ==============================
-- ROTATION HISTORY
-- ==============================
-- Optional table to store historical snapshots for auditing/debugging
create table if not exists rotation_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  rotation_date date not null,
  snapshot jsonb not null,
  created_at timestamp with time zone default now()
);

-- ==============================
-- USER PERMISSIONS
-- ==============================
-- Optional if fine-grained permission beyond is_admin is needed
create table if not exists user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  permission_level text not null check (permission_level in ('view', 'edit')),
  constraint unique_user_permission unique (user_id)
);

-- ==============================
-- NOTES FOR CURSOR / DEVELOPERS
-- ==============================

-- auth.users: Supabase Auth table (used for login). Linked to profiles.user_id
-- profiles: Identity layer for users; can exist without an auth user initially
-- projects: Group of developers (assignees/reviewers) with rotation settings
-- rotations: Generated rotation cycles, automatic or manual
-- rotation_assignments: The many-to-many link between assignees and reviewers per rotation
-- rotation_history: Snapshots saved only when automatic rotation runs
-- state: Project status: 'draft' (not rotating), 'active' (live rotation), 'inactive' (archived)
-- RLS should protect profiles, projects, and rotations using profile ownership or admin rules.
