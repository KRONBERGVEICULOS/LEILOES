update platform_lots
set
  current_value_cents = reference_value_cents,
  updated_at = now()
where current_value_cents > coalesce(
  maximum_pre_bid_amount_cents,
  round(reference_value_cents * 1.35)::int
);

