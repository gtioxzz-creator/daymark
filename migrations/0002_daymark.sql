create table if not exists daymark_state (
  user_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
