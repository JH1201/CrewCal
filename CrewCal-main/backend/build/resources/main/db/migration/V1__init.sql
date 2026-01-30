create table if not exists users (
  id bigserial primary key,
  email varchar(255) unique not null,
  password_hash varchar(255) null,
  display_name varchar(80) not null,
  provider varchar(30) not null default 'EMAIL', -- EMAIL / GOOGLE
  provider_id varchar(255) null,
  created_at timestamptz not null default now()
);

create table if not exists calendars (
  id bigserial primary key,
  name varchar(120) not null,
  color varchar(20) not null default '#4f46e5',
  created_by bigint not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calendar_members (
  calendar_id bigint not null references calendars(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  role varchar(20) not null,
  created_at timestamptz not null default now(),
  primary key (calendar_id, user_id)
);

create table if not exists calendar_invites (
  id bigserial primary key,
  calendar_id bigint not null references calendars(id) on delete cascade,
  invitee_email varchar(255) not null,
  role varchar(20) not null,
  token varchar(128) unique not null,
  status varchar(20) not null default 'PENDING', -- PENDING/ACCEPTED/DECLINED/REVOKED/EXPIRED
  invited_by bigint not null references users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists events (
  id bigserial primary key,
  calendar_id bigint not null references calendars(id) on delete cascade,
  title varchar(200) not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  note text null,
  created_by bigint not null references users(id),
  updated_by bigint not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists event_reminders (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  minutes_before int not null,
  method varchar(20) not null default 'IN_APP'
);

create index if not exists idx_events_calendar_time on events(calendar_id, start_at, end_at);
create index if not exists idx_invites_token on calendar_invites(token);
