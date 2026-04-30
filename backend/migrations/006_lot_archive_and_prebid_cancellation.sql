alter table if exists platform_pre_bids
  add column if not exists is_cancelled boolean not null default false;

alter table if exists platform_pre_bids
  add column if not exists cancelled_at timestamptz;

alter table if exists platform_pre_bids
  add column if not exists cancelled_reason text;

alter table if exists platform_pre_bids
  add column if not exists cancelled_by text;

update platform_lots
set
  status_key = case status_key
    when 'em-catalogo' then 'available'
    when 'sob-consulta' then 'in_review'
    when 'em-validacao' then 'in_review'
    when 'encerrado' then 'closed'
    else status_key
  end,
  updated_at = now()
where status_key in ('em-catalogo', 'sob-consulta', 'em-validacao', 'encerrado');

update platform_lots
set
  source_slug = slug,
  updated_at = now()
where source_slug is null
   or btrim(source_slug) = '';

update platform_lots
set
  is_visible = false,
  is_featured = false,
  updated_at = now()
where status_key = 'hidden'
  and (is_visible = true or is_featured = true);

with valid_lot_values as (
  select
    lots.id,
    coalesce(
      lots.maximum_pre_bid_amount_cents,
      round(lots.reference_value_cents * 1.35)::int
    ) as maximum_allowed_amount_cents,
    greatest(
      lots.reference_value_cents,
      coalesce(max(pre_bids.amount_cents), 0)
    ) as corrected_current_value_cents
  from platform_lots as lots
  left join platform_pre_bids as pre_bids
    on pre_bids.lot_slug = lots.slug
   and pre_bids.is_cancelled = false
   and pre_bids.amount_cents <= coalesce(
      lots.maximum_pre_bid_amount_cents,
      round(lots.reference_value_cents * 1.35)::int
    )
  group by
    lots.id,
    lots.reference_value_cents,
    lots.maximum_pre_bid_amount_cents
)
update platform_lots
set
  current_value_cents = valid_lot_values.corrected_current_value_cents,
  updated_at = now()
from valid_lot_values
where platform_lots.id = valid_lot_values.id
  and platform_lots.current_value_cents >
    valid_lot_values.maximum_allowed_amount_cents;

create index if not exists platform_pre_bids_active_lot_value_idx
  on platform_pre_bids (lot_slug, amount_cents desc, created_at desc)
  where is_cancelled = false;

create index if not exists platform_pre_bids_active_user_lot_idx
  on platform_pre_bids (user_id, lot_slug, created_at desc)
  where is_cancelled = false;
