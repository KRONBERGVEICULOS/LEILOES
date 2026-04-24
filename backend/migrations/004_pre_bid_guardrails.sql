alter table if exists platform_lots
  add column if not exists maximum_pre_bid_amount_cents integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_lots_maximum_pre_bid_amount_cents_check'
  ) then
    alter table platform_lots
      add constraint platform_lots_maximum_pre_bid_amount_cents_check
      check (
        maximum_pre_bid_amount_cents is null
        or maximum_pre_bid_amount_cents > 0
      );
  end if;
end $$;

alter table if exists platform_lots
  validate constraint platform_lots_maximum_pre_bid_amount_cents_check;

update platform_lots
set current_value_cents = greatest(
  reference_value_cents,
  current_value_cents,
  coalesce(live_pre_bids.top_amount_cents, 0)
)
from (
  select
    lot_slug,
    max(amount_cents)::int as top_amount_cents
  from platform_pre_bids
  group by lot_slug
) as live_pre_bids
where live_pre_bids.lot_slug = platform_lots.slug;

create index if not exists platform_pre_bids_lot_created_idx
  on platform_pre_bids (lot_slug, created_at desc);
