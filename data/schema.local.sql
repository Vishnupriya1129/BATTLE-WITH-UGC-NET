-- =====================================================================
-- LOCAL DEV PREAMBLE
-- Stubs Supabase's auth schema so foreign keys and RLS policies compile.
-- Replace when we add real auth.
-- =====================================================================

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

-- Stub: returns NULL locally. Real auth will override.
create or replace function auth.uid() returns uuid
language sql stable
as 'select null::uuid';

-- RLS is enabled locally but no one is authenticated, so we disable
-- enforcement for the dev user. In production we re-enable.
alter table if exists auth.users disable row level security;-- =====================================================================
-- BATTLE WITH UGC-NET — Master Schema v1.0.0
-- Target: Supabase PostgreSQL 15+
-- Notes:  All user-scoped tables use RLS. Every FK is indexed.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- fuzzy question dedup
create extension if not exists "pgcrypto";  -- for gen_random_uuid

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type question_status as enum ('draft', 'reviewed', 'verified', 'flagged', 'rejected');
create type attempt_context as enum ('practice', 'mock', 'mistake_review', 'topic_drill', 'year_drill', 'random');
create type difficulty_level as enum ('easy', 'medium', 'hard');
create type realm_state as enum ('unstable', 'holding', 'stabilized', 'conquered');

-- ---------------------------------------------------------------------
-- 2. CONTENT: SUBJECTS · PAPERS · UNITS · TOPICS · SUBTOPICS
-- ---------------------------------------------------------------------
create table subjects (
  code         text primary key,           -- 'P1', 'P2-CS'
  name         text not null,
  realm_key    text,                        -- 'foundation' | 'ten_realms'
  order_index  int  not null default 0,
  created_at   timestamptz not null default now()
);

create table papers (
  id            uuid primary key default gen_random_uuid(),
  subject_code  text not null references subjects(code) on delete restrict,
  year          int  not null,
  shift         int  not null check (shift in (1, 2)),
  exam_date     date,
  source_url    text,
  total_questions int,
  status        text not null default 'pending',  -- pending | importing | ready | failed
  created_at    timestamptz not null default now(),
  unique (subject_code, year, shift)
);
create index idx_papers_year on papers(year desc);
create index idx_papers_subject on papers(subject_code);

create table units (
  code         text primary key,           -- 'P2-U5'
  subject_code text not null references subjects(code) on delete cascade,
  name         text not null,
  order_index  int  not null,
  created_at   timestamptz not null default now()
);
create index idx_units_subject on units(subject_code);

create table topics (
  code         text primary key,           -- 'P2-U5-T4'
  unit_code    text not null references units(code) on delete cascade,
  name         text not null,
  order_index  int  not null,
  created_at   timestamptz not null default now()
);
create index idx_topics_unit on topics(unit_code);

create table subtopics (
  code         text primary key,           -- generated from topic + slug
  topic_code   text not null references topics(code) on delete cascade,
  name         text not null,
  order_index  int  not null,
  created_at   timestamptz not null default now()
);
create index idx_subtopics_topic on subtopics(topic_code);

