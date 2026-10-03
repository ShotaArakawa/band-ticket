-- 本実装用のテーブル定義案(雛形段階では未適用。src/lib/types.ts と対応)

create table bands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  contact_email text not null,
  owner_id uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references bands (id) on delete cascade,
  title text not null,
  venue text not null,
  starts_at timestamptz not null,
  price_advance integer not null check (price_advance >= 0),
  price_door integer not null check (price_door >= 0),
  capacity integer not null check (capacity > 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  email text not null,
  quantity integer not null check (quantity between 1 and 10),
  via text not null default '',
  message text not null default '',
  status text not null default 'reserved' check (status in ('reserved', 'cancelled')),
  created_at timestamptz not null default now()
);

create index on events (band_id, starts_at);
create index on reservations (event_id);

-- TODO: RLS ポリシー
--  - bands/events: 誰でも select 可、insert/update は owner のみ
--  - reservations: insert は RPC(残数チェック込み)経由のみ、select は該当バンドの owner のみ