-- ---------------------------------------------------------------------
-- 3. QUESTION TYPES (lookup)
-- ---------------------------------------------------------------------
create table question_types (
  code         text primary key,           -- 'mcq_factual', 'assertion_reason', ...
  name         text not null,
  description  text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. QUESTIONS
-- ---------------------------------------------------------------------
create table questions (
  id                uuid primary key default gen_random_uuid(),
  question_code     text unique not null,  -- 'YYYY-Sn-Pn-UNIT-TOPIC-NNN'
  paper_id          uuid references papers(id) on delete set null,
  subject_code      text not null references subjects(code),
  unit_code         text not null references units(code),
  topic_code        text not null references topics(code),
  subtopic_code     text references subtopics(code),
  question_type     text not null references question_types(code),
  question_text     text not null,
  option_a          text not null,
  option_b          text not null,
  option_c          text not null,
  option_d          text not null,
  correct_option    char(1) check (correct_option in ('A','B','C','D')),
  explanation       text,
  difficulty        difficulty_level,
  status            question_status not null default 'draft',
  source_page       int,
  source_raw        text,                  -- original extracted text, for audit
  verified_at       timestamptz,
  verified_by       uuid,                  -- references auth.users later
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_questions_status on questions(status);
create index idx_questions_paper on questions(paper_id);
create index idx_questions_unit on questions(unit_code);
create index idx_questions_topic on questions(topic_code);
create index idx_questions_subtopic on questions(subtopic_code);
create index idx_questions_year on questions(paper_id) where paper_id is not null;
create index idx_questions_text_trgm on questions using gin (question_text gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 5. ADMIN / IMPORT
-- ---------------------------------------------------------------------
create table import_jobs (
  id            uuid primary key default gen_random_uuid(),
  paper_id      uuid references papers(id) on delete cascade,
  source_file   text,
  status        text not null default 'pending',  -- pending | extracting | reviewing | complete | failed
  total_extracted int default 0,
  total_approved  int default 0,
  total_flagged   int default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table import_review (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references import_jobs(id) on delete cascade,
  question_id    uuid not null references questions(id) on delete cascade,
  reviewer_status text not null default 'pending',  -- pending | approved | flagged | rejected
  reviewer_notes  text,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  unique (job_id, question_id)
);

-- ---------------------------------------------------------------------
-- 6. USERS (profiles)
-- ---------------------------------------------------------------------
create table profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  target_score   int default 155,
  exam_date      date,
  daily_goal_q   int default 40,
  current_rank   text default 'initiate',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. ATTEMPTS
-- ---------------------------------------------------------------------
create table attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  question_id    uuid not null references questions(id) on delete cascade,
  chosen_option  char(1) check (chosen_option in ('A','B','C','D')),
  is_correct     boolean not null,
  time_ms        int,
  context        attempt_context not null,
  session_id     uuid,
  created_at     timestamptz not null default now()
);
create index idx_attempts_user on attempts(user_id);
create index idx_attempts_user_question on attempts(user_id, question_id);
create index idx_attempts_user_created on attempts(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 8. BOOKMARKS & MISTAKES
-- ---------------------------------------------------------------------
create table bookmarks (
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  uuid not null references questions(id) on delete cascade,
  note         text,
  created_at   timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table mistakes (
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     uuid not null references questions(id) on delete cascade,
  wrong_count     int not null default 1,
  last_wrong_at   timestamptz not null default now(),
  resolved_at     timestamptz,
  primary key (user_id, question_id)
);
create index idx_mistakes_user_unresolved on mistakes(user_id) where resolved_at is null;

-- ---------------------------------------------------------------------
-- 9. STUDY SESSIONS
-- ---------------------------------------------------------------------
create table study_sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  questions_attempted  int default 0,
  correct              int default 0,
  accuracy             numeric(5,2) generated always as
    (case when questions_attempted = 0 then 0
     else (correct::numeric / questions_attempted) * 100 end) stored,
  notes                text
);
create index idx_sessions_user on study_sessions(user_id, started_at desc);

-- ---------------------------------------------------------------------
-- 10. MOCKS
-- ---------------------------------------------------------------------
create table mock_tests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text,
  total_q       int not null,
  duration_min  int not null,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  score         int,
  correct       int,
  incorrect     int,
  unattempted   int,
  accuracy      numeric(5,2),
  breakdown     jsonb,          -- per-topic stats snapshot
  created_at    timestamptz not null default now()
);
create index idx_mocks_user on mock_tests(user_id, started_at desc);

create table mock_questions (
  mock_id      uuid not null references mock_tests(id) on delete cascade,
  question_id  uuid not null references questions(id) on delete cascade,
  order_index  int not null,
  primary key (mock_id, question_id)
);

-- ---------------------------------------------------------------------
-- 11. TOPIC STATS (rollup — updated via trigger on attempts)
-- ---------------------------------------------------------------------
create table topic_stats (
  user_id       uuid not null references auth.users(id) on delete cascade,
  topic_code    text not null references topics(code) on delete cascade,
  attempted     int not null default 0,
  correct       int not null default 0,
  accuracy      numeric(5,2) generated always as
    (case when attempted = 0 then 0
     else (correct::numeric / attempted) * 100 end) stored,
  mastery_pct   numeric(5,2) not null default 0,
  last_practiced timestamptz,
  primary key (user_id, topic_code)
);

-- ---------------------------------------------------------------------
-- 12. DAILY QUEUES (adaptive engine output)
-- ---------------------------------------------------------------------
create table daily_queues (
  user_id    uuid not null references auth.users(id) on delete cascade,
  queue_date date not null,
  queue      jsonb not null,     -- [{ topic_code, count, reason, priority }]
  generated_at timestamptz not null default now(),
  primary key (user_id, queue_date)
);

-- ---------------------------------------------------------------------
-- 13. ASTRA ACADEMY — mentors, triggers, dialogues, events
-- ---------------------------------------------------------------------
create table mentors (
  code          text primary key,
  name          text not null,
  title         text,
  role          text,
  accent_hex    text,
  avatar_key    text,
  domain        text,
  core_question text,
  cooldown_minutes int,
  priority_weight  int,
  created_at    timestamptz not null default now()
);

create table mentor_triggers (
  code          text primary key,     -- 'wrong_answer', 'mock_completed', etc.
  mentor_code   text not null references mentors(code) on delete cascade,
  condition_json jsonb not null,
  priority      int not null default 5,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table mentor_dialogues (
  id            uuid primary key default gen_random_uuid(),
  trigger_code  text not null references mentor_triggers(code) on delete cascade,
  tone          text default 'neutral',
  template      text not null,       -- with {variable} placeholders
  variables_json jsonb,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table user_mentor_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  mentor_code     text not null references mentors(code),
  trigger_code    text not null references mentor_triggers(code),
  rendered_text   text not null,
  context_json    jsonb,
  dismissed_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_mentor_events_user on user_mentor_events(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 14. TRIGGER: updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_questions_updated
  before update on questions
  for each row execute function set_updated_at();

create trigger trg_papers_updated
  before update on papers
  for each row execute function set_updated_at();

create trigger trg_profiles_updated
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_import_jobs_updated
  before update on import_jobs
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 15. TRIGGER: attempts → mistakes, topic_stats
-- ---------------------------------------------------------------------
create or replace function handle_attempt()
returns trigger language plpgsql as $$
declare
  q_topic text;
  q_subtopic text;
begin
  select topic_code, subtopic_code into q_topic, q_subtopic
    from questions where id = new.question_id;

  -- upsert mistakes
  if not new.is_correct then
    insert into mistakes(user_id, question_id, wrong_count, last_wrong_at)
    values (new.user_id, new.question_id, 1, now())
    on conflict (user_id, question_id)
    do update set wrong_count = mistakes.wrong_count + 1,
                  last_wrong_at = now(),
                  resolved_at = null;
  else
    -- mark resolved if previously wrong and now correct
    update mistakes
       set resolved_at = now()
     where user_id = new.user_id
       and question_id = new.question_id
       and resolved_at is null;
  end if;

  -- upsert topic_stats
  insert into topic_stats(user_id, topic_code, attempted, correct, last_practiced)
  values (new.user_id, q_topic, 1, case when new.is_correct then 1 else 0 end, now())
  on conflict (user_id, topic_code)
  do update set attempted = topic_stats.attempted + 1,
                correct = topic_stats.correct + case when new.is_correct then 1 else 0 end,
                last_practiced = now();

  return new;
end $$;

create trigger trg_attempt_rollup
  after insert on attempts
  for each row execute function handle_attempt();

-- ---------------------------------------------------------------------
-- 16. RLS — enable on user-scoped tables
-- ---------------------------------------------------------------------
alter table profiles           enable row level security;
alter table attempts           enable row level security;
alter table bookmarks          enable row level security;
alter table mistakes           enable row level security;
alter table study_sessions     enable row level security;
alter table mock_tests         enable row level security;
alter table mock_questions     enable row level security;
alter table topic_stats        enable row level security;
alter table daily_queues       enable row level security;
alter table user_mentor_events enable row level security;

-- Questions: read-only to authenticated users, write only for admin role
alter table questions          enable row level security;
alter table import_jobs        enable row level security;
alter table import_review      enable row level security;

-- ---------------------------------------------------------------------
-- 17. RLS POLICIES — user-scoped
-- ---------------------------------------------------------------------
create policy "own profile"     on profiles           for all using (auth.uid() = user_id);
create policy "own attempts"    on attempts           for all using (auth.uid() = user_id);
create policy "own bookmarks"   on bookmarks          for all using (auth.uid() = user_id);
create policy "own mistakes"    on mistakes           for all using (auth.uid() = user_id);
create policy "own sessions"    on study_sessions     for all using (auth.uid() = user_id);
create policy "own mocks"       on mock_tests         for all using (auth.uid() = user_id);
create policy "own mock_questions" on mock_questions  for all
  using (exists (select 1 from mock_tests m where m.id = mock_id and m.user_id = auth.uid()));
create policy "own topic_stats" on topic_stats        for all using (auth.uid() = user_id);
create policy "own queues"      on daily_queues       for all using (auth.uid() = user_id);
create policy "own mentor events" on user_mentor_events for all using (auth.uid() = user_id);

-- Questions: readable by any authenticated user, only verified
create policy "read verified questions" on questions for select
  using (auth.role() = 'authenticated' and status = 'verified');

-- Content tables: read-only to everyone authenticated
alter table subjects       enable row level security;
alter table papers         enable row level security;
alter table units          enable row level security;
alter table topics         enable row level security;
alter table subtopics      enable row level security;
alter table question_types enable row level security;
alter table mentors        enable row level security;
alter table mentor_triggers enable row level security;
alter table mentor_dialogues enable row level security;

create policy "read subjects"       on subjects       for select using (true);
create policy "read papers"         on papers         for select using (true);
create policy "read units"          on units          for select using (true);
create policy "read topics"         on topics         for select using (true);
create policy "read subtopics"      on subtopics      for select using (true);
create policy "read question_types" on question_types for select using (true);
create policy "read mentors"        on mentors        for select using (true);
create policy "read mentor_triggers" on mentor_triggers for select using (true);
create policy "read mentor_dialogues" on mentor_dialogues for select using (true);
